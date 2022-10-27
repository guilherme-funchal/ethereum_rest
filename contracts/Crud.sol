pragma solidity ^0.8.4;

contract Inventory {
    struct Product {
        uint id;
        string name;
        uint price;
        uint quantity;
        bool exists;
        uint rowIndex;
    }

    mapping (uint=>Product) private products;
    uint[] private productIds;
    uint private productIdCounter = 0;

    modifier productsMustExist() {
        require(productIds.length > 0, "Products list is emtpy.");
        _;
    }

    function createProduct(string memory name, uint price, uint initialQuantity) public {
        productIdCounter++;
        Product memory newProduct = Product({
            id: productIdCounter,
            name: name,
            price: price,
            quantity: initialQuantity,
            exists: true,
            rowIndex: productIds.length
        });

        productIds.push(newProduct.id);
        products[newProduct.id] = newProduct;
    }

    function updateProduct(uint id, string memory name, uint price, uint quantity) public  {
        require(products[id].exists, "Product with specified id does not exist");
        Product storage targetProduct = products[id];
        targetProduct.name = name;
        targetProduct.price = price;
        targetProduct.quantity = quantity;
    }

    function getProductsLength() public view returns(uint) {
        return productIds.length;
    }

    function getProductsList() public view returns(uint[] memory) {
        return productIds;
    }

    function getProductById(uint id) public view productsMustExist returns(uint, string memory, uint, uint, uint) {
        // Check if product with specified id does exist
        require(products[id].exists, "Product with specified id does not exist");
        Product memory product = products[id];
        return (product.id, product.name, product.price, product.quantity, product.rowIndex);
    }

    function deleteProduct(uint id) public {
        delete products[id];
    }
}

