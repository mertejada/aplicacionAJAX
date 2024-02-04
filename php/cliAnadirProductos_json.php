<?php

require_once "bd.php";
require "sesiones_json.php";

if(!comprobar_sesion()) return;

$codProd = $_POST['codProd'];
$unidadesProd = (int)$_POST['unidades'];


if(isset($_SESSION['carrito'][$codProd])){
	$_SESSION['carrito'][$codProd] += $unidadesProd;
}else{
	$_SESSION['carrito'][$codProd] = $unidadesProd;		
}

//revision de que nunca se añadan más unidades de las que hay en stock
$stock = obtener_stock($codProd);
if($_SESSION['carrito'][$codProd] > $stock){
	$_SESSION['carrito'][$codProd] = $stock;
}

echo json_encode($_SESSION['carrito'], true); // true para que lo devuelva como array asociativo