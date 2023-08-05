const express = require("express");

const app = express();

//initilize firestore on server
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

//const serviceAccount = require('./path/to/serviceAccountKey.json');
const serviceAccount = require('json_key/test-project-fb8e5-90cf978b8a0b.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

app.use(express.json());

app.use(express.urlencoded({
    extended:true
}));

const productData = [];

app.listen(4185,()=>{
    console.log("Connected to server at 4185");
})

//post api

app.post("/api/add_product",(req,res)=>{
    console.log("Result",req.body);

    const pdata = {
        "id":productData.length+1,
        "pname":req.body.pname,
        "pprice":req.body.pprice,
        "pdesc":req.body.pdesc
    };
    
    productData.push(pdata);
    console.log("Final",pdata);

    res.status(200).send({
        "status_code":200,
        "message":"Product added succesfully",
        "product":pdata
    });
})

// get api
app.get('/api/get_product',(req,res)=>{
    if(productData.length>0){
        res.status(200).send({
            'status_code':200,
            'products':productData
        });
    } else {
        res.status(200).send({
            'status_code':200,
            'products':[]
        });
    }
})

//update api put

app.post("/api/update/:id",(req,res)=>{
    let id = req.params.id*1;//to return integer
    let productToUpdate = productData.find(p=>p.id === id);
    let index = productData.indexOf(productToUpdate);

    productData[index] = req.body;

    res.status(200).send({
        'status': "success",
        'message': "Product updated"
    })

})

// delete api

app.post("/api/delete/:id",(req,res)=>{
    let id = req.params.id*1;//to return integer
    let productToUpdate = productData.find(p=>p.id === id);
    let index = productData.indexOf(productToUpdate);

    productData.splice(index,1);

    res.status(204).send({
        'status':"success",
        'message':"Product deleted"
    })
})