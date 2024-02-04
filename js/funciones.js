
function cargarCategorias(){
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			let cats =  JSON.parse(this.responseText);
			let lista = document.createElement("ul");

			for(let cat of cats){
				let a = crearEnlaceCategoria(cat["NomCat"], cat["CodCat"]);
				let li = document.createElement("li");
				li.appendChild(a);
				lista.appendChild(li);
			}

			let contenido = document.getElementById("contenido");
			contenido.innerHTML = "";
			let titulo = document.createElement("h2");
			titulo.innerHTML ="Categorías";
			contenido.appendChild(titulo);
			contenido.appendChild(lista);


		}
	};
	xhttp.open("GET", "/appCompleta_2/php/cliCategorias_json.php", true);
	xhttp.send();
	return false;
}

function crearEnlaceCategoria(nomCat, codCat){
	let enlace = document.createElement("a");
	enlace.href = "/appCompleta_2/php/cliProductos_json.php?categoria=" + codCat;
	enlace.innerHTML = nomCat;
	enlace.onclick = function(){return cargarProductos(this);}
	return enlace;
}

function cargarProductos(enlace){
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			let contenido = document.getElementById("contenido");
			contenido.innerHTML = "";

			let titulo = document.createElement("h2");
			titulo.innerHTML = enlace.innerHTML;
			contenido.appendChild(titulo);
	
			try{
				let productos = JSON.parse(this.responseText);

				let tabla = crearTablaProductos(productos);
				contenido.appendChild(tabla);

			}catch(e){
				let mensaje = document.createElement("p");
				mensaje.innerHTML = "Categoría sin productos";
				contenido.appendChild(mensaje);
			}
		}
	};
	xhttp.open("GET", enlace.href, true);
	xhttp.send();
	return false;
}

function crearTablaProductos(productos){
	let tabla = document.createElement("table");
	let cabecera = crearFila(["Código", "Nombre", "Descripción","Stock", "Precio", "Comprar"], "th");
	tabla.appendChild(cabecera);

	for(let producto of productos){
		let fila = crearFila([producto["CodProd"], producto["NomProd"], producto["DescripcionProd"], producto["Stock"], producto["PrecioProd"]+"€"], "td");
		let formu = crearFormulario("Añadir", producto["CodProd"], anadirProductos, producto["Stock"]);
		let celda_form = document.createElement("td");
		celda_form.appendChild(formu);
		fila.appendChild(celda_form);
		tabla.appendChild(fila);
	}
	return tabla;
}

function crearFila(datos, tipo){
	let fila = document.createElement("tr");
	for(let dato of datos){
		let celda = document.createElement(tipo);
		celda.innerHTML = dato;
		fila.appendChild(celda);
	}
	return fila;
}

function crearFormulario(texto, cod, funcion, stock){
	let formu = document.createElement("form");
	//Input de unidades
	let unidades = document.createElement("input");
	unidades.value = 1;
	unidades.name = "unidades";
	unidades.type = "number";
	unidades.min = 1;
	unidades.max = stock;

	//Input de codigo hidden
	let codigo = document.createElement("input");
	codigo.value = cod;
	codigo.type = "hidden";
	codigo.name = "cod";

	//Input de submit
	let bsubmit = document.createElement("input");
	bsubmit.type = "submit";
	bsubmit.value = texto;

	//Evento onsubmit
	formu.onsubmit = function(){return funcion(this);}

	//Añadir elementos al formulario
	formu.appendChild(unidades);
	formu.appendChild(codigo);
	formu.appendChild(bsubmit);
	return formu;
}

function anadirProductos(formu){
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			try{
				alert("Producto añadido al carrito");
			}catch(e){
				alert("Error al añadir el producto");
			}
		}
	};
	let params = "codProd=" + formu.cod.value + "&unidades=" + formu.unidades.value;
	xhttp.open("POST", "/appCompleta_2/php/cliAnadirProductos_json.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(params);
	return false;
}

