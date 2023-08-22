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
  //let date_ob = new Date();
  //var myVar = date_ob.toDateString(); 
  //console.log(new Date(myVar));
  //let fecha = new Date();
  //var fecha_actual_sin_tiempo = tiempo_actual.setSeconds(0,0); 

  //let fecha_y_tiempo = new Date();
  //fecha_y_tiempo.setHours(0,0,0,0);
  //console.log(fecha_y_tiempo);
})

//API para crear tickets y almacenarlos en firestore

//recibe un json enviado desde la App de tickets y lo guarda en firestore
app.post("/api/add_ticket", async (req, res) => {

  //obtenemos solo la fecha de hoy
  let fecha_y_tiempo = new Date();
  fecha_y_tiempo.setHours(0,0,0,0);
  //console.log(fecha_y_tiempo);

  //Añadimos un ticket a la colección de tickets en firestore
  const res2 = await ticketCollectionRef.add({
    titulo: req.body.titulo,
    descripcion: req.body.descripcion,
    //new Date() instead of Date.parse
    fechaVencimiento: new Date(req.body.fechaVencimiento),
    fechaPublicacion: new Date(req.body.fechaPublicacion),
    fechaFinPublicacion: new Date(req.body.fechaFinPublicacion),
    valorCompra: parseFloat(req.body.valorCompra),
    categoria: req.body.categoria,
    //it can also be done with seconds to be more accurate, but the exercise only requires the day, not the time
    fechaCreacion: fecha_y_tiempo
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

  //YA TUVE LA MEJOR IDEA DE COMO FILTRAR!!!!
  //LO QUE HAY QUE HACER ES USAR UN SOLO REF GET
  //CON TODOS LOS WHERE NECESARIOS DEL PDF
  //Y HACER UN OPERADOR TERNARIO PARA CADA FILTRO!
  //POR EJEMPLO, SI where('categoria',==,categoria?categoria:true)
  //DE ESTA MANERA SI ELIGEN UNA CATEGORIA FILTRA EN CATEGORIA
  //Y SI NO ELIGIERON CATEGORIA PONGO UN TRUE Y RETORNO TODAS LAS CATEGORIAS
  //ASI PODEMOS HACER UN SOLO GET REF DOCUMENTS
  //CON TODOS LOS WHERE NECESARIOS ENCADENADOS

  //ALSO IMPRIMIR LA URL DEL API GET TICKET EN FLUTTER
  //PARA VER COMO PASAN LOS DATOS CUANDO UN QUERY PARAMETER ESTA VACIO

  // Access the provided query parameters
  let fechaCreacionStart = req.query.fechaCreacionStart
  let fechaCreacionEnd = req.query.fechaCreacionEnd
  let fechaPublicacionStart = req.query.fechaPublicacionStart
  let fechaPublicacionEnd = req.query.fechaPublicacionEnd
  let categoria = req.query.categoria;
  let valorCompraStart = req.query.valorCompraStart
  let valorCompraEnd = req.query.valorCompraEnd
  let titulo = req.query.titulo;

  console.log("imprimiendo query parameter titulo");
  console.log(titulo);

  // NO OLVIDES CONVERTIR EL PARAMETRO TITULO A .LOWERCASE PARA QUE BUSQUE BIEN

  //Iniciando la variable que guarda la referencia
  var filtrado = ticketCollectionRef

  //Filtrando por categoria
  if ( categoria == 'undefined' || categoria == 'null' )
  {
    console.log("categoria no esta definido o es nulo");
  }
  else
  {
    console.log("categoria es definido y no nulo");
    filtrado = filtrado.where('categoria','==',categoria);
  }

  //Filtrando por titulo
  if ( titulo == 'undefined' || titulo == 'null' )
  {
    console.log("titulo no esta definido o es nulo");
  }
  else
  {
    console.log("titulo es definido y no nulo");
    filtrado = filtrado.where('titulo','==',titulo);
  }

  //Filtrando por fecha de Creacion
  
  //hacer un chequeo del lado de la app que sea
  //si el campo de fecha de creacion start tiene datos y el de fin no, tirar error validator form
  //lo que si esta bien es que ambos campos de fechas creacion estem
  //ambos llenos (filtrar por fechas) o ambos vacios (no filtrar por fechas)
  if ( fechaCreacionStart == 'undefined' || fechaCreacionStart == 'null' || fechaCreacionEnd == 'undefined' || fechaCreacionEnd == 'null')
  {
    console.log("rango de fecha de creacion no esta definido o es nulo");
  }
  else
  {
    console.log("rango de fecha de creacion es definido y no nulo");
    filtrado = filtrado.where('fechaCreacion','>=',fechaCreacionStart);
    filtrado = filtrado.where('fechaCreacion','<=',fechaCreacionEnd);
  }

  //Hacemos get a la referencia de firestore
  filtrado = await filtrado.get();

  //limpiamos el array de tickets a enviar 
  ticketData = [];

  //llenamos el array con los tickets existentes en firestore
  snapshot.forEach(doc => {
    // { timestamp: time 2323 seconds 2323 }
    const fechaVenc = doc.get('fechaVencimiento');
    const fechaPubli = doc.get('fechaPublicacion');
    const fechaFinPubli = doc.get('fechaFinPublicacion');
    const fechaCrea = doc.get('fechaCreacion');

    var nuevafechavenc = fechaVenc.toDate();
    var nuevafechapubli = fechaPubli.toDate();
    var nuevafechafinpubli = fechaFinPubli.toDate();
    var nuevafechacrea = fechaCrea.toDate();

    const tdata = {
      'id': doc.id,
      'titulo': doc.get('titulo'),
      'descripcion': doc.get('descripcion'),
      //'fechaVencimiento': doc.get('fechaVencimiento'),
      'fechaVencimiento': nuevafechavenc,
      'fechaPublicacion': nuevafechapubli,
      'fechaFinPublicacion': nuevafechafinpubli,
      'valorCompra': doc.get('valorCompra'),
      'categoria': doc.get('categoria'),
      'fechaCreacion':nuevafechacrea
    };

    ticketData.push(tdata);

  })

  // imprimir la lista de tickets
  //console.log(ticketData);

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