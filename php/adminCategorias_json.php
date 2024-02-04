<?php

require_once 'bd.php';
require 'sesiones_json.php';

if(!comprobar_sesion()) return;	

if($_POST["accion"] == "eliminar") {
    $res = eliminar_categoria_admin($_POST['codCat']);
    if($res === true) {
        echo "TRUE";
    } else {
        echo $res;
    }

} else if($_POST["accion"] == "crear") {
    $res = crear_categoria_admin($_POST['nomCat'], $_POST['descripcionCat']);
    if($res === true) {
        echo "TRUE";
    } else {
        echo $res;
    }
} else if($_POST["accion"] == "cargar"){
    $categorias = cargar_categorias();

    $categorias_json = json_encode(iterator_to_array($categorias), true);

    echo $categorias_json;

}