function cargarCarrito(){
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			let contenido = document.getElementById("contenido");
			contenido.innerHTML = "";

			let titulo = document.createElement("h2");
			titulo.innerHTML = "Carrito";
			contenido.appendChild(titulo);

			try{
				let productos = JSON.parse(this.responseText);
			
				let tabla = crearTablaCarrito(productos);
				contenido.appendChild(tabla);

				let infoGastosEnvio = document.createElement("p");
				infoGastosEnvio.innerHTML = "Envío gratuito para pedidos superiores a 50€. Los pedidos superiores a 10kg tienen un coste adicional de 5€.";
				infoGastosEnvio.setAttribute("id", "gastosEnvio");
				contenido.appendChild(infoGastosEnvio);

	
				let tablaPedido = crearTablaProcesarCarrito(productos);
				contenido.appendChild(tablaPedido);

				

			}catch(e){
				let mensaje = document.createElement("p");
				mensaje.innerHTML = "Carrito vacío";
				contenido.appendChild(mensaje);
			}
			
		}
	};
	xhttp.open("GET", "/appCompleta_2/php/cliCarrito_json.php", true);
	xhttp.send();
	return false;
}

/*la tabla del carrito debe contener tambien el peso del producto y unidades, pudiendo modificarlas. tambien el peso final y el precio final*/
function crearTablaCarrito(productos){
	let tabla = document.createElement("table");
	let cabecera = crearFila(["Código", "Nombre", "Descripción", "Stock", "Precio", "Peso (kg)", "Unidades", "Modificar unidades", "Eliminar"], "th");
	tabla.appendChild(cabecera);

	for(let producto of productos){
		let fila = crearFila([producto["CodProd"], producto["NomProd"], producto["DescripcionProd"], producto["Stock"], producto["PrecioProd"]+"€", producto["PesoProd"] , producto["unidades"]], "td");

		let celda_eliminar = document.createElement("td");
        let eliminar = document.createElement("button");
        eliminar.innerHTML = "Eliminar";
        eliminar.onclick = function(){return eliminarProductoCarrito(producto);}
        celda_eliminar.appendChild(eliminar);

		let modificarUnidades = crearFormulario("Modificar", producto["CodProd"], modificarUnidadesCarrito, producto["Stock"]);
		let celda_modificar = document.createElement("td");
		celda_modificar.appendChild(modificarUnidades);

		fila.appendChild(celda_modificar);
		fila.appendChild(celda_eliminar);
		
		tabla.appendChild(fila);

		
	}

	return tabla;
}

function eliminarProductoCarrito(producto){
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			try{
				alert("Producto eliminado del carrito");
				cargarCarrito();
			}catch(e){
				alert("Error al eliminar el producto");
			}
		}
	};
	let params = "codProd=" + producto["CodProd"];
	xhttp.open("POST", "/appCompleta_2/php/cliEliminarProducto_json.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(params);
	return false;
}

function modificarUnidadesCarrito(formu){
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			try{
				alert("Producto modificado del carrito");
				cargarCarrito();
			}catch(e){
				alert("Error al modificar el producto");
			}
		}
	};
	let params = "codProd=" + formu.cod.value + "&unidades=" + formu.unidades.value;
	xhttp.open("POST", "/appCompleta_2/php/cliModificarUnidades_json.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(params);
	return false;
}

function crearTablaProcesarCarrito(productos){
	let tabla = document.createElement("table");
	
	let cabecera = crearFila(["Precio" ,"Peso Total (kg)", "Gastos de envío", "Precio Final" , "Procesar pedido"], "th");
	tabla.appendChild(cabecera);

	let precioTotal = 0;
	let gastosEnvio = "";
	let pesoTotal = 0;
	let precioFinal = 0;


	for(let producto of productos){
		precioTotal += producto["PrecioProd"] * producto["unidades"];
		pesoTotal += producto["PesoProd"] * producto["unidades"];
	}

	if(precioTotal > 50){
		precioFinal = precioTotal;
		gastosEnvio = "Envío gratuito"
	}else{
		precioFinal = precioTotal + gastosEnvio;
		gastosEnvio = "Gastos de envío: 5€";
	}

	if(pesoTotal > 10){
		gastosEnvio += " + 5€ adicionales por exceso de peso";
		precioFinal += 5;
	}


	let fila = crearFila([precioTotal+"€", pesoTotal, gastosEnvio, precioFinal+"€"], "td");

	let procesar = document.createElement("input");
	procesar.type = "button";
	procesar.value = "Procesar pedido";
	procesar.onclick = function(){return loginPedido();}

	let celda_procesar = document.createElement("td");
	celda_procesar.appendChild(procesar);

	fila.appendChild(celda_procesar);
	tabla.appendChild(fila);

	return tabla;
}


