<?php

require_once 'bd.php';
require 'sesiones_json.php';

if(!comprobar_sesion()) return;	

if($_POST["accion"] == "eliminar") {
    $res = eliminar_producto_admin($_POST['codProd']);
    if($res == true) {
        echo "TRUE";
    } else {
        echo $res;
    }

} else if($_POST["accion"] == "crear") {
    $res = crear_producto_admin($_POST['nomProd'], $_POST['descripcionProd'], $_POST['stock'], $_POST['precioProd'], $_POST['pesoProd'], $_POST['codCat']);
    if($res == true) {
        echo "TRUE";
    } else {
        echo $res;
    }
} else if($_POST["accion"] == "cargar"){
    $categorias = cargar_productos_admin();

    $categorias_json = json_encode(iterator_to_array($categorias), true);

    echo $categorias_json;

}else if($_POST["accion"] == "modificarStock"){
    $res = modificar_stock($_POST['codProd'], $_POST['stock']);
    if($res == true) {
        echo "TRUE";
    } else {
        echo $res;
    }
}
