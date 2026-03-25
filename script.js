document.addEventListener("DOMContentLoaded", function(){

const firebaseConfig = {
    apiKey: "AIzaSyBTnfeDaDYQlk3ugUHzc3SXB_b7dMrv3Qg",
    databaseURL: "https://esp32-ecdcf-default-rtdb.asia-southeast1.firebasedatabase.app"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 🔥 GUARDAR ELEMENTOS UNA SOLA VEZ
const cajones = [
    document.querySelector(".cajon1"),
    document.querySelector(".cajon2"),
    document.querySelector(".cajon3"),
    document.querySelector(".cajon4"),
    document.querySelector(".cajon5")
];

const numeroVerde = document.querySelector(".numero-verde");
const numeroRojo = document.querySelector(".numero-rojo");

let estados = [1,1,1,1,1];

// 🔥 SOLO ACTUALIZA EL CAJÓN QUE CAMBIA
function actualizarCajon(i){

    if(estados[i] == 0){
        cajones[i].classList.remove("libre");
        cajones[i].classList.add("ocupado");
    }else{
        cajones[i].classList.remove("ocupado");
        cajones[i].classList.add("libre");
    }

    actualizarContador();
}

// 🔥 CONTADOR OPTIMIZADO
function actualizarContador(){

    let ocupados = estados.filter(e => e == 0).length;
    let libres = 5 - ocupados;

    numeroVerde.innerText = libres.toString().padStart(3,'0');
    numeroRojo.innerText = ocupados.toString().padStart(3,'0');
}

// 🔥 ESCUCHA INDIVIDUAL (ULTRA FLUIDO)
for(let i=1;i<=5;i++){

    db.ref("/estacionamiento/cajon" + i).on("value", (snapshot) => {

        if(snapshot.exists()){

            let nuevo = snapshot.val();

            // 🚀 SOLO SI CAMBIA
            if(estados[i-1] !== nuevo){

                estados[i-1] = nuevo;
                actualizarCajon(i-1);

            }
        }

    });

}

});

function cambiarEstadoCajon(numero, estado){

const cajon = document.querySelector(".cajon" + numero);

if(estado === "libre"){

cajon.classList.remove("ocupado");
cajon.classList.add("libre");

}else{

cajon.classList.remove("libre");
cajon.classList.add("ocupado");

}

}

/* ========================= */
/* MENU LATERAL */
/* ========================= */


function abrirMenu(){
    document.getElementById("menuLateral").classList.add("activo");
    document.getElementById("overlay").classList.add("activo");
}

function cerrarMenu(){
    document.getElementById("menuLateral").classList.remove("activo");
    document.getElementById("overlay").classList.remove("activo");
}

/* ========================= */
/* PANEL DE NOTIFICACIONES */
/* ========================= */

function toggleNotificaciones(){
    const panel = document.getElementById("panelNotificaciones");
    panel.classList.toggle("activo");
}

document.addEventListener("click", function(e){
    const panel = document.getElementById("panelNotificaciones");
    const container = document.querySelector(".notificaciones-container");

    if(container && !container.contains(e.target)){
        panel.classList.remove("activo");
    }
});

function toggleSeccion(id){
    const contenido = document.getElementById(id);
    const flecha = document.getElementById("flecha-" + id);

    contenido.classList.toggle("activo");
    flecha.classList.toggle("rotar");
}

/* ========================= */
/* AYUDANTE CHATBOT */
/* ========================= */

function abrirAyuda(){

    const overlay = document.getElementById("overlayAyuda");
    const titulo = document.getElementById("tituloAyuda");
    const texto = document.getElementById("textoAyuda");
    const mensajeAyuda = document.getElementById("mensajeAyuda");

    const imagenCentral = document.getElementById("imagenCentral");
    const chatContenedor = document.querySelector(".chat-contenedor");
    const chat = document.getElementById("chatArea");

    overlay.classList.add("activo");

    titulo.innerHTML = "";
    texto.innerHTML = "";
    chat.innerHTML = "";

    chatContenedor.classList.remove("activo");

    /* RESETEAR ESTADO */
    imagenCentral.classList.remove("monito-desaparece");
    mensajeAyuda.classList.remove("monito-desaparece");

    imagenCentral.style.display = "block";
    mensajeAyuda.style.display = "block";

    escribirTexto("¡Hola!", titulo, 50, () => {

        escribirTexto("Soy tu asistente virtual EXSOS", texto, 30, () => {

            setTimeout(()=>{

                imagenCentral.classList.add("monito-desaparece");
                mensajeAyuda.classList.add("monito-desaparece");

                setTimeout(()=>{

                    imagenCentral.style.display="none";
                    mensajeAyuda.style.display="none";

                    chatContenedor.classList.add("activo");

                    chat.innerHTML += `
                    <div class="mensaje bot">
                        <img src="https://i.postimg.cc/WpxqwBv1/Feliz.png" class="avatar">
                        <div class="burbuja">
                            ¿En qué puedo ayudarte?
                        </div>
                    </div>
                    `;

                    chat.scrollTop = chat.scrollHeight;

                },500);

            },1500);

        });

    });

}

function cerrarAyuda(){

    const overlay = document.getElementById("overlayAyuda");
    const chat = document.getElementById("chatArea");
    const imagenCentral = document.getElementById("imagenCentral");
    const chatContenedor = document.querySelector(".chat-contenedor");
    const mensajeAyuda = document.getElementById("mensajeAyuda");

    overlay.classList.remove("activo");

    chat.innerHTML="";
    chatContenedor.classList.remove("activo");

    /* RESETEAR ANIMACIÓN */
    imagenCentral.classList.remove("monito-desaparece");
    mensajeAyuda.classList.remove("monito-desaparece");

    imagenCentral.style.display="block";
    mensajeAyuda.style.display="block";
}

/* ========================= */
/* EFECTO MAQUINA DE ESCRIBIR */
/* ========================= */

function escribirTexto(textoCompleto, elemento, velocidad, callback){

    let i = 0;
    elemento.innerHTML = "";

    const intervalo = setInterval(()=>{

        elemento.innerHTML += textoCompleto.charAt(i);
        i++;

        if(i >= textoCompleto.length){
            clearInterval(intervalo);
            if(callback) callback();
        }

    }, velocidad);
}

/* ========================= */
/* AVATAR DINAMICO */
/* ========================= */

function obtenerAvatarBot(texto){

    texto = texto.toLowerCase();

    if(texto.includes("verde"))
        return "https://i.postimg.cc/WpxqwBv1/Feliz.png";

    if(texto.includes("rojo"))
        return "https://i.postimg.cc/WpxqwBv1/Feliz.png";

    if(texto.includes("tu nombre") || texto.includes("como te llamas") || texto.includes("eres"))
        return "https://i.postimg.cc/WpxqwBv1/Feliz.png";

    if(texto.includes("funciona") || texto.includes("funcionamiento") || texto.includes("colores") || texto.includes("color"))
        return "https://i.postimg.cc/zv83Hrh0/Dino-saludo.png";

    if(texto.includes("hora") || texto.includes("dia") || texto.includes("horario"))
        return "https://i.postimg.cc/zv83Hrh0/Dino-saludo.png";

    if(texto.includes("tiempo real") || texto.includes("actualiza en tiempo real") || texto.includes("actualiza solo") || texto.includes("automaticamente"))
        return "https://i.postimg.cc/pXnXVr41/chat.png";

    if(texto.includes("incorrectamente") || texto.includes("lugar incorrecto") || texto.includes("error"))
        return "https://i.postimg.cc/MTCZ18j7/sorry.webp";

    if(texto.includes("contador") || texto.includes("cada cuanto") || texto.includes("cada cuánto"))
        return "https://i.postimg.cc/pXnXVr41/chat.png";

    if(texto.includes("confiar") || texto.includes("disponibilidad"))
        return "https://i.postimg.cc/g0rG50VB/Dino-ss.png";

    if(texto.includes("no muestra color") || texto.includes("sin color"))
        return "https://i.postimg.cc/9XyCsK7N/risa.webp";

    if(texto.includes("actualizar pagina") || texto.includes("actualizar página") || texto.includes("recargar"))
        return "https://i.postimg.cc/sD1s6x3P/mua.webp";

    return "https://i.postimg.cc/rwwT0pPq/triste.png";
}

function obtenerAvatarUsuario(texto){

    if(texto.includes("verde"))
        return "https://i.postimg.cc/Xvg92Qgp/Pizza.png";

    if(texto.includes("rojo"))
        return "https://i.postimg.cc/ZqjyP0bk/duda.png";

    if(texto.includes("funciona") || texto.includes("funcionamiento") || texto.includes("colores") || texto.includes("color"))
        return "https://i.postimg.cc/qMCyfkLh/como.png";

    if(texto.includes("tu nombre") || texto.includes("como te llamas") || texto.includes("eres"))
        return "https://i.postimg.cc/3NzGy63L/Dina.png";

    if(texto.includes("hora") || texto.includes("dia") || texto.includes("horario"))
        return "https://i.postimg.cc/qMCyfkLh/como.png";

    if(texto.includes("tiempo real") || texto.includes("actualiza en tiempo real") || texto.includes("actualiza solo") || texto.includes("automaticamente"))
        return "https://i.postimg.cc/Xvg92Qgp/Pizza.png";

    if(texto.includes("incorrectamente") || texto.includes("lugar incorrecto") || texto.includes("error"))
        return "https://i.postimg.cc/h4NMQZZ7/fung.png";

    if(texto.includes("contador") || texto.includes("cada cuanto") || texto.includes("cada cuánto"))
        return "https://i.postimg.cc/WpxqwBv1/Feliz.png";

    if(texto.includes("confiar") || texto.includes("disponibilidad"))
        return "https://i.postimg.cc/WpxqwBv1/Feliz.png";

    if(texto.includes("no muestra color") || texto.includes("sin color"))
        return "https://i.postimg.cc/fLrtFFSV/pizza-serio.png";

    if(texto.includes("actualizar pagina") || texto.includes("actualizar página") || texto.includes("recargar"))
        return "https://i.postimg.cc/FFwGkCCf/LU.png";

    return "https://i.postimg.cc/3NzGy63L/Dina.png";
}

/* ========================= */
/* ENVIAR MENSAJE */
/* ========================= */

function enviarMensaje(){

    const input = document.getElementById("inputUsuario");
    const chat = document.getElementById("chatArea");

    const textoUsuario = input.value.trim();
    if(textoUsuario === "") return;

    const avatarUsuario = obtenerAvatarUsuario(textoUsuario);

    chat.innerHTML += `
    <div class="mensaje usuario">
        <div class="burbuja">${textoUsuario}</div>
        <img src="${avatarUsuario}" class="avatar usuario-avatar">
    </div>
    `;

    input.value="";

    const pensando = document.createElement("div");
    pensando.classList.add("mensaje","bot");
    pensando.innerHTML = `
        <img src="https://i.postimg.cc/WpxqwBv1/Feliz.png" class="avatar">
        <div class="burbuja pensando">Escribiendo...</div>
    `;

    chat.appendChild(pensando);

    chat.scrollTop = chat.scrollHeight;

    setTimeout(()=>{

        pensando.remove();

        const respuesta = generarRespuesta(textoUsuario);
        const avatarBot = obtenerAvatarBot(textoUsuario);

        const mensajeBot = document.createElement("div");
        mensajeBot.classList.add("mensaje","bot");

        mensajeBot.innerHTML = `
            <img src="${avatarBot}" class="avatar">
            <div class="burbuja"></div>
        `;

        chat.appendChild(mensajeBot);

        const burbuja = mensajeBot.querySelector(".burbuja");

        escribirTexto(respuesta, burbuja, 20);

        chat.scrollTop = chat.scrollHeight;

    },1000);

}

/* ========================= */
/* RESPUESTAS DEL BOT */
/* ========================= */

function generarRespuesta(texto){

    texto = texto.toLowerCase();

    if(texto.includes("verde")){
        return "El color verde indica que el lugar de estacionamiento está disponible y puede ser utilizado.";
    }

    if(texto.includes("funciona") || texto.includes("funcionamiento") || texto.includes("colores") || texto.includes("color")){
        return "El color verde indica que el lugar de estacionamiento está disponible y puede ser utilizado, mientras el color rojo indica que el cajón está ocupado por un vehículo.";
    }

    if(texto.includes("tu nombre") || texto.includes("como te llamas") || texto.includes("eres")){
        return "Mi nombre es Dino, soy el asistente oficial de la página EXSOS, estoy aquí para ayudarte a responder preguntas o dudas que tengas sobre la página";
    }

    if(texto.includes("hora") || texto.includes("dia") || texto.includes("horario")){
        return "El color verde indica que el lugar de estacionamiento está disponible y puede ser utilizado, mientras el color rojo indica que el cajón está ocupado por un vehículo.";
    }

    if(texto.includes("rojo")){
        return "El color rojo indica que el cajón está ocupado por un vehículo.";
    }

    if(texto.includes("tiempo real") || texto.includes("actualiza en tiempo real") || texto.includes("actualiza solo") || texto.includes("automaticamente")){
        return "Sí. El sistema se actualiza automáticamente conforme los sensores detectan la entrada o salida de vehículos.";
    }

    if(texto.includes("incorrectamente") || texto.includes("lugar incorrecto") || texto.includes("error")){
        return "Puedes reportarlo en la sección de Comentarios para que el personal revise el sensor correspondiente.";
    }

    if(texto.includes("contador") || texto.includes("cada cuanto") || texto.includes("cada cuánto")){
        return "El contador se actualiza automáticamente cada vez que un sensor detecta un cambio en un cajón.";
    }

    if(texto.includes("confiar") || texto.includes("disponibilidad")){
        return "El sistema tiene alta precisión, pero pueden existir pequeñas variaciones si un vehículo está entrando o saliendo en ese momento.";
    }

    if(texto.includes("no muestra color") || texto.includes("sin color")){
        return "Puede indicar que el sensor está en revisión o que hay un problema de comunicación. Se recomienda verificar físicamente el lugar.";
    }

    if(texto.includes("actualizar pagina") || texto.includes("actualizar página") || texto.includes("recargar")){
        return "No. La página se actualiza automáticamente, no necesitas actualizarla manualmente.";
    }

    return "Lo siento, aún estoy aprendiendo. Intenta preguntar sobre colores, disponibilidad o funcionamiento del sistema.";
}

/* ========================= */
/* ENTER PARA ENVIAR */
/* ========================= */

document.addEventListener("DOMContentLoaded", function(){

    const input = document.getElementById("inputUsuario");

    input.addEventListener("keypress", function(e){
        if(e.key === "Enter"){
            enviarMensaje();
        }
    });

});

/* ========================= */
/* CALENDARIO */
/* ========================= */

let partidos = {};

/* ---------- LEER CSV ---------- */

async function cargarPartidos(){

    const respuesta = await fetch("partidos.csv");
    const texto = await respuesta.text();

    const lineas = texto.split("\n");
    lineas.shift();

    lineas.forEach(linea => {

        const datos = linea.split(",");

        const mes = datos[0];
        const dia = datos[1];
        const local = datos[2];
        const rival = datos[3];
        const hora = datos[4];
        const logoLocal = datos[5];
        const logoRival = datos[6];

        const clave = mes + "-" + dia;

        if(!partidos[clave]){
            partidos[clave] = [];
        }

        partidos[clave].push({
            rival:rival,
            local:local,
            hora:hora,
            logoLocal:logoLocal,
            logoRival:logoRival
        });

    });

    marcarPartidos();
    activarClicks();
    revisarPartidosHoy();
    revisarPartidosAnteriores();

}

/* ---------- MARCAR DIAS ---------- */

function marcarPartidos(){

    const meses = document.querySelectorAll(".mes");

    meses.forEach((mesDiv, index) => {

        const mesNumero = index + 1;

        const dias = mesDiv.querySelectorAll(".dias span");

        dias.forEach(dia => {

            const numero = dia.dataset.dia;

            const clave = mesNumero + "-" + numero;

            if(partidos[clave]){
                dia.classList.add("partido");
            }

        });

    });

}

/* ---------- CLICK ---------- */

function activarClicks(){

    const meses = document.querySelectorAll(".mes");

    meses.forEach((mesDiv, index) => {

        const mesNumero = index + 1;

        const dias = mesDiv.querySelectorAll(".dias span");

        dias.forEach(dia => {

            dia.addEventListener("click", function(){

                const numero = this.dataset.dia;
                const clave = mesNumero + "-" + numero;

                if(partidos[clave]){
                    mostrarPopup(partidos[clave]);
                }

            });

        });

    });

}


/* ---------- POPUP ---------- */

function mostrarPopup(listaPartidos){

    document.getElementById("popup").style.display="flex";

    let contenido = "";

    listaPartidos.forEach(partido => {

        contenido += `
        <div class="partido-card">

            <div class="partido-info">

                <div class="equipo">
                    <img src="logos/${partido.logoLocal}">
                    <span class="nombre-equipo">${partido.local}</span>
                </div>

                <div class="vs">VS</div>

                <div class="equipo">
                    <span class="nombre-equipo">${partido.rival}</span>
                    <img src="logos/${partido.logoRival}">
                </div>

                <div class="info-partido">
                    <div class="hora">🕒 ${partido.hora}</div>
                </div>

            </div>

            <div class="barra-color"></div>

        </div>
        `;

    });

    document.getElementById("popup-rival").innerHTML = contenido;

}

function cerrarPopup(){

    document.getElementById("popup").style.display="none";

}

/* ---------- INICIAR ---------- */

document.addEventListener("DOMContentLoaded",function(){

corregirInicioMeses();
cargarPartidos();

});

/* ---------- REVISAR PARTIDOS PARA NOTIFICAR---------- */

function revisarPartidosHoy(){

const hoy = new Date();
const mes = hoy.getMonth() + 1;
const dia = hoy.getDate();

const clave = mes + "-" + dia;

const contenedor = document.getElementById("hoy");
const estadoVacio = document.getElementById("estadoVacioHoy");

if(partidos[clave]){

estadoVacio.style.display = "none";

partidos[clave].forEach(partido => {

const aviso = document.createElement("div");
aviso.classList.add("notificacion-card");

aviso.innerHTML = `
<div class="noti-icono">⚽</div>

<div class="noti-texto">
<div class="noti-titulo">Partido hoy</div>
<div class="noti-mensaje">
Hoy hay partido a las ${partido.hora}. Se recomienda salir temprano.
</div>
</div>
`;

contenedor.appendChild(aviso);

});

}

actualizarNumeroCampana();

}

/* ---------- REVISAR PARTIDOS anteriores---------- */

function revisarPartidosAnteriores(){

const hoy = new Date();
const mesActual = hoy.getMonth() + 1;
const diaActual = hoy.getDate();

const contenedor = document.getElementById("anteriores");
const estadoVacio = document.getElementById("estadoVacioAnteriores");

/* borrar solo notificaciones */
contenedor.querySelectorAll(".notificacion-card").forEach(e => e.remove());

let hayEventos = false;

Object.keys(partidos).forEach(clave => {

const partes = clave.split("-");
const mes = parseInt(partes[0]);
const dia = parseInt(partes[1]);

if(mes < mesActual || (mes === mesActual && dia < diaActual)){

partidos[clave].forEach(partido => {

const aviso = document.createElement("div");
aviso.classList.add("notificacion-card");

aviso.innerHTML = `
<div class="noti-icono">📅</div>

<div class="noti-texto">
<div class="noti-titulo">${partido.local} vs ${partido.rival}</div>
<div class="noti-mensaje">${dia}/${mes}/26 - ${partido.hora}</div>
</div>
`;

contenedor.appendChild(aviso);

hayEventos = true;

});

}

});

if(hayEventos){
estadoVacio.style.display = "none";
}else{
estadoVacio.style.display = "flex";
}

actualizarNumeroCampana();

}

/* ---------- CORRECCION DE MESES PARA QUE EMPIECEN BIEN---------- */


function corregirInicioMeses(){

const year = 2026;

document.querySelectorAll(".mes").forEach((mesDiv, index) => {

const diasContainer = mesDiv.querySelector(".dias");

/* eliminar espacios vacíos existentes */
diasContainer.querySelectorAll(".vacio").forEach(e => e.remove());

const primerDia = new Date(year, index, 1).getDay();

let offset = primerDia - 1;

if(offset < 0) offset = 6;

/* agregar espacios correctos */
for(let i = 0; i < offset; i++){

const espacio = document.createElement("span");
espacio.classList.add("vacio");

diasContainer.prepend(espacio);

}

});

}

/* ---------- Notificacion cambia el color---------- */


function actualizarNumeroCampana(){

const hoy = document.querySelectorAll("#hoy .notificacion-card").length;
const anteriores = document.querySelectorAll("#anteriores .notificacion-card").length;

const total = hoy + anteriores;

const badge = document.getElementById("badgeNoti");

/* cambiar numero */
badge.textContent = total;

/* cambiar color */

if(total === 0){
badge.style.backgroundColor = "#00c800"; // verde
}else{
badge.style.backgroundColor = "red"; // rojo
}

}





/* ========================= */
/* CONEXIÓN A FIREBASE       */
/* ========================= */
const firebaseConfig = {
    apiKey: "AIzaSyBTnfeDaDYQlk3ugUHzc3SXB_b7dMrv3Qg",
    databaseURL: "https://esp32-ecdcf-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Inicializar una sola vez
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

/* ========================= */
/* CONTROL DE ACCESO (PLUMA) */
/* ========================= */

// 1. Escuchar el sensor de presión en tiempo real
db.ref("/estacionamiento/sensor_presion").on("value", (snapshot) => {
    const alertaDiv = document.getElementById("contenedorAlerta");
    if(!alertaDiv) return;
    
    const sensor = snapshot.val();

    if (sensor === 1) {
        alertaDiv.innerHTML = `
            <div style="background: #d4edda; color: #155724; padding: 15px; border-radius: 8px; border: 1px solid #c3e6cb; margin: 10px 0; font-weight: bold; text-align: center;">
                ✅ Vehículo detectado. ¡Bienvenido!
            </div>`;
        alertaDiv.classList.add("visible");
    } else {
        alertaDiv.innerHTML = `
            <div style="background: #fff3cd; color: #856404; padding: 15px; border-radius: 8px; border: 1px solid #ffeeba; margin: 10px 0; font-weight: bold; text-align: center;">
                ⚠️ Posiciónate en la entrada para acceder.
            </div>`;
        alertaDiv.classList.add("visible");
        // Cerrar pluma si el carro se retira
        db.ref("/estacionamiento/pluma").set(0);
    }
});

// 2. Función del Botón (Debe estar afuera para que el onclick la encuentre)
function solicitarApertura() {
    db.ref("/estacionamiento/sensor_presion").once("value").then((snapshot) => {
        const sensorStatus = snapshot.val();

        if (sensorStatus === 1) {
            db.ref("/estacionamiento/pluma").set(1).then(() => {
                alert("Abriendo pluma... ¡Bienvenido a la UANL!");
            });
        } else {
            alert("No se detecta vehículo. Favor de posicionarse en la entrada.");
        }
    }).catch(error => console.error("Error en Firebase:", error));
}


