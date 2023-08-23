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
  console.log("--------------Se ejecuto crear ticket-----------")

  //obtenemos solo la fecha de hoy
  let fecha_y_tiempo = new Date();
  fecha_y_tiempo.setHours(0,0,0,0);

  //Añadimos un ticket a la colección de tickets en firestore
  const res2 = await ticketCollectionRef.add({
    titulo: req.body.titulo,
    descripcion: req.body.descripcion,
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
  console.log("--------------Se ejecuto la llamada get-----------")

  // Access the provided query parameters
  let fechaCreacionStart = req.query.fechaCreacionStart
  let fechaCreacionEnd = req.query.fechaCreacionEnd
  let fechaPublicacionStart = req.query.fechaPublicacionStart
  let fechaPublicacionEnd = req.query.fechaPublicacionEnd
  let categoria = req.query.categoria;
  let valorCompraStart = req.query.valorCompraStart
  let valorCompraEnd = req.query.valorCompraEnd
  let titulo = req.query.titulo;
  let esFechaCreacionOPublicidad = req.query.esFechaCreacionOPublicidad;

  console.log("esFechaCreacionOPublicidad",esFechaCreacionOPublicidad);

  // NO OLVIDES CONVERTIR EL PARAMETRO TITULO A .LOWERCASE PARA QUE BUSQUE BIEN

  //Iniciando la variable que guarda la referencia
  var filtrado = ticketCollectionRef

  //Filtrando por categoria
  if ( categoria == 'ALL' )
  {
    console.log("categoria no fue especificada");
  }
  else
  {
    console.log("categoria es definido y no nulo");
    filtrado = filtrado.where('categoria','==',categoria);
  }

  //Filtrando por fecha de Creacion
  
  //hacer un chequeo del lado de la app que sea
  //si el campo de fecha de creacion start tiene datos y el de fin no, tirar error validator form
  //lo que si esta bien es que ambos campos de fechas creacion estem
  //ambos llenos (filtrar por fechas) o ambos vacios (no filtrar por fechas)

  if (esFechaCreacionOPublicidad == 'true')
  {
    console.log("se filtrara por fecha de creacion");
    filtrado = filtrado.orderBy('fechaCreacion');
    filtrado = filtrado.where('fechaCreacion','>=',new Date(fechaCreacionStart));
    filtrado = filtrado.where('fechaCreacion','<=',new Date(fechaCreacionEnd));
  }
  else {
    console.log("se filtrara por fecha de publicacion");
    filtrado = filtrado.orderBy('fechaPublicacion');
    filtrado = filtrado.where('fechaPublicacion','>=',new Date(fechaPublicacionStart));
    //No puedo filtrar por fecha de fin de publicacion junto con la inicial
    //una idea es hacer un tercer radio button para solucionar esto
    filtrado = filtrado.where('fechaPublicacion','<=',new Date(fechaPublicacionEnd));
  }

  //Hacemos get a la referencia de firestore
  var snapshot = await filtrado.get();

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

    var valorCompra = doc.get('valorCompra');

    const tdata = {
      'id': doc.id,
      'titulo': doc.get('titulo'),
      'descripcion': doc.get('descripcion'),
      //'fechaVencimiento': doc.get('fechaVencimiento'),
      'fechaVencimiento': nuevafechavenc,
      'fechaPublicacion': nuevafechapubli,
      'fechaFinPublicacion': nuevafechafinpubli,
      'valorCompra': valorCompra,
      'categoria': doc.get('categoria'),
      'fechaCreacion':nuevafechacrea
    };

    //recogemos todo y filtramos despues
    ticketData.push(tdata)

    //validar del lado de la app que el rango de valor de compra sea mayor que 0
    //tambien que el rango de valor de compra Start sea menor que el End

    // if ( valorCompraEnd == 0 || valorCompraStart == 0) {
    //   ticketData.push(tdata);  
    // }
    // else if(valorCompra >= valorCompraStart && valorCompra <= valorCompraEnd ) {
    //   ticketData.push(tdata);
    // }
    
    //ticketData.filter
    //leer la documentacion de .filter para filtrar valor de compra y titulo a buscar

  })

  console.log("imprimiendo lista de tickets FILTRADA----------------")
  //ticketData.forEach

  if (valorCompraEnd != 0 || valorCompraStart != 0) {
    ticketData = ticketData.filter(function(value){
      return value.valorCompra > valorCompraStart && value.valorCompra < valorCompraEnd;
    })
  }

  if (titulo != '') {
    ticketData = ticketData.filter(function(value){
      const elemento = value.titulo.toLowerCase();
      return elemento.includes(titulo.toLowerCase());
    })
  }

  console.log("imprimiendo lista de tickets----------------")
  //imprimir la lista de tickets
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