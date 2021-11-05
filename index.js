const express = require('express');
const routes = require('./routes');
const path = require('path');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');
//Importar las variables
require ('dotenv').config({path:'variables.env'})

//Helper con algunas funciones
const helpers = require('./helpers');

//Crear la conexion a la BD
const db = require('./config/db');

//Importar el modelo
require('./models/Proyectos');
require('./models/Tareas');
require('./models/Usuarios');

db.sync()
    .then(()=> console.log('Conectado al servidor'))
    .catch(()=>console.error())

// Creando una app de express
const app = express();

//Donde cargar los archivos estaticos
app.use(express.static('public'));

//Habilitar pug
app.set('view engine','pug');

//Habiliatar bodyParser para leer los datos del formulario
app.use(bodyParser.urlencoded({extended:true}));

//Añadir las carpetas de las vistas
app.set('views',path.join(__dirname,'./views'));

//Agregar flash messages
app.use(flash());

app.use(cookieParser());

// sessiones nos permiten navegar entre distintas paginas sin volvernos a auntenticar
app.use(session({
    secret:'supersecreto',
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

//Pasar var dump a la aplicacion
app.use((req,res,next) =>{
    res.locals.vardump = helpers.vardump;
    res.locals.mensajes = req.flash();
    res.locals.usuario = {...req.user} || null;
    next();
});



app.use('/',routes() );


//Servidor y Puerto
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3000;

app.listen(port,host,() =>{
    console.log("El servidor esta funcionando");
});

