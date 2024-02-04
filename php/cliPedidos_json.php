<?php

require_once 'bd.php';
require 'sesiones_json.php';

if(!comprobar_sesion()) return;

$pedidos = cargar_pedidos_cliente($_SESSION['usuario']);
$pedidos_json = json_encode(iterator_to_array($pedidos), true);
echo $pedidos_json;
