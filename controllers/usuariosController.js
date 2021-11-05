const Usuarios = require('../models/Usuarios');
const enviarEmail = require('../handlers/email');

exports.formCrearCuenta = (req,res) =>{
    res.render('crearCuenta',{
        nombrePagina:'Crear Cuenta en Uptask'
    })
}

exports.formIniciarSesion = (req,res) =>{
    const {error} = res.locals.mensajes;
    res.render('iniciarSesion',{
        nombrePagina:'Iniciar session en Uptask',
        error:error
    })
}

exports.crearCuenta = async(req,res) =>{
    //Leer los datos
    const {email,password} = req.body;
    try{
        //Crear el usuario
        await Usuarios.create({
            email,
            password
        });

        //Crear una URL de confirmar
        const confirmarUrl =`http://${req.headers.host}/confirmar/$
        {email}`;

        //Crear el objeto de usuario
        const usuario = {
            email
        }

        //Enviar email
        await enviarEmail.enviar({
            usuario:usuario,
            subject:'Confirma tu cuenta UpTask',
            confirmarUrl,
            archivo:'confirmar-cuenta'
        });


        //Redirigir al usuario
        req.flash('correcto','Enviamos un correo,confirma tu cuenta');
        res.redirect('/iniciar-sesion');
    }catch(error){
        req.flash('error',error.errors.map(error => error.message));
        res.render('crearCuenta',{
            //Cuando tiene:tiene es porque son objetos
            mensajes:req.flash(),
            nombrePagina:'Crear Cuenta en Uptask',
            email:email,
            //Si los componentes se llaman igual como en el email se puede poner 1 example con password
            password
        })
    }
       
}

exports.formRestablecerPassword = (req,res) =>{
    res.render('reestablecer',{
        nombrePagina:'Reestablecer tu Contraseña'
    })
}

//Cambiar el estado de una cuenta
exports.confirmarCuenta = async (req,res) => {
    // res.json(req.params.correo);
    const usuario = await Usuarios.findOne({
        where:{
            email:req.params.correo
        }
    });
    //Si no existe el usuario
    if(!usuario){
        req.flash('error','No valido');
        res.redirect('/crear-cuenta');
    }

    usuario.activo = 1;
    await usuario.save();

    req.flash('correcto','Cuenta activada correctamente');
    res.redirect('/iniciar-sesion');
}