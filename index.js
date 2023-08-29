//importar express
const express = require("express");
const app = express();

//importar firebase/firestore
const { db } = require('./firebase.js');

//referencia a la "tabla" de tickets en firestore
const ticketCollectionRef = db.collection('tickets');

//referencia a la "tabla" de categorias en firestore
const categoriasCollectionRef = db.collection('categorias');

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

//Array para preparar datos a enviar en json
var ticketData = [];

//Array de categorias para preparar datos a enviar en json
var listaCategorias = [];

//Iniciar el servidor en el puerto 2000 con la IP del equipo corriendo el servidor
app.listen(2000, () => {
  console.log("Connected to server at 2000");
})

//API para crear tickets y almacenarlos en firestore
//recibe un json enviado desde la App de tickets y lo guarda en firestore
app.post("/api/add_ticket", async (req, res) => {
  console.log("--------------Se ejecuto crear ticket-----------")

  // var snapshotCategorias = await categoriasCollectionRef.get()

  // //limpiamos el array de tickets a enviar 
  // listaCategorias = []

  // //llenamos el array con los tickets existentes en firestore
  // snapshotCategorias.forEach(doc => {
  //   const categoriaData = {
  //     'id': doc.id, //este es el id de firestore
  //     'categoriaNombre': doc.get('categoria')
  //   };

  //   //recogemos todo y filtramos despues
  //   listaCategorias.push(categoriaData);
  // })

  // //OJO
  // ticketData = ticketData.filter(function(value){
  //   return value.valorCompra > valorCompraStart && value.valorCompra < valorCompraEnd;
  // })

  //obtenemos solo la fecha de hoy
  let fecha_y_tiempo = new Date();
  fecha_y_tiempo.setHours(0,0,0,0);

  console.log("imprimiendo el body categorias");
  console.log(req.body.categoriaID)

  //Añadimos un ticket a la colección de tickets en firestore
  const res2 = await ticketCollectionRef.add({
    titulo: req.body.titulo,
    descripcion: req.body.descripcion,
    fechaVencimiento: new Date(req.body.fechaVencimiento),
    fechaPublicacion: new Date(req.body.fechaPublicacion),
    valorCompra: parseFloat(req.body.valorCompra),
    //categoriaID: req.body.categoriaID,
    //categoria: req.body.categoria,
    categoriaRef: categoriasCollectionRef.doc(req.body.categoriaID),
    //it can also be done with seconds to be more accurate, but the exercise only requires the day, not the time
    fechaCreacion: fecha_y_tiempo
  })

  //console.log(categoriasCollectionRef.doc(req.body.categoriaID));

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
  let categoriaID = req.query.categoriaID;
  let valorCompraStart = req.query.valorCompraStart
  let valorCompraEnd = req.query.valorCompraEnd
  let titulo = req.query.titulo;
  let esFechaCreacionOPublicidad = req.query.esFechaCreacionOPublicidad;

  console.log("esFechaCreacionOPublicidad",esFechaCreacionOPublicidad);

  // NO OLVIDES CONVERTIR EL PARAMETRO TITULO A .LOWERCASE PARA QUE BUSQUE BIEN

  //Iniciando la variable que guarda la referencia
  var filtrado = ticketCollectionRef

  //Filtrando por categoria
  if ( categoriaID == '' )
  {
    console.log("categoria id no fue especificada");
  }
  else
  {
    console.log("categoria id es definido y no nulo");
    //filtrado = filtrado.where('categoriaID','==',categoriaID);
    //deberia cambiar
    // var miDocRef = await categoriasCollectionRef.doc(categoriaID).get();
    // var miDocRefData = miDocRef.data();
    // console.log(miDocRefData);
    // console.log(miDocRef.path);

    //necesita la pleca inicial para funcionar, asi sale en firestore
    var categoriaRef = db.doc(`/categorias/${categoriaID}`);
    filtrado = filtrado.where('categoriaRef','==',categoriaRef);
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

  //lista de categorias lista = [] poblada

  //limpiamos el array de tickets a enviar 
  ticketData = [];

  await Promise.all(
  //llenamos el array con los tickets existentes en firestore
  snapshot.docs.map(async doc => {
    const fechaVenc = doc.get('fechaVencimiento');
    const fechaPubli = doc.get('fechaPublicacion');
    const fechaCrea = doc.get('fechaCreacion');
    var nuevafechavenc = fechaVenc.toDate();
    var nuevafechapubli = fechaPubli.toDate();
    var nuevafechacrea = fechaCrea.toDate();
    var valorCompra = doc.get('valorCompra');

    var referenciaCategoria = doc.get('categoriaRef');//USAR categoriaRef
    console.log("imprimiendo categoria objeto")
    console.log(referenciaCategoria.path)
    var laCategoriaRef = db.doc(referenciaCategoria.path)
    var categoriaDesdeRef = await laCategoriaRef.get()
    var categoriasRefData = categoriaDesdeRef.data();
    console.log(categoriasRefData['categoria'])

    const tdata = {
      'id': doc.id,//este es el id de firestore
      'titulo': doc.get('titulo'),
      'descripcion': doc.get('descripcion'),
      //'fechaVencimiento': doc.get('fechaVencimiento'),
      'fechaVencimiento': nuevafechavenc,
      'fechaPublicacion': nuevafechapubli,
      'valorCompra': valorCompra,
      'categoriaID': categoriasRefData['categoria'],
      'fechaCreacion':nuevafechacrea
    };
    //recogemos todo y filtramos despues
    ticketData.push(tdata)
    console.log(ticketData)
  })
  )


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

//API para actualizar un ticket de la lista de tickets en firestore
//Recibimos un ticket desde la App 
//para reemplazar la información del ticket existente a partir de su id
app.post("/api/update_ticket/:id", async (req, res) => {
  //obtenemos una referencia al ticket usando el id recibido desde la App
  const ticketDocumentRef = db.collection('tickets').doc(req.params.id) 

  //actualizamos los datos del ticket actual

  //OJO FALTA AGREGAR LOS NUEVOS CAMPOS QUE HAN SURGIDO!!
  const res2 = await ticketDocumentRef.update(
    {
    titulo:req.body.titulo,
    descripcion:req.body.descripcion,
    fechaVencimiento:new Date(req.body.fechaVencimiento),
    fechaPublicacion:new Date(req.body.fechaPublicacion),
    valorCompra:parseFloat(req.body.valorCompra),
    //categoria:req.body.categoria,
    categoriaRef: categoriasCollectionRef.doc(req.body.categoriaID),
    }
    //, SetOptions(merge,true) usamos update en vez de set en node.js 
  );

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

//API para crear una categoria
app.post("/api/crear_categoria", async (req, res) => {
  console.log("--------------Se ejecuto crear categoria-----------")

  console.log(req.body.categoriaNombre)

  //Añadimos una categoria a la colección de categorias en firestore
  const res2 = await categoriasCollectionRef.add({
    categoria: req.body.categoriaNombre,
  })

  //respondemos a la solicitud
  res.status(200).send({
    "status_code": 200,
    "message": "Categoria added succesfully",
  });
})

//API para listar categorias existentes almacenadas en firestore
app.get('/api/get_categorias', async (req, res) => {

  console.log("--------------Se ejecuto la llamada getCategorias-----------")

  //console.log("esFechaCreacionOPublicidad",esFechaCreacionOPublicidad);

  var snapshot = await categoriasCollectionRef.get()

  //limpiamos el array de tickets a enviar 
  listaCategorias = []

  //llenamos el array con los tickets existentes en firestore
  snapshot.forEach(doc => {
    const categoriaData = {
      'id': doc.id, //este es el id de firestore
      'categoriaNombre': doc.get('categoria')
    };

    //recogemos todo y filtramos despues
    listaCategorias.push(categoriaData);
  })


  console.log("imprimiendo lista de categorias----------------")
  //imprimir la lista de categorias
  console.log(listaCategorias);

  //Si no hay documentos/filas devolvemos un array vacío
  if (snapshot.empty) {
    console.log('No matching documents');
    res.status(200).send({
      'status_code': 200,
      'categorias': []
    });
    return;
  //Caso contrario enviamos el array de categorias a la App
  } else {
    res.status(200).send({
      'status_code': 200,
      'categorias': listaCategorias
    });
  }
})

//API para borrar una categoria almacenada en firestore
app.post("/api/borrar_categoria/:id", async (req, res) => {
  console.log("--------------Se ejecuto la llamada borrarCategorias-----------")

  //obtenemos una referencia al ticket e invocamos la función de borrado
  await categoriasCollectionRef.doc(req.params.id).delete();

  //respondemos a la solicitud
  res.status(200).send({
    'status': "success",
    'message': "Categoria deleted"
  })
})

//API para actualizar una categoria de la colección de categorias en firestore
app.post("/api/actualizar_categoria/:id", async (req, res) => {

  console.log("--------------Se ejecuto la llamada actualizarCategorias-----------")

  console.log("mostrando id")
  console.log(req.params.id)

  console.log("mostrando body")
  console.log(req.body.categoria)

  //actualizamos los datos de la categoría actual
  //, SetOptions(merge,true) usamos update en vez de set en node.js 
  const res2 = await categoriasCollectionRef.doc(req.params.id).update(
    {
      categoria:req.body.categoria
    }
  );

  //respondemos a la solicitud
  res.status(200).send({
    'status': "success",
    'message': "categoria updated"
  })
})