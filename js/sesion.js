function mostrarRegistro(){
    let registro = document.getElementById('registro');
    let inicio = document.getElementById('login');
    registro.style.display = 'block';
    inicio.style.display = 'none';
}

function mostrarLogin(){
    let registro = document.getElementById('registro');
    let inicio = document.getElementById('login');
    registro.style.display = 'none';
    inicio.style.display = 'block';
}


function login(formu) {

    let xhttp = new XMLHttpRequest();



    let usuario = document.getElementById("idUsuario").value;
    let clave = document.getElementById("clave").value;

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            if (this.response === "FALSE" ) {
                alert("Revise usuario y contraseña");
            } else {
                let usuario = document.getElementById("idUsuario").value;
                document.getElementById("principal").style.display = "block";
                document.getElementById("login").style.display = "none";

                if(this.response === "ADMIN"){
                    document.getElementById("cab_admin").style.display = "block";
                    document.getElementById("cab_usuario").style.display = "none";
                    document.getElementById("nom_admin").innerHTML = "Usuario: " + usuario + " | ";
                    cargarEnlacesAdmin();
                }else{
                    document.getElementById("cab_admin").style.display = "none";
                    document.getElementById("cab_usuario").style.display = "block";
                    document.getElementById("nom_usuario").innerHTML = "Usuario: " + usuario + " | ";
                    cargarCategorias();
                }
            }
        }
    }

    xhttp.open("POST", "/appCompleta_2/php/login_json.php", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("idUsuario=" + usuario + "&clave=" + clave);
    return false;
}

function registrarUsuario(){
    let xhttp = new XMLHttpRequest();

    let usuario = document.getElementById("idUsuario-registro").value;
    let clave = document.getElementById("clave-registro").value;
    let nombre = document.getElementById("nombre").value;
    let apellido = document.getElementById("apellido").value;
    let correo = document.getElementById("correo").value;
    let fechaNac = document.getElementById("fechaNac").value;

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            if (this.response === "TRUE" ) {
                alert("Registro completado correctamente. Inicie sesión.");
                document.getElementById("registro").style.display = "none";
                document.getElementById("login").style.display = "block";
            } else {
                alert(this.response);
                //borrar los campos
                let elementosRegistro = document.getElementsByClassName("elem-registro");
                for(let elem of elementosRegistro){
                    elem.value = "";
                }
                
            }
        }
    }

    xhttp.open("POST", "/appCompleta_2/php/registro_json.php", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("idUsuario=" + usuario + "&clave=" + clave + "&nombre=" + nombre + "&apellido=" + apellido + "&correo=" + correo + "&fechaNac=" + fechaNac);
    return false;
}


function cerrarSesion(){
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("principal").style.display = "none";
            document.getElementById("login").style.display = "block";
            alert("Sesion cerrada con éxito");
            console.log(this.response);
        }
    }
    xhttp.open("GET", "/appCompleta_2/php/logout_json.php", true);
    xhttp.send();
    return false;
}
 