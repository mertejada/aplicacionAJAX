<?php	
	require 'bd.php';	
	require_once 'sesiones_json.php';
	if(!comprobar_sesion()) return;	
	$categorias = cargar_categorias();
	$cat_json = json_encode(iterator_to_array($categorias), true);	
	echo $cat_json;
