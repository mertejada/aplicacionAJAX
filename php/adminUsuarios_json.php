<?php

require_once 'bd.php';
require 'sesiones_json.php';

if(!comprobar_sesion()) return;	

if($_POST["accion"] == "eliminar") {
    $res = eliminar_usuario_admin($_POST['idUsuario']);
    if($res === true) {
        echo "TRUE";
    } else {
        echo $res;
    }

} else if($_POST["accion"] == "crear") {
    $res = crear_usuario_admin($_POST['idUsuario'], $_POST['nombreUsuario'], $_POST['apellidoUsuario'], $_POST['clave'], $_POST['descRol'], $_POST['correo'], $_POST['fechaNac']);
    if($res === true) {
        echo "TRUE";
    } else {
        echo $res;
    }
} else if($_POST["accion"] == "cargar"){
    $usuarios = cargar_usuarios_admin();

    $usuarios_json = json_encode(iterator_to_array($usuarios), true);

    echo $usuarios_json;
}

