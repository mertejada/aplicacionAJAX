<?php
    function leer_config($nombre, $esquema){
        $config = new DOMDocument();
        $config->load($nombre);
        $res = $config->schemaValidate($esquema);
        if ($res===FALSE){ 
           throw new InvalidArgumentException("Revise fichero de configuración");
        } 		
        $datos = simplexml_load_file($nombre);	
        $ip = $datos->xpath("//ip");
        $nombre = $datos->xpath("//nombre");
        $usu = $datos->xpath("//usuario");
        $clave = $datos->xpath("//clave");	
        $cad = sprintf("mysql:dbname=%s;host=%s", $nombre[0], $ip[0]);
        $resul = [];
        $resul[] = $cad;
        $resul[] = $usu[0];
        $resul[] = $clave[0];
        return $resul;
    }
    
    function conectarBD(){
        try{
            $datos = leer_config(dirname(__FILE__)."/configuracion.xml", dirname(__FILE__)."/configuracion.xsd");
            $bd = new PDO($datos[0], $datos[1], $datos[2]);
            return $bd;
        }catch(PDOException $e){
            echo "Error: " . $e->getMessage();
        }
    }

    function comprobar_usuario($idUsuario, $clave) {
        $bd = conectarBD();
        $sql = "SELECT Clave FROM usuarios WHERE IdUsuario = :idUsuario";
    
        $stmt = $bd->prepare($sql);
        $stmt->bindParam(':idUsuario', $idUsuario);
        $stmt->execute();
    
        $hashedPassword = $stmt->fetchColumn();
    
        if ($hashedPassword && password_verify($clave, $hashedPassword)) {
            return true;
        } else {
            return false;
        }
    }

    function comprobar_admin($idUsuario){
        $bd = conectarBD();
        $sql = "SELECT * FROM usuarios WHERE IdUsuario = :idUsuario AND CodRol = 1";
    
        $stmt = $bd->prepare($sql);
        $stmt->bindParam(':idUsuario', $idUsuario);
        $stmt->execute();
    
        $res = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if(count($res) == 1){
            return true;
        }else{
            return false;
        }
    }

    function crear_usuario($idUsuario, $nombre, $apellido, $clave, $descRol, $correo, $fechaNac){
        $bd = conectarBD();
        
        $codRol = 0;
    
        $claveEncriptada = password_hash($clave, PASSWORD_BCRYPT, ['cost' => 4]);
        $sql = "INSERT INTO usuarios 
                VALUES (:idUsuario, :nombre, :apellido, :clave, :codRol, :descRol, :correo, :fechaNac)";
        
        try {
            $stmt = $bd->prepare($sql);
            $stmt->bindParam(':idUsuario', $idUsuario);
            $stmt->bindParam(':nombre', $nombre);
            $stmt->bindParam(':apellido', $apellido);
            $stmt->bindParam(':clave', $claveEncriptada);
            $stmt->bindParam(':codRol', $codRol);
            $stmt->bindParam(':descRol', $descRol);
            $stmt->bindParam(':correo', $correo);
            $stmt->bindParam(':fechaNac', $fechaNac);
            $stmt->execute();
    
            //devuelve true si se ha creado correctamente
            return true;
            
        } catch (PDOException $e) {
            if ($e->errorInfo[1] == 1062) { // es un codigo de error específico para clave duplicada
                return 'Ya existe ese nombre de usuario. Por favor, inténtelo de nuevo.';
            } else {
                return 'Algo salió mal. Por favor, inténtelo de nuevo.';
                // Log del error (puedes registrar el error en un archivo de registro, base de datos, etc.)
            }
        }
    }


    //GESTION DE CATEGORIAS ADMIN

    function cargar_categorias(){
        $bd = conectarBD();
        $ins = "select * from categorias";
        $resul = $bd->query($ins);	
        if (!$resul) {
            return FALSE;
        }
        if ($resul->rowCount() === 0) {    
            return FALSE;
        }
        //si hay 1 o más
        return $resul;	
    }

    function cargar_productos_categoria($codCat){
        $bd = conectarBD();
        $ins = "SELECT * FROM productos WHERE CodCat = :codCat and Stock > 0";
        $resul = $bd->prepare($ins);
        $resul->bindParam(':codCat', $codCat);
        $resul->execute();	
        if (!$resul) {
            return FALSE;
        }
        if ($resul->rowCount() == 0) {    
            return FALSE;
        }
        
        //si hay 1 o más
        return $resul;	
    }

    function obtener_stock($codProd){
        $bd = conectarBD();
        $ins = "SELECT Stock FROM productos WHERE CodProd = :codProd";
        $resul = $bd->prepare($ins);
        $resul->bindParam(':codProd', $codProd);
        $resul->execute();	

       
        if (!$resul) {
            return FALSE;
        }
        if ($resul->rowCount() === 0) {    
            return FALSE;
        }

        $stock = $resul->fetchColumn();
        return $stock;
    }

    function cargar_productos_carrito($codigosProductosCarrito){
        $bd = conectarBD();

        $texto_in = implode(",", $codigosProductosCarrito);

        if($texto_in==NULL) return FALSE;

        $ins = "SELECT * FROM productos WHERE CodProd in($texto_in)";

        $resul = $bd->query($ins);	
        if (!$resul) {
            return FALSE;
        }
        return $resul;	
    }

    function realizar_pedido($carrito, $idUsuario){
        $bd = conectarBD();
        $bd->beginTransaction();	
        $fechaEnvio = date("Y-m-d H:i:s", time());
    
        // insertar el pedido
        $sql = "INSERT INTO pedidos(Enviado, IdUsuario, Fecha) 
                VALUES(0, :idUsuario, :fechaEnvio)";
        $stmt = $bd->prepare($sql);
        $stmt->bindParam(':idUsuario', $idUsuario);
        $stmt->bindParam(':fechaEnvio', $fechaEnvio);
        $stmt->execute();
    
        if (!$stmt) {
            $bd->rollback();
            return FALSE;
        }
        $pedido = $bd->lastInsertId();
    
        foreach($carrito as $codProd => $unidades){
            $sql = "INSERT INTO pedidosproductos(CodProd, CodPedido, Unidades) 
                    VALUES(:codProd, :pedido, :unidades)";
            $stmt = $bd->prepare($sql);
            $stmt->bindParam(':codProd', $codProd);
            $stmt->bindParam(':pedido', $pedido);
            $stmt->bindParam(':unidades', $unidades);
            $stmt->execute();
    
            $sql1 = "UPDATE productos SET Stock=Stock-$unidades WHERE codProd=:codProd";
            $stmt1 = $bd->prepare($sql1);
            $stmt1->bindParam(':codProd', $codProd);
            $stmt1->execute();
    
            if (!$stmt || !$stmt1) {
                $bd->rollback();
                return FALSE;
            }
        }
        $bd->commit();
        return $pedido;
    }


    function cargar_pedidos_cliente($idUsuario){
        $bd = conectarBD();
        try{
            $sql = "SELECT * FROM pedidos WHERE IdUsuario = :idUsuario";
    
            $stmt = $bd->prepare($sql);
            $stmt->bindParam(':idUsuario', $idUsuario);
            $stmt->execute();
    
            $res = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
            if(!$res){
                return false;
            }
            if(count($res) === 0){
                return false;
            }
            return $res;
    
        }catch(PDOException $e){
            return false;
        }
        
    }


    function cargar_usuarios_admin(){
        $bd = conectarBD();
        $sql = "SELECT * FROM usuarios";
    
        $stmt = $bd->prepare($sql);
        $stmt->execute();
    
        $res = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
        if(!$res){
            return false;
        }
        if(count($res) === 0){
            return false;
        }
        return $res;
    }


