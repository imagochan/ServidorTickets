const express = require("express");

const app = express();



// // adding data
// const docRef = db.collection('users').doc('alovelace');

// // Start function
// const start = async ()=> {
//     const result = await docRef.set({
//         first: 'Ada',
//         last: 'Lovelace',
//         born: 1815
//     });
    
//     console.log(result);
// }

// // Call start
// start();

app.use(express.json());

app.use(express.urlencoded({
    extended:true
}));

const productData = [];

const ticketData = [];

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

app.post("/api/add_ticket",(req,res)=>{
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
app.get('/api/get_ticket',(req,res)=>{
    if(ticketData.length>0){
        res.status(200).send({
            'status_code':200,
            'tickets':ticketData
        });
    } else {
        res.status(200).send({
            'status_code':200,
            'tickets':[]
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