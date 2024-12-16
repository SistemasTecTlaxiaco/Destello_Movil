const StellarSdk = require('stellar-sdk');
const axios = require('axios');

const serverUrl = 'https://destelloMovil-testnet.stellar.org';
const sourceKeys = StellarSdk.Keypair.fromSecret('SCB2ROFEOMLUZD2PTFSOG5TICQ5KF4YBAWP66YHJWDAJ4QFREMZOP4DP');  
const contractId = 'CA6J4RQXOQPYKNSKX4UATID4BSG7LTFLIRX7SQYT2SGDLF2FNHOZTLY3';  

document.getElementById('addServiceBtn').addEventListener('click', addService);
document.getElementById('deleteServiceBtn').addEventListener('click', deleteService);
document.getElementById('updateServiceBtn').addEventListener('click', updateService);

async function addService() {
    const name = document.getElementById('serviceName').value;
    const price = parseFloat(document.getElementById('servicePrice').value);
    const description = document.getElementById('serviceDescription').value;

    if (!name || isNaN(price) || !description) {
        console.error('Escribe correctamente los servicios.');
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
            name: 'add_service',
            value: JSON.stringify({ name, price, description })
        }))
        .setTimeout(200)
        .build();

        tx.sign(sourceKeys);

        const txResponse = await axios.post(`${serverUrl}/transactions`, 
            `tx=${encodeURIComponent(tx.toEnvelope().toXDR('base64'))}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        console.log('Servicio agregado exitosamente al contrato:', txResponse.data);

        // Agrega el servicio a través del servidor Flask
        await axios.post('/add_service', { name, price, description });
        updateServiceList();
    } catch (error) {
        console.error('Error al agregar servicios:', error.message);
    }
}

async function deleteService() {
    const name = document.getElementById('serviceName').value;

    if (!name) {
        console.error('Escribe el nombre del servicio.');
        return;
    }

    try {
        await axios.post('/delete_service', { name });
        console.log('Tu servicio ah sido elminado.');
        updateServiceList();
    } catch (error) {
        console.error('Error al eliminar tu servicio:', error.message);
    }
}

async function updateService() {
    const name = document.getElementById('serviceName').value;
    const price = parseFloat(document.getElementById('servicePrice').value);
    const description = document.getElementById('serviceDescription').value;

    if (!name || isNaN(price) || !description) {
        console.error('Escribe cada detalle del servicio.');
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
            name: 'update_service',
            value: JSON.stringify({ name, price, description })
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

        console.log('Servicio actualizado:', txResponse.data);

        // Actualiza el servicio a través del servidor Flask
        await axios.post('/update_service', { name, price, description });
        updateServiceList();
    } catch (error) {
        console.error('Error actualizando:', error.message);
    }
}

async function updateServiceList() {
    console.log('Obteniendo todos los servicios');

    try {
        const response = await axios.get('/get_all_services');
        if (response.status !== 200) {
            throw new Error('Error en obtener');
        }
        const services = response.data;

        const serviceList = document.getElementById('serviceList');
        serviceList.innerHTML = '';

        for (const [name, details] of Object.entries(services)) {
            const serviceItem = document.createElement('li');
            serviceItem.textContent = `Servicio: ${name}, Precio: ${details.price}, Descripción: ${details.description}`;
            serviceList.appendChild(serviceItem);
        }
    } catch (error) {
        console.error('Error en obtener:', error.message);
    }
}
