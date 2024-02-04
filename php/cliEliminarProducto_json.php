<?php
    require_once 'bd.php';
    require 'sesiones_json.php';

    if(!comprobar_sesion()) return;
    
    $codProd = $_POST['codProd'];
    unset($_SESSION['carrito'][$codProd]);

    
