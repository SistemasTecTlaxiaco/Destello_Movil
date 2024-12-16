const StellarSdk = require('stellar-sdk');
const axios = require('axios');

const serverUrl = 'https://horizon-testnet.stellar.org';
const sourceKeys = StellarSdk.Keypair.fromSecret('SAG5NLZM6UTNCRDWDEV6IFJZCP6QLSYI4DTXJD4DAFFIFKVTPLOG6QM5');  // Clave secreta generada
const contractId = 'CCPQPCG5HQ2JBMPPJQ2SNFX5HC5CZECVUY2QEIO7636FGCDB3PVYWR7T';  // ID de tu contrato

document.getElementById('addProductBtn').addEventListener('click', addProduct);
document.getElementById('deleteProductBtn').addEventListener('click', deleteProduct);
document.getElementById('updateProductBtn').addEventListener('click', updateProduct);

async function addProduct() {
    const name = document.getElementById('productName').value;
    const quantity = parseInt(document.getElementById('productQuantity').value);
    const price = parseInt(document.getElementById('productPrice').value);

    if (!name || isNaN(quantity) || isNaN(price)) {
        console.error('Por favor, proporciona todos los detalles del producto correctamente.');
        return;
    }

    try {
        const accountResponse = await axios.get(`${serverUrl}/accounts/${sourceKeys.publicKey()}`);
        const account = accountResponse.data;

        const tx = new StellarSdk.TransactionBuilder(new StellarSdk.Account(sourceKeys.publicKey(), account.sequence), {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: StellarSdk.Networks.TESTNET
        })
        .addOperation(StellarSdk.Operation.manageData({
            name: 'add_product',
            value: JSON.stringify({ name, quantity, price })  // Asume que el contrato espera un valor JSON
        }))
        .setTimeout(100)
        .build();

        tx.sign(sourceKeys);

        const txResponse = await axios.post(`${serverUrl}/transactions`, 
            `tx=${encodeURIComponent(tx.toEnvelope().toXDR('base64'))}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        console.log('Producto agregado exitosamente al contrato:', txResponse.data);

        // Agrega el producto a través del servidor Flask
        await axios.post('/add_product', { name, quantity, price });
        updateProductList();
    } catch (error) {
        console.error('Error al agregar producto al contrato:', error.message);
    }
}

async function deleteProduct() {
    const name = document.getElementById('productName').value;

    if (!name) {
        console.error('Por favor, proporciona el nombre del producto.');
        return;
    }

    try {
        await axios.post('/delete_product', { name });
        console.log('Producto eliminado exitosamente del contrato.');
        updateProductList();
    } catch (error) {
        console.error('Error al eliminar producto del contrato:', error.message);
    }
}

async function updateProduct() {
    const name = document.getElementById('productName').value;
    const quantity = parseInt(document.getElementById('productQuantity').value);
    const price = parseInt(document.getElementById('productPrice').value);

    if (!name || isNaN(quantity) || isNaN(price)) {
        console.error('Por favor, proporciona todos los detalles del producto correctamente.');
        return;
    }

    try {
        const accountResponse = await axios.get(`${serverUrl}/accounts/${sourceKeys.publicKey()}`);
        const account = accountResponse.data;

        const tx = new StellarSdk.TransactionBuilder(new StellarSdk.Account(sourceKeys.publicKey(), account.sequence), {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: StellarSdk.Networks.TESTNET
        })
        .addOperation(StellarSdk.Operation.manageData({
            name: 'update_product',
            value: JSON.stringify({ name, quantity, price })  // Asume que el contrato espera un valor JSON
        }))
        .setTimeout(100)
        .build();

        tx.sign(sourceKeys);

        const txResponse = await axios.post(`${serverUrl}/transactions`, 
            `tx=${encodeURIComponent(tx.toEnvelope().toXDR('base64'))}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        console.log('Producto actualizado exitosamente al contrato:', txResponse.data);

        // Actualiza el producto a través del servidor Flask
        await axios.post('/update_product', { name, quantity, price });
        updateProductList();
    } catch (error) {
        console.error('Error al actualizar producto al contrato:', error.message);
    }
}

async function updateProductList() {
    console.log('Obteniendo todos los productos');

    try {
        const response = await axios.get('/get_all_products');
        if (response.status !== 200) {
            throw new Error('Error al obtener productos');
        }
        const products = response.data;

        const productList = document.getElementById('productList');
        productList.innerHTML = '';

        for (const [name, details] of Object.entries(products)) {
            const productItem = document.createElement('li');
            productItem.textContent = `Nombre: ${name}, Cantidad: ${details.quantity}, Precio: ${details.price}`;
            productList.appendChild(productItem);
        }
    } catch (error) {
        console.error('Error al obtener productos:', error.message);
    }
}



