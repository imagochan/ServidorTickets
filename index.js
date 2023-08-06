const express = require("express");

const app = express();

const { db } = require('./firebase.js');
//const { WriteResult } = require("firebase-admin/firestore");

// Import Admin SDK
//const { getDatabase } = require('firebase-admin/database');

// Get a database reference to our blog
//const dbb = getDatabase();
//const ref = dbb.ref('server/saving-data/fireblog');


app.use(express.json());

app.use(express.urlencoded({
    extended:true
}));

const productData = [];

var ticketData = [];

app.listen(2000,()=>{
    console.log("Connected to server at 2000");
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

//post api ticket

app.post("/api/add_ticket2",(req,res)=>{
    console.log("Result",req.body);

    const tdata = {
        "tid":ticketData.length+1,
        "ttitulo":req.body.ttitulo,
        "tdescripcion":req.body.tdescripcion,
        "tfechaVencimiento":req.body.tfechaVencimiento,
        "tfechaPublicacion":req.body.tfechaPublicacion,
        "tfechaFinPublicacion":req.body.tfechaFinPublicacion,
        "tvalorCompra":req.body.tvalorCompra,
        "tcategoria":req.body.tcategoria,
    };
    
    ticketData.push(tdata);
    console.log("Final",tdata);

    res.status(200).send({
        "status_code":200,
        "message":"Ticket added succesfully",
        "ticket":tdata
    });
})

//post add api ticket into firebase
const ticketCollectionRef = db.collection('tickets');

app.post("/api/add_ticket", async (req,res)=>{
    //console.log("Result",req.body);
    //const ref = dbb.ref('server/saving-data/fireblog')

    //ref.child()
    //ref.push({
    //    value:'a'
    //})

    //const ticketRef = db.collection('ticketStorage').doc('tickets')
    
    //const ticketRef2 = db.
    
    //const newTicketRef = ticketRef.pus

    //var addYourDoc = db.collection('ticketStorage').add({
        //property_key: 'property_value',
    //}).then(ref => {
//        console.log('document ID: ', ref.id);
    //});

    //ticketRef.create

    const res2 = await ticketCollectionRef.add({
        titulo:req.body.ttitulo,
        descripcion:req.body.tdescripcion,
        fechaVencimiento:req.body.tfechaVencimiento,
        fechaPublicacion:req.body.tfechaPublicacion,
        fechaFinPublicacion:req.body.tfechaFinPublicacion,
        valorCompra:parseFloat(req.body.tvalorCompra),
        categoria:req.body.tcategoria
    })

    const snapshot = await ticketCollectionRef.get();
    
    if (snapshot.empty) {
        console.log('No matching documents');
        return;
    }

    snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
    });

    const tdata = {
        "tid":ticketData.length+1,
        "ttitulo":req.body.ttitulo,
        "tdescripcion":req.body.tdescripcion,
        "tfechaVencimiento":req.body.tfechaVencimiento,
        "tfechaPublicacion":req.body.tfechaPublicacion,
        "tfechaFinPublicacion":req.body.tfechaFinPublicacion,
        "tvalorCompra":req.body.tvalorCompra,
        "tcategoria":req.body.tcategoria,
    };
    
    ticketData.push(tdata);
    
    console.log("Final",tdata);

    res.status(200).send({
        "status_code":200,
        "message":"Ticket added succesfully",
        "ticket":tdata
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

// get ticket api
app.get('/api/get_ticket', async (req,res)=>{

    const snapshot = await ticketCollectionRef.get();

    ticketData = [];
    
    if (snapshot.empty) {
        console.log('No matching documents');
        res.status(200).send({
            'status_code':200,
            'tickets':[]
        });
        return;
    } else {
        snapshot.forEach(doc => {
            //console.log(doc.id,doc.get('categoria'));
            //console.log(doc.id, '=>', doc.data());
            ticketData.push(
                '{',
                'id:',doc.id,',',
                'titulo:',doc.get('titulo'),',',
                'descripcion:',doc.get('descripcion'),',',
                'fechaVencimiento:',doc.get('fechaVencimiento'),',',
                'fechaPublicacion:',doc.get('fechaPublicacion'),',',
                'fechaFinPublicacion:',doc.get('fechaFinPublicacion'),',',
                'valorCompra:',doc.get('valorCompra'),',',
                'categoria:',doc.get('categoria'),'}'
        );
        res.status(200).send({
            'status_code':200,
            'tickets':ticketData
        });
        })
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

//update ticket api post

app.post("/api/update_ticket/:id",(req,res)=>{
    let id = req.params.id*1;//to return integer
    let ticketToUpdate = ticketData.find(t=>t.tid === id);//might need to chage id to tid if it doesn't work
    let index = ticketData.indexOf(ticketToUpdate);

    ticketData[index] = req.body;

    res.status(200).send({
        'status': "success",
        'message': "Ticket updated"
    })

    console.log("Ticket data is ",ticketData);
    //console.log("Tdata is ",tdata);

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

// delete ticket api

app.post("/api/delete_ticket/:id",(req,res)=>{
    let id = req.params.id*1;//to return integer
    let ticketToUpdate = ticketData.find(t=>t.tid === id);
    let index = ticketData.indexOf(ticketToUpdate);

    ticketData.splice(index,1);

    res.status(204).send({
        'status':"success",
        'message':"Product deleted"
    })
})