<?php

require_once "bd.php";
require "sesiones_json.php";

if(!comprobar_sesion()) return;

if($_SERVER["REQUEST_METHOD"] == "POST"){
    if(comprobar_usuario($_POST['usuario'], $_POST['clave'])){
        $res = realizar_pedido($_SESSION['carrito'], $_SESSION['usuario']);

        if($res === FALSE){
            echo "FALSE";
        }else{
            echo "TRUE";
            $_SESSION['carrito'] = [];
        }
    }else{
        return false;
    }
}