//antes de procesar el pedido, necesito verificar que el usuario es correcto haciendo de nuevo la peticion de login
function loginPedido(){
	let contenido = document.getElementById("contenido");
	contenido.innerHTML = "";

	let titulo = document.createElement("h2");
	titulo.innerHTML = "Identifícate de nuevo";
	contenido.appendChild(titulo);

	let formu = crearFormularioLogin();
	contenido.appendChild(formu);

}

function crearFormularioLogin(){
	let formu = document.createElement("form");

	let usuario = document.createElement("input");
	usuario.type = "text";
	usuario.name = "usuario";
	usuario.placeholder = "Usuario";
	usuario.required = true;

	let clave = document.createElement("input");
	clave.type = "password";
	clave.name = "clave";
	clave.placeholder = "Contraseña";
	clave.required = true;

	let bsubmit = document.createElement("input");
	bsubmit.type = "submit";
	bsubmit.value = "Procesar pedido";

	formu.onsubmit = function(){return procesarPedido(this);}

	formu.appendChild(usuario);
	formu.appendChild(clave);
	formu.appendChild(bsubmit);
	return formu;
}

function procesarPedido(formu){
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			try{
				console.log(this.responseText);
				if(this.responseText == "TRUE"){
					alert("Pedido procesado correctamente");

				}else{
					alert("Sus credenciales no son correctas");
				}
			}catch(e){
				alert("Error al procesar el pedido.");
			}

			cargarCarrito();
		}
	};
	let params = "usuario=" + formu.usuario.value + "&clave=" + formu.clave.value;
	xhttp.open("POST", "/appCompleta_2/php/cliProcesarPedido_json.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(params);
	return false;
}

function cargarPedidos(){
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			let contenido = document.getElementById("contenido");
			contenido.innerHTML = "";

			let titulo = document.createElement("h2");
			titulo.innerHTML = "Pedidos";
			contenido.appendChild(titulo);

			try{
				let pedidos = JSON.parse(this.responseText);
			
				let tabla = crearTablaPedidos(pedidos);
				contenido.appendChild(tabla);

			}catch(e){
				let mensaje = document.createElement("p");
				mensaje.innerHTML = "No hay pedidos";
				contenido.appendChild(mensaje);
			}
			
		}
	};
	xhttp.open("GET", "/appCompleta_2/php/cliPedidos_json.php", true);
	xhttp.send();
	return false;
}

function crearTablaPedidos(pedidos){
	let tabla = document.createElement("table");
	let cabecera = crearFila(["Código", "Fecha","Estado"], "th");
	tabla.appendChild(cabecera);

	for(let pedido of pedidos){
		if(pedido["Enviado"] == 0){
			pedido["Estado"] = "Pedido en proceso";
		}else if(pedido["Enviado"] == 1 && pedido["Recibido"] == 0){
			pedido["Estado"] = "Pedido enviado";
		}else{
			pedido["Estado"] = "Pedido recibido";
		}

		let fila = crearFila([pedido["CodPedido"], pedido["Fecha"], pedido["Estado"]], "td");
		tabla.appendChild(fila);
	}

	return tabla;
}

//FUNCIONES ADMINISTRADOR

function cargarEnlacesAdmin(){
	let contenido = document.getElementById("contenido");
	contenido.innerHTML = "";

	let titulo = document.createElement("h2");
	titulo.innerHTML = "Administración";
	contenido.appendChild(titulo);

	let enlaces = document.createElement("ul");

	let opciones = ["Usuarios", "Categorías", "Productos", "Pedidos"];

	for(let opcion of opciones){
		let enlace = document.createElement("a");
		enlace.innerHTML = opcion;
		enlace.href = "#";
		enlace.value = opcion;
		enlace.onclick = function(){return cargarOpcion(this);}
		let li = document.createElement("li");
		li.appendChild(enlace);
		enlaces.appendChild(li);
	}

	contenido.appendChild(enlaces);

}

