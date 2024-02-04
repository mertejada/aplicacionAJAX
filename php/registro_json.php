<?php

require_once 'bd.php';

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


$error= "";

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $idUsuario = $_POST['idUsuario'];
        $nombre = $_POST['nombre'];
        $apellido = $_POST['apellido'];
        $clave = $_POST['clave'];
        $descRol = "Cliente";
        $correo = $_POST['correo'];
        $fechaNac = $_POST['fechaNac'];

        $resultadoRegistro = crear_usuario($idUsuario, $nombre, $apellido, $clave, $descRol, $correo, $fechaNac);

        if($resultadoRegistro === true){
            echo "TRUE";
        }else{
            echo $resultadoRegistro;
        }
}