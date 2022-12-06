var express = require('express');
var app = express();
var address = "http://127.0.0.1:8545"

const uploadUser = require('./middlewares/uploadFiles');
const crypto = require('crypto');

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors());

var Web3 = require('web3')

require("dotenv").config();

const CONTACT_ABI = require('./config');
const CONTACT_ADDRESS = require('./config');
const { application } = require('express');
const fs = require('fs');

const jsonFile = './data.json'
const jsonFileList = './user-list.json'
const jsonFileConf = './tax.json'

const getTax = () => {
  const jsonData = fs.readFileSync(jsonFileConf)
  return JSON.parse(jsonData)
}
const saveTax = (data) => {
  const stringifyData = JSON.stringify(data)
  fs.writeFileSync(jsonFileConf, stringifyData)
}

const getUserData = () => {
  const jsonData = fs.readFileSync(jsonFile)
  return JSON.parse(jsonData)
}

const findUserData = (user_id) => {
  var result = [];
  const jsonData = fs.readFileSync(jsonFile)
  const userList = JSON.parse(jsonData)

  for (var i = 0; i < userList.length; i++) {
    if (userList[i]["user_id"] == user_id) {
      result.push(userList[i]);
    }
  }
  return result
}

const saveUserData = (data) => {
  const stringifyData = JSON.stringify(data)
  fs.writeFileSync(jsonFile, stringifyData)
}

const getUserDataList = () => {
  const jsonData = fs.readFileSync(jsonFileList)
  return JSON.parse(jsonData)
}
const saveUserDataList = (data) => {
  const stringifyData = JSON.stringify(data)
  fs.writeFileSync(jsonFileList, stringifyData)
}

app.post('/account-lists/add', (req, res) => {
  const existUsers = getUserDataList()
  const userData = req.body

  if (userData.user_id == null) {
    return res.status(401).send({ error: true, msg: 'User data missing' })
  }

  const findExist = existUsers.find(user => user.user_id === userData.user_id)
  if (findExist) {
    return res.status(409).send({ error: true, msg: 'username already exist' })
  }
  existUsers.push(userData)
  saveUserDataList(existUsers);
  res.send({ success: true, msg: 'User data added successfully' })
})

app.get('/tax/list', (req, res) => {
  const users = getTax()
  res.send(users)
})

app.patch('/tax/:id', (req, res) => {
  const id = req.params.id
  const carbono = req.params.carbono	
  const moeda = req.params.moeda
  const taxaData = req.body
  const existTaxa = getTax()
  saveTax(taxaData)
  res.send({success: true, msg: 'Taxa atualizada'})
})

app.delete('/account-lists/delete/:user_id', async function (req, res) {
  try {
    const user_id = req.params.user_id
    const existUsers = getUserDataList()
    const filterUser = existUsers.filter(user => user.user_id !== user_id)
    if (existUsers.length === filterUser.length) {
      return res.status(409).send({ error: true, msg: 'username does not exist' })
    }
    saveUserDataList(filterUser)
    res.send({ success: true, msg: 'User removed successfully' })
  } catch (e) {
    console.error(e)
  }
});


app.get('/account-lists/list', (req, res) => {
  const users = getUserDataList()
  res.send(users)
})

app.get('/account/list', async function (req, res) {
  try {
    const accounts = getUserData()
    res.send(accounts)
  } catch (e) {
    console.error(e)
  }
});

app.get('/account/find/:user_id', async function (req, res) {
  try {
    const user_id = req.params.user_id
    const account = findUserData(user_id)
    // res.send(account)
    res.status(200).send(JSON.stringify(account));
  } catch (e) {
    console.error(e)
  }
});

app.post('/account/add', (req, res) => {
  const existUsers = getUserData()
  const userData = req.body
  if (userData.user_id == null || userData.profile == null || userData.desc == null || userData.email == null || userData.doc == null || userData.created_at == null || userData.updated_at == null || userData.last_login == null|| userData.image == null) {
    return res.status(401).send({ error: true, msg: 'Dado do usuário faltando' })
  }

  const findExist = existUsers.find(user => user.user_id === userData.user_id)
  if (findExist) {
    return res.status(409).send({ error: true, msg: 'Usuario ja existe' })
  }
  existUsers.push(userData)
  saveUserData(existUsers);
  res.send({ success: true, msg: 'Usuario adicionado' })
})