function cargarOpcion(enlace){
	switch(enlace.value){
		case "Usuarios":
			return cargarUsuariosAdmin();
		case "Categorías":
			return cargarCategoriasAdmin();
		case "Productos":
			return cargarProductosAdmin();
		case "Pedidos":
			return cargarUsuarios();
		default:
			return false;
	}
}


function cargarUsuariosAdmin(){
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			let contenido = document.getElementById("contenido");
			contenido.innerHTML = "";

			let titulo = document.createElement("h2");
			titulo.innerHTML = "Usuarios";
			contenido.appendChild(titulo);

			try{
				let usuarios = JSON.parse(this.responseText);
				
				let tabla = crearTablaUsuariosAdmin(usuarios);
				contenido.appendChild(tabla);

				

			}catch(e){
				let mensaje = document.createElement("p");
				mensaje.innerHTML = "No hay usuarios";
				contenido.appendChild(mensaje);
			}

			let tituloCrear = document.createElement("h2");
			tituloCrear.innerHTML = "Crear usuario";
			contenido.appendChild(tituloCrear);


			let formu = crearFormularioCrearUsuario();
			contenido.appendChild(formu);
			
		}
	};
	let params = "accion=" + "cargar";
	xhttp.open("POST", "/appCompleta_2/php/adminUsuarios_json.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(params);
	return false;
}


function crearTablaUsuariosAdmin(usuarios){
	let tabla = document.createElement("table");
	let cabecera = crearFila(["IdUsuario", "Nombre", "Apellido", "Correo", "Fecha de nacimiento", "Eliminar"], "th");
	tabla.appendChild(cabecera);

	for(let usuario of usuarios){
		let fila = crearFila([usuario["IdUsuario"], usuario["NombreUsuario"], usuario["ApellidoUsuario"], usuario["Correo"], usuario["FechaNac"]], "td");

		if(usuario["CodRol"] == 0){
			let celda_eliminar = document.createElement("td");
			let eliminar = document.createElement("button");

			eliminar.innerHTML = "Eliminar";

			eliminar.onclick = function(){if (confirm('¿Estás seguro de que quieres eliminar este usuario? Se eliminarán todos sus pedidos.')) {
				return eliminarUsuario(usuario);
			} else {
				return false; // Evita que se ejecute la acción de eliminar si el usuario cancela
			};
		}
			celda_eliminar.appendChild(eliminar);
	
			fila.appendChild(celda_eliminar);
		}
		
		tabla.appendChild(fila);
	}

	return tabla;
}

function crearFormularioCrearUsuario(){
	let formu = document.createElement("form");

	let idUsuario = document.createElement("input");
	idUsuario.type = "text";
	idUsuario.name = "idUsuario";
	idUsuario.placeholder = "Usuario";
	idUsuario.required = true;


	let clave = document.createElement("input");
	clave.type = "password";
	clave.name = "clave";
	clave.placeholder = "Contraseña";
	clave.required = true;

	let nombreUsuario = document.createElement("input");
	nombreUsuario.type = "text";
	nombreUsuario.name = "nombreUsuario";
	nombreUsuario.placeholder = "Nombre";
	nombreUsuario.required = true;


	let apellidoUsuario = document.createElement("input");
	apellidoUsuario.type = "text";
	apellidoUsuario.name = "apellidoUsuario";
	apellidoUsuario.placeholder = "Apellido";
	apellidoUsuario.required = true;

	let descRol = document.createElement("select");
	descRol.name = "descRol";
	descRol.required = true;
	
	let opcion1 = document.createElement("option");
	opcion1.value = "Admin";
	opcion1.innerHTML = "Administrador";

	let opcion2 = document.createElement("option");
	opcion2.value = "Cliente";
	opcion2.innerHTML = "Cliente";

	descRol.appendChild(opcion1);
	descRol.appendChild(opcion2);

	let correo = document.createElement("input");
	correo.type = "email";
	correo.name = "correo";
	correo.placeholder = "Correo";
	correo.required = true;
	correo.pattern = "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}";

	let fechaNac = document.createElement("input");
	fechaNac.type = "date";
	fechaNac.name = "fechaNac";
	fechaNac.required = true;
	fechaNac.value = "1950-01-01";


	let bsubmit = document.createElement("input");
	bsubmit.type = "submit";
	bsubmit.value = "Crear";

	formu.onsubmit = function(){return crearUsuario(this);}

	formu.appendChild(idUsuario);
	formu.appendChild(clave);
	formu.appendChild(nombreUsuario);
	formu.appendChild(apellidoUsuario);
	formu.appendChild(correo);
	formu.appendChild(fechaNac);
	formu.appendChild(bsubmit);
	formu.appendChild(descRol);
	
	return formu;
}

