<?php 	
	require_once "bd.php";
    require "sesiones_json.php";

	if(!comprobar_sesion()) return;		

	$productos = cargar_productos_carrito(array_keys($_SESSION['carrito']));
	// hay que añadir las unidades
	$productos = iterator_to_array($productos);
    
	foreach($productos as &$producto){
		$cod = $producto['CodProd'];
		$producto['unidades'] = $_SESSION['carrito'][$cod];	
	}
	
	echo json_encode($productos, true); // true para que lo devuelva como array asociativo

