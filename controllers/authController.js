const passport = require("passport");
const Usuarios = require("../models/Usuarios");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const crypto = require("crypto");
const bcrypt = require("bcrypt-nodejs");
const enviarEmail = require("../handlers/email");

exports.autenticarUsuario = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/iniciar-sesion",
  failureFlash: true,
  badRequestMessage: "Ambos campos son obligatorios",
});

//Funcion para revisar si el usuario esta logueado o no
exports.usuarioAutenticado = (req, res, next) => {
  //Si el usuario esta autenticado,adelante
  if (req.isAuthenticated()) {
    return next();
  }

  //Si no esta autenticado, redirigir al formulario
  return res.redirect("/iniciar-sesion");
};

//funcion para cerrar sesion
exports.cerrarSesion = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/iniciar-sesion");
  });
};

//Genera un token si el usuario es valido - Lista da
exports.enviarToken = async (req, res) => {
  try {
    //verificar que el usuario existe
    const { email } = req.body;
    const usuario = await Usuarios.findOne({ where: { email } });

    //Si no existe el usuario
    if (!usuario) {
      req.flash("error", "No existe esa cuenta");
      res.redirect("/reestablecer");
    }

    // Usuario existe
    usuario.token = crypto.randomBytes(20).toString("hex");
    usuario.expiracion = Date.now();
    +3600000;

    //Guardar en la base de datos
    await usuario.save();

    //URL de reset
    const resetUrl = `http://${req.headers.host}/reestablecer/${usuario.token}`;

    //Envia el correo con el token
    await enviarEmail.enviar({
      usuario: usuario,
      subject: "Password Reset",
      resetUrl,
      archivo: "reestablecer-password",
    });

    req.flash("correcto", "Se envio un mensaje a tu correo");
    console.log("url test", resetUrl);
    res.render("iniciarSesion", {});
  } catch (error) {
    res.redirect("/reestablecer");
  }
};

//Listo da
exports.validarToken = async (req, res) => {
  const usuario = await Usuarios.findOne({
    where: {
      token: req.params.token,
    },
  });

  //Sino encuentra el usuario
  if (!usuario) {
    req.flash("error", "No Valido"); //No encuentra al usuario
    res.redirect("/reestablecer");
  }

  //Formulario para generar
  res.render("resetPassword", {
    //si detecta hasta aqui al usuario todo chid
    nombrePagina: "Reestablecer Contraseña",
  });
};

//Cambiar el password por uno nuevo
exports.actualizarPassword = async (req, res) => {
  //Aqui ta el error mano
  const usuario = await Usuarios.findOne({
    where: {
      token: req.params.token,
    },
  });

  console.log("******************** inversiones cachigaga *************");
  // console.log(res.body.password);//No da :(
  // console.log(res.params.password);
  // console.log(req.body.password);
  // console.log(req.params.token);
  console.log(usuario);
  console.log("********************************************************");
  //Verificamos sin el usuario existe

  if (!usuario) {
    req.flash("error", "No Valido no hay Usu :/");
    res.redirect("/reestablecer");
  }

  //Hashear el nuevo password

  usuario.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
  usuario.token = null;
  usuario.expiracion = null;

  //Guardamos el nuevo password
  await usuario.save();

  req.flash("correcto", "Tu password se ha modificado correctamente");
  res.redirect("/iniciar-sesion");
};
