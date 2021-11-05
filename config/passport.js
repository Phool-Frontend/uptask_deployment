const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

//Referencia al modelo donde vamos a autenticar
const Usuarios = require('../models/Usuarios');

//Local strategy - Login con credenciales propios (usuario y password)

passport.use(
    //por default passport espera un usuario y password
    new LocalStrategy( 
    {
        usernameField:'email',
        passportField:'password'
    },
    async (email,passport,done) =>{
        try{
            const usuario = await Usuarios.findOne({
                where:{
                    email:email,
                    activo:1
                }
            })
            //El usuario existe,password incorrecto
            if(!usuario.verificarPassword(passport)){
                return done(null,false,{
                    message: 'Password Incorrecto'
                }); 
            } 
            //El email existe, y el password correcto
            return done(null,usuario);
        }catch (e) {
           //Ese usuario no existe
           return done(null,false,{
               message: 'Esa cuenta no existe'
           }); 
        }
    }
  )
);

//Serializar el usuario
passport.serializeUser((usuario,callback)=>{
    callback(null,usuario);
})

//Deseroalizar el usuario
passport.deserializeUser((usuario,callback)=>{
    callback(null,usuario);
})

// exportar
module.exports = passport;