function crear_usuario_admin($idUsuario, $nombre, $apellido, $clave, $descRol, $correo, $fechaNac){
    $bd = conectarBD();
    
    if($descRol == "Admin"){
        $codRol = 1;
    }else{
        $codRol = 0;
    }

    $claveEncriptada = password_hash($clave, PASSWORD_BCRYPT, ['cost' => 4]);
    $sql = "INSERT INTO usuarios 
            VALUES (:idUsuario, :nombre, :apellido, :clave, :codRol, :descRol, :correo, :fechaNac)";
    
    try {
        $stmt = $bd->prepare($sql);
        $stmt->bindParam(':idUsuario', $idUsuario);
        $stmt->bindParam(':nombre', $nombre);
        $stmt->bindParam(':apellido', $apellido);
        $stmt->bindParam(':clave', $claveEncriptada);
        $stmt->bindParam(':codRol', $codRol);
        $stmt->bindParam(':descRol', $descRol);
        $stmt->bindParam(':correo', $correo);
        $stmt->bindParam(':fechaNac', $fechaNac);
        $stmt->execute();

        //devuelve true si se ha creado correctamente
        return true;
        
    } catch (PDOException $e) {
        if ($e->errorInfo[1] == 1062) { // es un codigo de error específico para clave duplicada
            return 'Ya existe ese nombre de usuario. Por favor, inténtelo de nuevo.';
        } else {
            return 'Algo salió mal. Por favor, inténtelo de nuevo.';
            // Log del error (puedes registrar el error en un archivo de registro, base de datos, etc.)
        }
    }
}