function crearUsuario(formu){
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			try{
				if(this.responseText == "TRUE"){
					alert("Usuario creado correctamente");
					cargarUsuariosAdmin();
				}else{
					alert(this.responseText);
				}
			}catch(e){
				alert("Lo sentimos, ha ocurrido un error al crear el usuario."); 
			}
		}
	};


	let params = "idUsuario=" + formu.idUsuario.value + "&clave=" + formu.clave.value + "&nombreUsuario=" + formu.nombreUsuario.value + "&apellidoUsuario=" + formu.apellidoUsuario.value + "&descRol=" + formu.descRol.value + "&correo=" + formu.correo.value + "&fechaNac=" + formu.fechaNac.value + "&accion=" + "crear";
	xhttp.open("POST", "/appCompleta_2/php/adminUsuarios_json.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(params);
	return false;
}

function eliminarUsuario(usuario){
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			try{
				if(this.responseText == "TRUE"){
					alert("Usuario eliminado correctamente");
					cargarUsuariosAdmin();
				}else{
					alert(this.responseText);
					
				}
			}catch(e){
				alert("Lo sentimos, ha ocurrido un error al eliminar el usuario.");
			}
		}
	};
	let params = "idUsuario=" + usuario["IdUsuario"] + "&accion=" + "eliminar";
	xhttp.open("POST", "/appCompleta_2/php/adminUsuarios_json.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(params);
	return false;
}

function cargarCategoriasAdmin(){
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			let contenido = document.getElementById("contenido");
			contenido.innerHTML = "";

			let titulo = document.createElement("h2");
			titulo.innerHTML = "Categorías";
			contenido.appendChild(titulo);

			try{
				let categorias = JSON.parse(this.responseText);
				
				let tabla = crearTablaCategorias(categorias);
				contenido.appendChild(tabla);

			}catch(e){
				let mensaje = document.createElement("p");
				mensaje.innerHTML = "No hay categorías";
				contenido.appendChild(mensaje);
			}

			let tituloCrear = document.createElement("h2");
			tituloCrear.innerHTML = "Crear categoría";
			contenido.appendChild(tituloCrear);
		}

		let formu = crearFormularioCrearCategoria();
		contenido.appendChild(formu);
	}

	let params = "accion=" + "cargar";
	xhttp.open("POST", "/appCompleta_2/php/adminCategorias_json.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(params);
}

function crearTablaCategorias(categorias){
	let tabla = document.createElement("table");
	let cabecera = crearFila(["Código", "Nombre", "Eliminar"], "th");
	tabla.appendChild(cabecera);

	for(let categoria of categorias){
		let fila = crearFila([categoria["CodCat"], categoria["NomCat"]], "td");

		let celda_eliminar = document.createElement("td");
		let eliminar = document.createElement("button");

		eliminar.innerHTML = "Eliminar";

		eliminar.onclick = function(){if (confirm('¿Estás seguro de que quieres eliminar esta categoría? Se eliminarán todos sus productos.')) {
			return eliminarCategoria(categoria);
		} else {
			return false; 
		};
	}
		celda_eliminar.appendChild(eliminar);

		fila.appendChild(celda_eliminar);
		
		tabla.appendChild(fila);
	}

	return tabla;
}