app.get('/dono', async function (req, res) {
  var web3 = new Web3(address);
  var contratoInteligente = new web3.eth.Contract(CONTACT_ABI.CONTACT_ABI, CONTACT_ADDRESS.CONTACT_ADDRESS);
  let owner = await contratoInteligente.methods.owner().call(function (err, res) {
    if (err) {
      console.log("Ocorreu um erro", err)
      return
    }
    console.log("O dono é: ", res)
  });
  res.status(200).send(JSON.stringify(owner));
});


app.get('/transacoes', async function (req, res) {
  try {
    var web3 = new Web3(address);
    var contratoInteligente = new web3.eth.Contract(CONTACT_ABI.CONTACT_ABI, CONTACT_ADDRESS.CONTACT_ADDRESS);
    contratoInteligente.getPastEvents(
      "TransferSingle",
      "allEvents",
      { fromBlock: 0, toBlock: 'latest' },
      (err, events) => {
        res.status(200).send(events);
      }
    );
  } catch (e) {
    console.error(e)
  }
});

app.get('/saldo', async function (req, res) {
  try {
    let conta = req.query.conta;
    let wallet = req.query.wallet;

    var web3 = new Web3(address);
    var contratoInteligente = new web3.eth.Contract(CONTACT_ABI.CONTACT_ABI, CONTACT_ADDRESS.CONTACT_ADDRESS);
    let saldo = await contratoInteligente.methods.balanceOf(conta, wallet).call(function (err, res) {
      if (err) {
        console.log("Ocorreu um erro", err)
        return
      }
      console.log("Saldo gerado com Sucesso")
    });
    saldo = Web3.utils.fromWei(saldo, 'ether');
    res.status(200).send(JSON.stringify(saldo));
    console.log(saldo);
  } catch (e) {
    saldo = 0;
    res.status(400).send("Usuário não encontrado");
    console.error("Usuário não encontrado");
  }
});

  app.get('/saldo-contas', async function (req, res) {
    let wallet = req.query.wallet;
    let accounts = getUserData()
    let quantidade = accounts.length;

    for (var i = 0; i < quantidade; i++) {
      let conta = accounts[i].user_id;
      var web3 = new Web3(address);
      var contratoInteligente = new web3.eth.Contract(CONTACT_ABI.CONTACT_ABI, CONTACT_ADDRESS.CONTACT_ADDRESS);
      let saldo = await contratoInteligente.methods.balanceOf(conta, wallet).call(function (err, res) { });
      saldo = Web3.utils.fromWei(saldo, 'ether');
      accounts[i].saldo = saldo;
    }
    res.status(200).send(JSON.stringify(accounts));
  });

  app.get('/credito', async function (req, res) {
    var id = req.query.id;
    var web3 = new Web3(address);
    var contratoInteligente = new web3.eth.Contract(CONTACT_ABI.CONTACT_ABI, CONTACT_ADDRESS.CONTACT_ADDRESS);
    let credito = await contratoInteligente.methods.getCreditById(id).call(function (err, res) {
      if (err) {
        console.log("Ocorreu um erro", err)
        return
      }
      console.log("credito carregado")
    });

    const credito_adquirido = [{
      id: credito['0'],
      creditAssigned: credito['1'],
      txhash: credito['2'],
      block: credito['3'],
    }];

    res.status(200).send(credito_adquirido);
  });

  app.get('/projeto', async function (req, res) {
    var id = req.query.id;
    var web3 = new Web3(address);
    var contratoInteligente = new web3.eth.Contract(CONTACT_ABI.CONTACT_ABI, CONTACT_ADDRESS.CONTACT_ADDRESS);
    let projeto = await contratoInteligente.methods.getProjectById(id).call(function (err, res) {
      if (err) {
        console.log("Ocorreu um erro", err)
        return
      }
      console.log("Projeto carregado")
    });

    const projeto_identificado = [{
      id: projeto['0'],
      name: projeto['1'],
      projectOwner: projeto['2'],
      projectCreator: projeto['3'],
      projectApprover: projeto['4'],
      description: projeto['5'],
      documentation: projeto['6'],
      hash_documentation: projeto['7'],
      state: projeto['8'],
      area: projeto['9'],
      creditAssigned: projeto['10'],
      updateDate: projeto['11'],
    }];
    res.status(200).send(projeto_identificado);
  });

  app.get('/listarProjetos', async function (req, res) {
    var web3 = new Web3(address);
    var projeto_identificado = [];

    var contratoInteligente = new web3.eth.Contract(CONTACT_ABI.CONTACT_ABI, CONTACT_ADDRESS.CONTACT_ADDRESS);
    let projects = await contratoInteligente.methods.getProjectList().call(function (err, res) {
      if (err) {
        console.log("Ocorreu um erro", err)
        return
      }
    });
    const quantidade = projects.length + 1;

    for (var i = 1; i < quantidade; i++) {

      let projeto = await contratoInteligente.methods.getProjectById(i).call(function (err, res) {
        if (err) {
          console.log("Ocorreu um erro", err)
          return
        }

      });
      projeto_identificado.push({
        id: projeto['0'],
        name: projeto['1'],
        projectOwner: projeto['2'],
        projectCreator: projeto['3'],
        projectApprover: projeto['4'],
        description: projeto['5'],
        documentation: projeto['6'],
        hash_documentation: projeto['7'],
        state: projeto['8'],
        area: projeto['9'],
        creditAssigned: projeto['10'],
        updateDate: projeto['11'],
      });
    }
    res.status(200).send(projeto_identificado);
  });

  app.get('/qtdProjetos', async function (req, res) {
    var web3 = new Web3(address);

    var contratoInteligente = new web3.eth.Contract(CONTACT_ABI.CONTACT_ABI, CONTACT_ADDRESS.CONTACT_ADDRESS);
    let projects = await contratoInteligente.methods.getProjectsLength().call(function (err, res) {
      if (err) {
        console.log("Ocorreu um erro", err)
        return
      }
      console.log("Projetos informados")
    });
    const projeto_identificado = {
      projetos: projects
    }
    res.status(200).send(projeto_identificado);
  });

  app.patch('/account/:user_id', (req, res) => {
    const user_id = req.params.user_id
    const profile = req.params.profile
    const desc = req.params.desc
    const email = req.params.email
    const type = req.params.type
    const doc = req.params.doc
    const created_at = req.params.created_at
    const updated_at = req.params.updated_at
    const last_login = req.params.last_login
    const image = req.params.image
    const userData = req.body
    const existUsers = getUserData()
    const findExist = existUsers.find(user => user.user_id === user_id)
    if (!findExist) {
      return res.status(409).send({ error: true, msg: 'usuário não existe' })
    }
    const updateUser = existUsers.filter(user => user.user_id !== user_id)
    updateUser.push(userData)
    saveUserData(updateUser)
    res.send({ success: true, msg: 'Usuário atualizado com sucesso' })
  })

  app.delete('/account/:user_id', (req, res) => {
    const user_id = req.params.user_id
    const existUsers = getUserData()
    const filterUser = existUsers.filter(user => user.user_id !== user_id)
    if (existUsers.length === filterUser.length) {
      return res.status(409).send({ error: true, msg: 'Usuário não existe' })
    }
    saveUserData(filterUser)
    res.send({ success: true, msg: 'Usuario excluido com sucesso' })
  })

  app.post('/account/add', (req, res) => {
    const existUsers = getUserData()
    const userData = req.body
    if (userData.user_id == null || userData.profile == null || userData.desc == null || userData.email == null || userData.doc == null || userData.created_at == null || userData.updated_at == null || userData.last_login == null) {
      return res.status(401).send({ error: true, msg: 'Dado do usuário faltando' })
    }

    const findExist = existUsers.find(user => user.user_id === userData.user_id)
    if (findExist) {
      return res.status(409).send({ error: true, msg: 'Usuario ja existe' })
    }
    existUsers.push(userData)
    saveUserData(existUsers);
    res.send({ success: true, msg: 'Usuario adicionado' })
  })


  app.post('/emitir', async function (req, res) {
    let account = req.body.account;
    let id = req.body.id;
    let amount = req.body.amount;
    amount = Web3.utils.toWei(amount, 'ether');

    let data = req.body.data;
    const network = process.env.ETHEREUM_NETWORK;
    const web3 = new Web3(
      new Web3.providers.HttpProvider(
        `${address}`
      )
    );
    const signer = web3.eth.accounts.privateKeyToAccount(
      process.env.SIGNER_PRIVATE_KEY
    );
    web3.eth.accounts.wallet.add(signer);
    var contratoInteligente = new web3.eth.Contract(CONTACT_ABI.CONTACT_ABI, CONTACT_ADDRESS.CONTACT_ADDRESS);

    const tx = contratoInteligente.methods.mint(account, id, amount, data);
    const receipt = await tx
      .send({
        from: signer.address,
        gas: await tx.estimateGas(),
      })
      .once("transactionHash", (txhash) => {
        console.log(`Dados enviados com sucesso ...`);
      });
    console.log(`Dados incluídos no bloco ${receipt.blockNumber}`);
    // res.status(200).send(`Moeda incluída e minerada no bloco ${receipt.blockNumber}`);
    
    res.status(200).json({
      txhash: receipt.transactionHash,
      block: receipt.blockNumber
    });
  });

  app.patch('/projeto', async function (req, res) {
    let id = req.body.id;
    let name = req.body.name;
    let projectOwner = req.body.projectOwner;
    let projectCreator = req.body.projectCreator;
    let projectApprover = req.body.projectApprover;
    let description = req.body.description;
    let documentation = req.body.documentation;
    let hash_documentation = req.body.hash_documentation;
    let state = req.body.state;
    let area = req.body.area;
    let creditAssigned = req.body.creditAssigned;
    let updateDate = req.body.updateDate;

    const network = process.env.ETHEREUM_NETWORK;

    const web3 = new Web3(
      new Web3.providers.HttpProvider(
        `${address}`
      )
    );
    const signer = web3.eth.accounts.privateKeyToAccount(
      process.env.SIGNER_PRIVATE_KEY
    );
    web3.eth.accounts.wallet.add(signer);
    var contratoInteligente = new web3.eth.Contract(CONTACT_ABI.CONTACT_ABI, CONTACT_ADDRESS.CONTACT_ADDRESS);

    const tx = contratoInteligente.methods.updateProject(
      id,
      name,
      projectOwner,
      projectCreator,
      projectApprover,
      description,
      documentation,
      hash_documentation,
      state,
      area,
      creditAssigned,
      updateDate
    );

    const receipt = await tx
      .send({
        from: signer.address,
        gas: await tx.estimateGas(),
      })
      .once("transactionHash", (txhash) => {
        console.log(`Dados enviados com sucesso ...`);
      });
    console.log(`Dados inseridos -> ${receipt.blockNumber}`);
    res.status(200).send(`Dados inseridos no bloco ${receipt.blockNumber}`);
  });

  app.post('/credito', async function (req, res) {
    let id = req.body.id;
    let creditAssigned = req.body.creditAssigned;
    let txhash = req.body.txhash;
    let block = req.body.block;

    const network = process.env.ETHEREUM_NETWORK;

    const web3 = new Web3(
      new Web3.providers.HttpProvider(
        `${address}`
      )
    );
    const signer = web3.eth.accounts.privateKeyToAccount(
      process.env.SIGNER_PRIVATE_KEY
    );
    web3.eth.accounts.wallet.add(signer);
    var contratoInteligente = new web3.eth.Contract(CONTACT_ABI.CONTACT_ABI, CONTACT_ADDRESS.CONTACT_ADDRESS);

    const tx = contratoInteligente.methods.setCredit(
      id,
      creditAssigned,
      txhash,
      block
    );
    const receipt = await tx
    .send({
      from: signer.address,
      gas: await tx.estimateGas(),
    })
    .once("transactionHash", (txhash) => {
      console.log(`Dados enviados com sucesso ...`);
    });
  console.log(`Dados inseridos -> ${receipt.blockNumber}`);
  res.status(200).send(`Dados inseridos no bloco ${receipt.blockNumber}`);
});

  app.post('/projeto', async function (req, res) {
    let projectOwner = req.body.projectOwner;
    let projectCreator = req.body.projectCreator;
    let projectApprover = req.body.projectApprover;
    let name = req.body.name;
    let description = req.body.description;
    let documentation = req.body.documentation;
    let hash_documentation = req.body.hash_documentation;
    let state = req.body.state;
    let area = req.body.area;
    let creditAssigned = req.body.creditAssigned;
    let updateDate = req.body.updateDate;

    const network = process.env.ETHEREUM_NETWORK;

    const web3 = new Web3(
      new Web3.providers.HttpProvider(
        `${address}`
      )
    );
    const signer = web3.eth.accounts.privateKeyToAccount(
      process.env.SIGNER_PRIVATE_KEY
    );
    web3.eth.accounts.wallet.add(signer);
    var contratoInteligente = new web3.eth.Contract(CONTACT_ABI.CONTACT_ABI, CONTACT_ADDRESS.CONTACT_ADDRESS);

    const tx = contratoInteligente.methods.setProject(
      projectOwner,
      projectCreator,
      projectApprover,
      name,
      description,
      documentation,
      hash_documentation,
      state,
      area,
      creditAssigned,
      updateDate
    );

    const receipt = await tx
      .send({
        from: signer.address,
        gas: await tx.estimateGas(),
      })
      .once("transactionHash", (txhash) => {
        console.log(`Dados enviados com sucesso ...`);
      });
    console.log(`Dados inseridos -> ${receipt.blockNumber}`);
    res.status(200).send(`Dados inseridos no bloco ${receipt.blockNumber}`);
  });

  app.delete('/projeto/:id', async function (req, res) {

    let id = req.params.id

    const network = process.env.ETHEREUM_NETWORK;

    const web3 = new Web3(
      new Web3.providers.HttpProvider(
        `${address}`
      )
    );
    const signer = web3.eth.accounts.privateKeyToAccount(
      process.env.SIGNER_PRIVATE_KEY
    );
    web3.eth.accounts.wallet.add(signer);
    var contratoInteligente = new web3.eth.Contract(CONTACT_ABI.CONTACT_ABI, CONTACT_ADDRESS.CONTACT_ADDRESS);

    const tx = contratoInteligente.methods.deleteProject(
      id
    );

    const receipt = await tx
      .send({
        from: signer.address,
        gas: await tx.estimateGas(),
      })
      .once("transactionHash", (txhash) => {
        console.log(`Dados enviados com sucesso ...`);
      });
    console.log(`Dados inseridos -> ${receipt.blockNumber}`);
    res.status(200).send(`Dados inseridos no bloco ${receipt.blockNumber}`);
  });

  app.post('/transferir', async function (req, res) {

    let from = req.body.from;
    let to = req.body.to;
    let id = req.body.id;
    let amount = req.body.amount;
    amount = Web3.utils.toWei(amount, 'ether');
    let data = req.body.data;

    const network = process.env.ETHEREUM_NETWORK;

    const web3 = new Web3(
      new Web3.providers.HttpProvider(
        `${address}`
      )
    );
    const signer = web3.eth.accounts.privateKeyToAccount(
      process.env.SIGNER_PRIVATE_KEY
    );
    
    web3.eth.accounts.wallet.add(signer);

//    var contratoInteligente = new web3.eth.Contract(CONTACT_ABI.CONTACT_ABI, CONTACT_ADDRESS.CONTACT_ADDRESS);
    
    var contratoInteligente = new web3.eth.Contract(CONTACT_ABI.CONTACT_ABI, CONTACT_ADDRESS.CONTACT_ADDRESS);
     
    const tx = contratoInteligente.methods.transferirValores(from, to, id, amount, data);

    const receipt = await tx
      .send({
        from: signer.address,
        gas: await tx.estimateGas(),
      })
      .once("transactionHash", (txhash) => {
        console.log(`Moeda transferida com sucesso`, txhash);
      });

    console.log(`Moeda queimada no bloco ${receipt.blockNumber}`);
    // res.status(200).send(`Moeda transferida com sucesso no bloco ${receipt.blockNumber}`);
    res.status(200).json({
      txhash: receipt.transactionHash,
      block: receipt.blockNumber
    });

  });

  app.post('/conta', async function (req, res) {
    try {
      const network = process.env.ETHEREUM_NETWORK;

      const web3 = new Web3(
        new Web3.providers.HttpProvider(
          `${address}`
        )
      );

      let senha = req.body.from;
      let account = web3.eth.accounts.create();
      console.log(`Resultado da criacao da conta: ${account.address} ${account.privateKey}`);
      let wallet = web3.eth.accounts.wallet.create();
      // console.log(`Resultado da criacao da wallet: ${wallet.defaultKeyName}`);
      let walletAccount = web3.eth.accounts.wallet.add(account);
      // Armazena a carteira criptografada no armazenamento local. 
      // web3.eth.accounts.wallet.save('senha');
      // console.log('Carteira salva');
      console.log(`Wallet: ${walletAccount.address}`);
      res.status(200).send(`Wallet: ${walletAccount.address} \nChave publica: ${account.privateKey}`);
    } catch (e) {
      console.error(e)
    }
  });

  app.post('/carimbo', async function (req, res) {
    try {
      let bloco = req.body.block;
      var web3 = new Web3(address);
      var contratoInteligente = new web3.eth.Contract(CONTACT_ABI.CONTACT_ABI, CONTACT_ADDRESS.CONTACT_ADDRESS);
      let block = await web3.eth.getBlock(bloco);
      let timestamp = block.timestamp;
      console.log(timestamp);
      var date = new Date(timestamp * 1000);
      res.status(200).send(`${timestamp}`);
    } catch (e) {
      console.error(e)
    }
  });

  app.post('/queimar', async function (req, res) {

    let account = req.body.account;
    let id = req.body.id;
    let value = req.body.value;
    value = Web3.utils.toWei(value, 'ether');

    const network = process.env.ETHEREUM_NETWORK;

    const web3 = new Web3(
      new Web3.providers.HttpProvider(
        `${address}`
      )
    );
    const signer = web3.eth.accounts.privateKeyToAccount(
      process.env.SIGNER_PRIVATE_KEY
    );
    web3.eth.accounts.wallet.add(signer);
    var contratoInteligente = new web3.eth.Contract(CONTACT_ABI.CONTACT_ABI, CONTACT_ADDRESS.CONTACT_ADDRESS);

    const tx = contratoInteligente.methods.burn_carbono(account, id, value);

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

  app.get('/upload/:file', function (req, res) {
    const file = req.params.file
    // Download function provided by express
    const targget = "public/upload/users" + '/' + file
    res.download(targget, function (err) {

      if (err) {
        console.log(err);
        return res.status(400).json({
          erro: true,
          mensagem: "Erro: Arquivo não pode ser encontrado!"
        });
      }
    })
  })

  app.post("/upload", uploadUser.single('file'), async (req, res) => {
    console.log(req.file);

    if (req.file) {
      const fileBuffer = fs.readFileSync(req.file.path);
      const hash = crypto.createHash('sha256');
      const finalHex = hash.update(fileBuffer).digest('hex');

      return res.json({
        erro: false,
        path: req.file.path,
        file: req.file.filename,
        hash_file: finalHex
      });
    }

    return res.status(400).json({
      erro: true,
      mensagem: "Erro: Upload não realizado com sucesso!"
    });
  });


  app.listen(3001, () => {
    console.log('Servidor REST Ethereum executando...')
  })