function eliminar_usuario_admin($idUsuario){
    $bd = conectarBD();
    try {
        $bd->beginTransaction();

        $stmt = $bd->prepare("DELETE FROM pedidosproductos WHERE CodPedido IN (SELECT CodPedido FROM pedidos WHERE IdUsuario = :idUsuario)");
        $stmt->bindParam(':idUsuario', $idUsuario);
        $stmt->execute();

        $stmt = $bd->prepare("DELETE FROM pedidos WHERE IdUsuario = :idUsuario");
        $stmt->bindParam(':idUsuario', $idUsuario);
        $stmt->execute();

        $stmt = $bd->prepare("DELETE FROM usuarios WHERE IdUsuario = :idUsuario");
        $stmt->bindParam(':idUsuario', $idUsuario);
        $stmt->execute();

        $bd->commit();

        return true;
    } catch (PDOException $e) {
        $bd->rollBack();
        return $e->getMessage();

    }
}

function crear_categoria_admin($nomCat, $descripcionCat){
    $bd = conectarBD();

    try{
        $sql = "INSERT INTO categorias(NomCat, DescripcionCat) 
                VALUES (:nomCat, :descripcionCat)";
        
        $stmt = $bd->prepare($sql);
        $stmt->bindParam(':nomCat', $nomCat);
        $stmt->bindParam(':descripcionCat', $descripcionCat);
        $stmt->execute();

        return true;
    }catch(PDOException $e){
        return $e->getMessage();
    }
}

function eliminar_categoria_admin($codCat){
    $bd = conectarBD();
    try {
        $bd->beginTransaction();

        $stmt = $bd->prepare("DELETE FROM productos WHERE CodCat = :codCat");
        $stmt->bindParam(':codCat', $codCat);
        $stmt->execute();

        $stmt = $bd->prepare("DELETE FROM categorias WHERE CodCat = :codCat");
        $stmt->bindParam(':codCat', $codCat);
        $stmt->execute();

        $bd->commit();

        return true;
    } catch (PDOException $e) {
        $bd->rollBack();
        
        if($e->errorInfo[1] == 1451){
            return "Lo sentimos. No puede eliminar la categoría porque hay pedidos que contienen algún producto de esta categoría.";
        }else{
            return $e->getMessage();
        }
    }
}