function eliminarCategoria(categoria){
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			try{
				if(this.responseText == "TRUE"){
					alert("Categoría eliminada correctamente");
					cargarCategoriasAdmin();
				}else{
					alert(this.responseText);
					
				}
			}catch(e){
				alert("Lo sentimos, ha ocurrido un error al eliminar la categoría.");
			}
		}
	};
	let params = "codCat=" + categoria["CodCat"] + "&accion=" + "eliminar";
	xhttp.open("POST", "/appCompleta_2/php/adminCategorias_json.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(params);
	return false;
}

function crearFormularioCrearCategoria(){
	let formu = document.createElement("form");

	let nomCat = document.createElement("input");
	nomCat.type = "text";
	nomCat.name = "nomCat";
	nomCat.placeholder = "Nombre";
	nomCat.required = true;

	let descripcionCat = document.createElement("input");
	descripcionCat.type = "text";
	descripcionCat.name = "descripcionCat";
	descripcionCat.placeholder = "Descripción";
	descripcionCat.required = true;


	let bsubmit = document.createElement("input");
	bsubmit.type = "submit";
	bsubmit.value = "Crear";

	formu.onsubmit = function(){return crearCategoria(this);}

	formu.appendChild(nomCat);
	formu.appendChild(descripcionCat);
	formu.appendChild(bsubmit);
	
	return formu;
}

function crearCategoria(formu){
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			try{
				if(this.responseText == "TRUE"){
					alert("Categoría creada correctamente");
					cargarCategoriasAdmin();
				}else{
					alert(this.responseText);
					console.log(this.responseText);
				}
			}catch(e){
				alert("Lo sentimos, ha ocurrido un error al crear la categoría."); 
			}
		}
	}

	let params = "nomCat=" + formu.nomCat.value + "&descripcionCat=" + formu.descripcionCat.value + "&accion=" + "crear";
	xhttp.open("POST", "/appCompleta_2/php/adminCategorias_json.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(params);

	return false;
}

function cargarProductosAdmin(){
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			let contenido = document.getElementById("contenido");
			contenido.innerHTML = "";

			let titulo = document.createElement("h2");
			titulo.innerHTML = "Productos";
			contenido.appendChild(titulo);

			try{
				let productos = JSON.parse(this.responseText);
				
				let tabla = crearTablaProductosAdmin(productos);
				contenido.appendChild(tabla);

			}catch(e){
				let mensaje = document.createElement("p");
				mensaje.innerHTML = "No hay productos";
				contenido.appendChild(mensaje);
			}

			let tituloCrear = document.createElement("h2");
			tituloCrear.innerHTML = "Crear producto";
			contenido.appendChild(tituloCrear);
		}

		let formu = crearFormularioCrearProducto();
		contenido.appendChild(formu);
	}

	let params = "accion=" + "cargar";
	xhttp.open("POST", "/appCompleta_2/php/adminProductos_json.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(params);

	return false;
}

function crearTablaProductosAdmin(productos){
	let tabla = document.createElement("table");
	let cabecera = crearFila(["Código", "Nombre", "Descripción", "Stock", "Precio", "Peso(kg)", "Modificar stock", "Eliminar"], "th");
	tabla.appendChild(cabecera);

	for(let producto of productos){
		let fila = crearFila([producto["CodProd"], producto["NomProd"], producto["DescripcionProd"], producto["Stock"], producto["PrecioProd"]+"€", producto["PesoProd"]], "td");

		let celda_eliminar = document.createElement("td");
		let eliminar = document.createElement("button");

		eliminar.innerHTML = "Eliminar";

		eliminar.onclick = function(){if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
			return eliminarProducto(producto);
		} else {
			return false; 
		};}

		celda_eliminar.appendChild(eliminar);

		let celda_modificar = document.createElement("td");
		let modificar = crearFormulario("Modificar", producto["CodProd"], modificarStockProducto, 200); //He decidido que 200 es el stock máximo, pero puede cambiarse
		celda_modificar.appendChild(modificar);

		fila.appendChild(celda_modificar);
		fila.appendChild(celda_eliminar);
		
		tabla.appendChild(fila);
	}

	return tabla;

}



