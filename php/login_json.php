<?php
require_once 'bd.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $usuario = comprobar_usuario($_POST['idUsuario'], $_POST['clave']);

    $idUsuario = $_POST['idUsuario'];

    if ($usuario == false) {
        echo "FALSE";
    } else {
        if(comprobar_admin($idUsuario)){
            session_start();
            $_SESSION['usuario'] = $idUsuario;
            echo "ADMIN";
        }else{
            session_start();
            $_SESSION['usuario'] = $idUsuario;
            $_SESSION['carrito'] = [];
            $_SESSION['admin'] = false;
            echo "USUARIO";
        }
    }

}