function cargar_productos_admin(){
    $bd = conectarBD();
    $sql = "SELECT * FROM productos";
    
    $stmt = $bd->prepare($sql);
    $stmt->execute();

    $res = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if(!$res){
        return false;
    }
    if(count($res) === 0){
        return false;
    }
    return $res;
}

function crear_producto_admin($nomProd, $descripcionProd, $stock, $precioProd, $pesoProd, $codCat){
    $bd = conectarBD();

    try{
    $sql = "INSERT INTO productos(NomProd, DescripcionProd, Stock, PrecioProd, PesoProd, CodCat) 
            VALUES (:nomProd, :descripcionProd, :stock, :precioProd, :pesoProd, :codCat)";

        $stmt = $bd->prepare($sql);
        $stmt->bindParam(':nomProd', $nomProd);
        $stmt->bindParam(':descripcionProd', $descripcionProd);
        $stmt->bindParam(':stock', $stock);
        $stmt->bindParam(':precioProd', $precioProd);
        $stmt->bindParam(':pesoProd', $pesoProd);
        $stmt->bindParam(':codCat', $codCat);
        $stmt->execute();

        return true;
    }catch(PDOException $e){
        return false;
    }
    
}

function eliminar_producto_admin($codProd){
    $bd = conectarBD();
    try {
        $bd->beginTransaction();

        $stmt = $bd->prepare("DELETE FROM pedidosproductos WHERE CodProd = :codProd");
        $stmt->bindParam(':codProd', $codProd);
        $stmt->execute();

        $stmt = $bd->prepare("DELETE FROM productos WHERE CodProd = :codProd");
        $stmt->bindParam(':codProd', $codProd);
        $stmt->execute();

        $bd->commit();

        return true;
    } catch (PDOException $e) {
        $bd->rollBack();
        
        if($e->errorInfo[1] == 1451){
            return "Lo sentimos. No puede eliminar el producto porque hay pedidos que lo contienen.";
        }else{
            return $e->getMessage();
        }
    }
}

function modificar_stock($codProd, $stock){
    $bd = conectarBD();
    try{
        $sql = "UPDATE productos SET Stock = :stock WHERE CodProd = :codProd";
        $stmt = $bd->prepare($sql);
        $stmt->bindParam(':stock', $stock);
        $stmt->bindParam(':codProd', $codProd);
        $stmt->execute();

        return true;
    }catch(PDOException $e){
        return false;
    }
}

function cargar_pedidos(){
    $bd = conectarBD();
    $sql = "SELECT * FROM pedidos";
    
    $stmt = $bd->prepare($sql);
    $stmt->execute();

    $res = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if(!$res){
        return false;
    }
    if(count($res) === 0){
        return false;
    }
    return $res;
}


function modificar_estado_pedido($codPedido, $estado){
    $bd = conectarBD();
    try{
        $sql = "UPDATE pedidos SET Enviado = :estado WHERE CodPedido = :codPedido";
        $stmt = $bd->prepare($sql);
        $stmt->bindParam(':estado', $estado);
        $stmt->bindParam(':codPedido', $codPedido);
        $stmt->execute();

        return true;
    }catch(PDOException $e){
        return $e->getMessage();
    }
}

function eliminar_pedido($codPedido){
    $bd = conectarBD();
    try {
        $bd->beginTransaction();

        $stmt = $bd->prepare("DELETE FROM pedidosproductos WHERE CodPedido = :codPedido");
        $stmt->bindParam(':codPedido', $codPedido);
        $stmt->execute();

        $stmt = $bd->prepare("DELETE FROM pedidos WHERE CodPedido = :codPedido");
        $stmt->bindParam(':codPedido', $codPedido);
        $stmt->execute();

        $bd->commit();

        return true;
    } catch (PDOException $e) {
        $bd->rollBack();
        
        return $e->getMessage();
    }
}