function crearFormularioCrearProducto(){
	let formu = document.createElement("form");

	let nomProd = document.createElement("input");
	nomProd.type = "text";
	nomProd.name = "nomProd";
	nomProd.placeholder = "Nombre";
	nomProd.required = true;

	let descripcionProd = document.createElement("input");
	descripcionProd.type = "text";
	descripcionProd.name = "descripcionProd";
	descripcionProd.placeholder = "Descripción";
	descripcionProd.required = true;

	let stock = document.createElement("input");
	stock.type = "number";
	stock.name = "stock";
	stock.placeholder = "Stock";
	stock.required = true;
	stock.min = 0;

	let precioProd = document.createElement("input");
	precioProd.type = "number";
	precioProd.name = "precioProd";
	precioProd.placeholder = "Precio";
	precioProd.required = true;
	precioProd.min = 0;
	precioProd.step = 0.01;


	let pesoProd = document.createElement("input");
	pesoProd.type = "number";
	pesoProd.name = "pesoProd";
	pesoProd.placeholder = "Peso";
	pesoProd.required = true;
	pesoProd.min = 0;
	pesoProd.step = 0.1;

	let codCat = crearOptionsCategorias();


	let bsubmit = document.createElement("input");
	bsubmit.type = "submit";
	bsubmit.value = "Crear";

	formu.onsubmit = function(){return crearProducto(this);}

	formu.appendChild(nomProd);
	formu.appendChild(descripcionProd);
	formu.appendChild(stock);
	formu.appendChild(precioProd);
	formu.appendChild(pesoProd);
	formu.appendChild(codCat);
	formu.appendChild(bsubmit);
	
	return formu;
}

function crearProducto(formu){
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			try{
				if(this.responseText == "TRUE"){
					alert("Producto creado correctamente");
					cargarProductosAdmin();
				}else{
					alert(this.responseText);
					console.log(this.responseText);
				}
			}catch(e){
				alert("Lo sentimos, ha ocurrido un error al crear el producto."); 
			}
		}
	}
	let params = "nomProd=" + formu.nomProd.value + "&descripcionProd=" + formu.descripcionProd.value + "&stock=" + formu.stock.value + "&precioProd=" + formu.precioProd.value + "&pesoProd=" + formu.pesoProd.value + "&codCat=" + formu.codCat.value + "&accion=" + "crear";
	xhttp.open("POST", "/appCompleta_2/php/adminProductos_json.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(params);

	return false;
}

function eliminarProducto(producto){
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			try{
				if(this.responseText == "TRUE"){
					alert("Producto eliminado correctamente");
					cargarProductosAdmin();
				}else{
					alert(this.responseText);
					
				}
			}catch(e){
				alert("Lo sentimos, ha ocurrido un error al eliminar el producto.");
			}
		}
	};
	let params = "codProd=" + producto["CodProd"] + "&accion=" + "eliminar";
	xhttp.open("POST", "/appCompleta_2/php/adminProductos_json.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(params);
	return false;
}

function modificarStockProducto(formu){
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			try{
				if(this.responseText == "TRUE"){
					alert("Producto modificado correctamente");
					cargarProductosAdmin();
				}else{
					alert(this.responseText);
					
				}
			}catch(e){
				alert("Lo sentimos, ha ocurrido un error al modificar el producto.");
			}
		}
	};
	let params = "codProd=" + formu.cod.value + "&stock=" + formu.unidades.value + "&accion=" + "modificarStock";
	xhttp.open("POST", "/appCompleta_2/php/adminProductos_json.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(params);
	return false;
}

function crearOptionsCategorias(){
	let xhttp = new XMLHttpRequest();
	let opciones = document.createElement("select");
	opciones.name = "codCat";
	opciones.required = true;
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			try{
				let categorias = JSON.parse(this.responseText);
				for(let categoria of categorias){
					let opcion = document.createElement("option");
					opcion.value = categoria["CodCat"];
					opcion.innerHTML = categoria["NomCat"];
					opciones.appendChild(opcion);
				}
			}catch(e){
				alert("Lo sentimos, ha ocurrido un error al cargar las categorías.");
			}
		}
	};
	let params = "accion=" + "cargar";
	xhttp.open("POST", "/appCompleta_2/php/adminCategorias_json.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(params);
	return opciones;
}

