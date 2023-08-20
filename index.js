//importar express
const express = require("express");
const app = express();

//importar firebase/firestore
const { db } = require('./firebase.js');

//referencia a "tabla" de tickets en firestore
const ticketCollectionRef = db.collection('tickets');

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

//Array para preparar datos a enviar en json
var ticketData = [];

//Iniciar el servidor en el puerto 2000 con la IP del equipo corriendo el servidor
app.listen(2000, () => {
  console.log("Connected to server at 2000");
})

//API para crear tickets y almacenarlos en firestore

//recibe un json enviado desde la App de tickets y lo guarda en firestore
app.post("/api/add_ticket", async (req, res) => {

  //Añadimos un ticket a la colección de tickets en firestore
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

  //respondemos a la solicitud
  res.status(200).send({
    "status_code": 200,
    "message": "Ticket added succesfully",
  });
})

//API para listar tickets existentes almacenados en firestore

//Recolecta los tickets en la colección de tickets en firestore
//Envia los tickets como un array que serán recibidos en la App.
app.get('/api/get_ticket', async (req, res) => {

  // Access the provided query parameters
  let categoria = req.query.categoria;

  if ( typeof categoria === 'undefined' ) //if ( categoria ) also works
  {
    //do stuff if query is defined and not null
    console.log("categoria es definido y no nulo");

    //Recibimos información de la colección de tickets con un snapshot
    const snapshot = await ticketCollectionRef.get();
  }
  else
  {
    console.log("categoria no esta definido o es nulo");
    //Recibimos información de la colección de tickets con un snapshot
    const snapshot = await ticketCollectionRef.get();
  }

  console.log("imprimiendo categoria para ver como llega sin el query parameter");
  console.log(categoria);

  console.log("La categoria recibida como query parameter en el request es:")
  console.log(categoria);

  //Recibimos información de la colección de tickets con un snapshot
  const snapshot = await ticketCollectionRef.get();

  //limpiamos el array de tickets a enviar 
  ticketData = [];

  //llenamos el array con los tickets existentes en firestore
  snapshot.forEach(doc => {

    const fechaVenc = doc.get('fechaVencimiento');
    const fechaPubli = doc.get('fechaPublicacion');
    const fechaFinPubli = doc.get('fechaFinPublicacion');

    var nuevafechavenc = fechaVenc.toDate();
    var nuevafechapubli = fechaPubli.toDate();
    var nuevafechafinpubli = fechaFinPubli.toDate();

    const tdata = {
      'id': doc.id,
      'titulo': doc.get('titulo'),
      'descripcion': doc.get('descripcion'),
      //'fechaVencimiento': doc.get('fechaVencimiento'),
      'fechaVencimiento': nuevafechavenc,
      'fechaPublicacion': nuevafechapubli,
      'fechaFinPublicacion': nuevafechafinpubli,
      'valorCompra': doc.get('valorCompra'),
      'categoria': doc.get('categoria')
    };

    ticketData.push(tdata);

  })

  console.log(ticketData);

  //Si no hay documentos/filas devolvemos un array vacío
  if (snapshot.empty) {
    console.log('No matching documents');
    res.status(200).send({
      'status_code': 200,
      'tickets': []
    });
    return;
  //Caso contrario enviamos el array de tickets a la App
  } else {
    res.status(200).send({
      'status_code': 200,
      'tickets': ticketData
    });
  }
})

//APi para actualizar un ticket de la lista de tickets en firestore

//Recibimos un ticket desde la App 
//para reemplazar la información del ticket existente a partir de su id
app.post("/api/update_ticket/:id", async (req, res) => {
  //obtenemos una referencia al ticket usando el id recibido desde la App
  const ticketDocumentRef = db.collection('tickets').doc(req.params.id) 

  //actualizamos los datos del ticket actual
  const res2 = await ticketDocumentRef.set({
    titulo:req.body.titulo,
    descripcion:req.body.descripcion,
    fechaVencimiento:req.body.fechaVencimiento,
    fechaPublicacion:req.body.fechaPublicacion,
    fechaFinPublicacion:req.body.fechaFinPublicacion,
    valorCompra:parseFloat(req.body.valorCompra),
    categoria:req.body.categoria,
  })

  //respondemos a la solicitud
  res.status(200).send({
    'status': "success",
    'message': "Ticket updated"
  })
})


//API para borrar un ticket almacenado en firestore

//Recibimos el id del ticket a borrar y
//procedemos a borrar dicho ticket en firestore
app.post("/api/delete_ticket/:id", async (req, res) => {

  //obtenemos una referencia al ticket e invocamos la función de borrado
  const ticketDocumentRef = db.collection('tickets').doc(req.params.id).delete();

  //respondemos a la solicitud
  res.status(200).send({
    'status': "success",
    'message': "Ticket deleted"
  })
})