const express = require("express");
const app = express();
const { db } = require('./firebase.js');
const ticketCollectionRef = db.collection('tickets');

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

var ticketData = [];

app.listen(2000, () => {
  console.log("Connected to server at 2000");
})

//add ticket api with firestore
app.post("/api/add_ticket", async (req, res) => {

  const res2 = await ticketCollectionRef.add({
    titulo: req.body.titulo,
    descripcion: req.body.descripcion,
    //new Date() instead of Date.parse
    fechaVencimiento: new Date(req.body.fechaVencimiento),
    fechaPublicacion: new Date(req.body.fechaPublicacion),
    fechaFinPublicacion: new Date(req.body.fechaFinPublicacion),
    valorCompra: parseFloat(req.body.valorCompra),
    categoria: req.body.categoria
  })

  res.status(200).send({
    "status_code": 200,
    "message": "Ticket added succesfully",
  });
})

// get ticket api with firestore
app.get('/api/get_ticket', async (req, res) => {

  const snapshot = await ticketCollectionRef.get();

  ticketData = [];

  snapshot.forEach(doc => {
    const tdata = {
      'id': doc.id,
      'titulo': doc.get('titulo'),
      'descripcion': doc.get('descripcion'),
      'fechaVencimiento': doc.get('fechaVencimiento'),
      'fechaPublicacion': doc.get('fechaPublicacion'),
      'fechaFinPublicacion': doc.get('fechaFinPublicacion'),
      'valorCompra': doc.get('valorCompra'),
      'categoria': doc.get('categoria')
    };
    ticketData.push(tdata);
  })

  console.log(ticketData);

  if (snapshot.empty) {
    console.log('No matching documents');
    res.status(200).send({
      'status_code': 200,
      'tickets': []
    });
    return;
  } else {
    res.status(200).send({
      'status_code': 200,
      'tickets': ticketData
    });
  }
})

//update ticket api with firestore
app.post("/api/update_ticket/:id", async (req, res) => {
  const ticketDocumentRef = db.collection('tickets').doc(req.params.id)

  const res2 = await ticketDocumentRef.set({
    titulo:req.body.titulo,
    descripcion:req.body.descripcion,
    fechaVencimiento:req.body.fechaVencimiento,
    fechaPublicacion:req.body.fechaPublicacion,
    fechaFinPublicacion:req.body.fechaFinPublicacion,
    valorCompra:parseFloat(req.body.valorCompra),
    categoria:req.body.categoria,
  })

  res.status(200).send({
    'status': "success",
    'message': "Ticket updated"
  })
})

// delete ticket api with firestore
app.post("/api/delete_ticket/:id", async (req, res) => {

  const ticketDocumentRef = db.collection('tickets').doc(req.params.id).delete();

  res.status(200).send({
    'status': "success",
    'message': "Ticket deleted"
  })
})