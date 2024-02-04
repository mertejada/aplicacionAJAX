<?php

require 'bd.php';
require_once 'sesiones_json.php';

if(!comprobar_sesion()) return;

if($_POST['accion'] == 'modificarEstado') {
    $codPedido = $_POST['codPedido'];
    $estado = $_POST['estado'];
    $res = modificar_estado_pedido($codPedido, $estado);
    if($res == true) {
        echo "TRUE";
    } else {
        echo $res;
    }
} else if($_POST['accion'] == 'eliminar') {
    $codPedido = $_POST['codPedido'];
    $res = eliminar_pedido($codPedido);
    if($res == true) {
        echo "TRUE";
    } else {
        echo $res;
    }
} else if($_POST['accion'] == 'cargar') {
    $pedidos = cargar_pedidos();
    $pedidos_json = json_encode(iterator_to_array($pedidos), true);
    echo $pedidos_json;

}