//debe aparecer una tabla con todos los pedidos en la que una celda sea un select en el que se pueda cambiar el estado del pedido
function cargarPedidosAdmin(){
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			let contenido = document.getElementById("contenido");
			contenido.innerHTML = "";

			let titulo = document.createElement("h2");
			titulo.innerHTML = "Pedidos";
			contenido.appendChild(titulo);

			try{
				let pedidos = JSON.parse(this.responseText);
				
				let tabla = crearTablaPedidosAdmin(pedidos);
				contenido.appendChild(tabla);

			}catch(e){
				let mensaje = document.createElement("p");
				mensaje.innerHTML = "No hay pedidos";
				contenido.appendChild(mensaje);
			}
		}
	};
	let params = "accion=" + "cargar";
	xhttp.open("POST", "/appCompleta_2/php/adminPedidos_json.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(params);
	return false;
}

function crearTablaPedidosAdmin(pedidos) {
    let tabla = document.createElement("table");
    let cabecera = crearFila(["Código", "Fecha", "Estado", "Modificar", "Eliminar"], "th");
    tabla.appendChild(cabecera);

    for (let pedido of pedidos) {
        let estadoPedido = "";

        if (pedido["Enviado"] == 0) {
            estadoPedido = "En proceso";
        } else if (pedido["Enviado"] == 1) {
            estadoPedido = "Enviado";
        } else {
            estadoPedido = "Recibido";
        }

        let fila = crearFila([pedido["CodPedido"], pedido["Fecha"], estadoPedido], "td");

        let celda_modificar = document.createElement("td");
        let modificar = document.createElement("form");

        let estado = document.createElement("select");
        estado.name = "estado";
        estado.required = true;

        let opcion1 = document.createElement("option");
        opcion1.value = 0;
        opcion1.innerHTML = "En proceso";

        let opcion2 = document.createElement("option");
        opcion2.value = 1;
        opcion2.innerHTML = "Enviado";

        let opcion3 = document.createElement("option");
        opcion3.value = 2;
        opcion3.innerHTML = "Recibido";

        estado.appendChild(opcion1);
        estado.appendChild(opcion2);
        estado.appendChild(opcion3);

        let celda_eliminar = document.createElement("td");
        let eliminar = document.createElement("button");

        eliminar.innerHTML = "Eliminar";
        eliminar.onclick = function () {
            if (confirm('¿Estás seguro de que quieres eliminar este pedido?')) {
                return eliminarPedido(pedido);
            }
        };
		
        let cod = document.createElement("input");
        cod.type = "hidden";
        cod.name = "cod";
        cod.value = pedido["CodPedido"];

        let bsubmit = document.createElement("input");
        bsubmit.type = "submit";
        bsubmit.value = "Modificar";

        modificar.onsubmit = function () { return modificarEstadoPedido(this); };

        modificar.appendChild(estado);
        modificar.appendChild(cod);
        modificar.appendChild(bsubmit);

        celda_modificar.appendChild(modificar);
        fila.appendChild(celda_modificar);

		celda_eliminar.appendChild(eliminar);
        fila.appendChild(celda_eliminar);

        tabla.appendChild(fila);
    }

    return tabla;
}



function modificarEstadoPedido(formu){
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			try{
				if(this.responseText == "TRUE"){
					alert("Estado modificado correctamente");
					cargarPedidosAdmin();
				}else{
					alert(this.responseText);
					console.log(this.response);
					
				}
			}catch(e){
				alert("Lo sentimos, ha ocurrido un error al modificar el estado.");
			}
		}
	};
	let params = "codPedido=" + formu.cod.value + "&estado=" + formu.estado.value + "&accion=" + "modificarEstado";
	xhttp.open("POST", "/appCompleta_2/php/adminPedidos_json.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(params);
	return false;
}

function eliminarPedido(pedido){
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			try{
				if(this.responseText == "TRUE"){
					alert("Pedido eliminado correctamente");
					cargarPedidosAdmin();
				}else{
					alert(this.responseText);
					
				}
			}catch(e){
				alert("Lo sentimos, ha ocurrido un error al eliminar el pedido.");
			}
		}
	};
	let params = "codPedido=" + pedido["CodPedido"] + "&accion=" + "eliminar";
	xhttp.open("POST", "/appCompleta_2/php/adminPedidos_json.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(params);
	return false;
}

