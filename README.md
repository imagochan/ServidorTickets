# Servidor Node.js con Firestore para servir tickets

Dicho servidor se conecta a una aplicación escrita en flutter.
- https://github.com/imagochan/AppTickets

## Pasos para usar para compilar y usar la app
 - Ejecutar el comando "npm install" en la raiz del proyecto en una terminal para obtener todas las dependencias necesarias del proyecto
 - Crear un proyecto en firebase en modo de prueba para utilizar en el servidor
 - Una vez creado el proyecto, ingresamos a la página de inicio del mismo y creamos una base de datos "FireStore"
 - Hecho esto pulsamos el botón de configuración (una tuerca) al costado de la página de inicio para ingresar a la configuración dle proyecto
 - Dentro de la configuración, ingresamos a la opción de cuentas de servicio (Service Accounts)
 - Ya que hemos entrado a la página de cuentas de servicio, generamos una nueva llave privada en Node.js, esto iniciará la descarga de un archivo json que podemos renombrar a "serviceAccountKey"
 - Ahora copiamos este archivo a la raíz del proyecto
 - Finalmente, ya podemos utilizar el servidor corriendo el comando "node ." en una terminal en la raíz del mismo

Este servidor utiliza http para servir una API las funciones de:
- CREATE
- READ
- UPDATE
- DELETE

Como base de datos utiliza Firestore para almacenar y recuperar datos.



