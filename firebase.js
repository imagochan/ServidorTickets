//initilize firestore on server
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

//const serviceAccount = require('./path/to/serviceAccountKey.json');
const serviceAccount = require('./json_key/test-project-fb8e5-90cf978b8a0b.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

module.exports = {db}