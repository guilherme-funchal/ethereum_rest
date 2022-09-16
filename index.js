var express = require('express');
var app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors());

var Web3 = require('web3')

require("dotenv").config();

const CONTACT_ABI = require('./config');
const CONTACT_ADDRESS = require('./config');


app.get('/dono', async function(req, res) {
    
    var web3 = new Web3('http://127.0.0.1:8545');
    var contratoInteligente = new web3.eth.Contract(CONTACT_ABI.CONTACT_ABI, CONTACT_ADDRESS.CONTACT_ADDRESS);
    let owner = await contratoInteligente.methods.owner().call(function (err, res) {
      if (err) {
        console.log("Ocorreu um erro", err)
        return
      }
      console.log("O dono é: ", res)
    }); 
    res.status(200).send(owner);

});

app.get('/transacao', async function(req, res) {
  try {
    var web3 = new Web3('http://127.0.0.1:8545');  
  //  let block = new web3.eth.getTransactionCount("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266").then(console.log);
    var contratoInteligente = new web3.eth.Contract(CONTACT_ABI.CONTACT_ABI, CONTACT_ADDRESS.CONTACT_ADDRESS);
    const events = await contratoInteligente.getPastEvents();
    console.log(events)
    res.status(200).send(events);
  } catch (e) {
    console.error(e)
  } 
});

app.get('/saldo', async function(req, res) {
  let conta = req.query.conta;  
  console.log("conta: ", conta)

  var web3 = new Web3('http://127.0.0.1:8545');
  var contratoInteligente = new web3.eth.Contract(CONTACT_ABI.CONTACT_ABI, CONTACT_ADDRESS.CONTACT_ADDRESS);

  let owner = await contratoInteligente.methods.balanceOf(conta,"1").call(function (err, res) {
    if (err) {
      console.log("Ocorreu um erro", err)
      return
    }
    console.log("O saldo é: ", res)
  }); 
  res.status(200).send(owner);

});

app.post('/emitir', async function(req, res) {

  let account = req.body.account;
  let id = req.body.id;
  let amount = req.body.amount;
  let data = req.body.data;
  

  const network = process.env.ETHEREUM_NETWORK;

  const web3 = new Web3(
    new Web3.providers.HttpProvider(
      `http://127.0.0.1:8545`
    )
  );
  const signer = web3.eth.accounts.privateKeyToAccount(
    process.env.SIGNER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(signer);  
  var contratoInteligente = new web3.eth.Contract(CONTACT_ABI.CONTACT_ABI, CONTACT_ADDRESS.CONTACT_ADDRESS);
  
  const tx = contratoInteligente.methods.mint(account,id,amount,data);

  const receipt = await tx
    .send({
      from: signer.address,
      gas: await tx.estimateGas(),
    })
    .once("transactionHash", (txhash) => {
      console.log(`Dados enviados com sucesso ...`);
    });
    console.log(`Dados incluídos no bloco ${receipt.blockNumber}`);
  res.status(200).send(`Moeda incluída e minerada no bloco ${receipt.blockNumber}`);
});

app.post('/queimar', async function(req, res) {

  let account = req.body.account;
  let id = req.body.id;
  let value = req.body.value;
  
  const network = process.env.ETHEREUM_NETWORK;

  const web3 = new Web3(
    new Web3.providers.HttpProvider(
      `http://127.0.0.1:8545`
    )
  );
  const signer = web3.eth.accounts.privateKeyToAccount(
    process.env.SIGNER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(signer);  
  var contratoInteligente = new web3.eth.Contract(CONTACT_ABI.CONTACT_ABI, CONTACT_ADDRESS.CONTACT_ADDRESS);
  
  const tx = contratoInteligente.methods.burn(account,id,value);

  const receipt = await tx
    .send({
      from: signer.address,
      gas: await tx.estimateGas(),
    })
    .once("transactionHash", (txhash) => {
      console.log(`Dados enviados com sucesso ...`);
    });
    console.log(`Moeda queimada no bloco ${receipt.blockNumber}`);
  res.status(200).send(`Moeda excluida e minerada no bloco ${receipt.blockNumber}`);
});


app.post('/transferir', async function(req, res) {

  let from = req.body.from;
  let to = req.body.to;
  let id = req.body.id;
  let amount = req.body.amount;
  let data = req.body.data;
  
  const network = process.env.ETHEREUM_NETWORK;

  const web3 = new Web3(
    new Web3.providers.HttpProvider(
      `http://127.0.0.1:8545`
    )
  );
  const signer = web3.eth.accounts.privateKeyToAccount(
    process.env.SIGNER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(signer);  
  var contratoInteligente = new web3.eth.Contract(CONTACT_ABI.CONTACT_ABI, CONTACT_ADDRESS.CONTACT_ADDRESS);
  
  const tx = contratoInteligente.methods.safeTransferFrom(from,to,id,amount,data);

  const receipt = await tx
    .send({
      from: signer.address,
      gas: await tx.estimateGas(),
    })
    .once("transactionHash", (txhash) => {
      console.log(`Moeda transferida com sucesso ...`);
    });
    console.log(`Moeda queimada no bloco ${receipt.blockNumber}`);
  res.status(200).send(`Moeda transferida com sucesso no bloco ${receipt.blockNumber}`);
});

app.listen(3001, () => {
    console.log('Servidor REST Ethereum executando...')
})


