/* ========================= */
/* MOTOR DE RENDERIZADO ULTRA-FLUIDO */
/* ========================= */

// 1. Cacheamos los elementos (se buscan una sola vez en la vida)
const domCajones = Array.from({length: 5}, (_, i) => document.querySelector(`.cajon${i+1}`));
const numLibres = document.querySelector(".numero-verde");
const numOcupados = document.querySelector(".numero-rojo");

// 2. Escuchamos el string binario compacto
firebase.database().ref('/estacionamiento/raw').on('value', (snapshot) => {
    const raw = snapshot.val(); // Recibe algo como "10110"
    if (!raw) return;

    let libres = 0;
    let ocupados = 0;

    // Procesamiento por micro-tareas
    for (let i = 0; i < 5; i++) {
        const estaLibre = raw[i] === "1";
        const cajon = domCajones[i];

        if (!cajon) continue;

        // CAMBIO ATÓMICO: Solo toca el CSS si el estado es diferente
        if (estaLibre) {
            if (cajon.classList.contains("ocupado")) {
                cajon.classList.replace("ocupado", "libre");
            }
            libres++;
        } else {
            if (cajon.classList.contains("libre")) {
                cajon.classList.replace("libre", "ocupado");
            }
            ocupados++;
        }
    }

    // Actualización de textos (solo si los valores cambiaron)
    requestAnimationFrame(() => {
        if(numLibres) numLibres.innerText = libres.toString().padStart(3, '0');
        if(numOcupados) numOcupados.innerText = ocupados.toString().padStart(3, '0');
    });
});

/* ========================= */
/* MENU Y NOTIFICACIONES */
/* ========================= */
const abrirMenu = () => {
    document.getElementById("menuLateral").classList.add("activo");
    document.getElementById("overlay").classList.add("activo");
};

const cerrarMenu = () => {
    document.getElementById("menuLateral").classList.remove("activo");
    document.getElementById("overlay").classList.remove("activo");
};

function toggleNotificaciones() {
    document.getElementById("panelNotificaciones").classList.toggle("activo");
}

// Cerrar paneles al hacer clic fuera
document.addEventListener("click", (e) => {
    const panel = document.getElementById("panelNotificaciones");
    const container = document.querySelector(".notificaciones-container");
    if (panel && container && !container.contains(e.target)) {
        panel.classList.remove("activo");
    }
});

function toggleSeccion(id) {
    document.getElementById(id)?.classList.toggle("activo");
    document.getElementById("flecha-" + id)?.classList.toggle("rotar");
}

/* ========================= */
/* AYUDANTE CHATBOT (DINO) */
/* ========================= */
function abrirAyuda() {
    const elementos = {
        overlay: document.getElementById("overlayAyuda"),
        titulo: document.getElementById("tituloAyuda"),
        texto: document.getElementById("textoAyuda"),
        mensaje: document.getElementById("mensajeAyuda"),
        img: document.getElementById("imagenCentral"),
        chatCont: document.querySelector(".chat-contenedor"),
        chat: document.getElementById("chatArea")
    };

    elementos.overlay.classList.add("activo");
    elementos.titulo.innerHTML = elementos.texto.innerHTML = elementos.chat.innerHTML = "";
    elementos.chatCont.classList.remove("activo");
    elementos.img.classList.remove("monito-desaparece");
    elementos.mensaje.classList.remove("monito-desaparece");
    elementos.img.style.display = elementos.mensaje.style.display = "block";

    escribirTexto("¡Hola!", elementos.titulo, 40, () => {
        escribirTexto("Soy tu asistente virtual EXSOS", elementos.texto, 25, () => {
            setTimeout(() => {
                elementos.img.classList.add("monito-desaparece");
                elementos.mensaje.classList.add("monito-desaparece");
                setTimeout(() => {
                    elementos.img.style.display = elementos.mensaje.style.display = "none";
                    elementos.chatCont.classList.add("activo");
                    elementos.chat.innerHTML = `
                        <div class="mensaje bot">
                            <img src="https://i.postimg.cc/WpxqwBv1/Feliz.png" class="avatar">
                            <div class="burbuja">¿En qué puedo ayudarte?</div>
                        </div>`;
                }, 400);
            }, 1200);
        });
    });
}

function escribirTexto(texto, elemento, velocidad, callback) {
    let i = 0;
    elemento.innerHTML = "";
    const intervalo = setInterval(() => {
        elemento.innerHTML += texto.charAt(i++);
        if (i >= texto.length) {
            clearInterval(intervalo);
            if (callback) callback();
        }
    }, velocidad);
}

function enviarMensaje() {
    const input = document.getElementById("inputUsuario");
    const chat = document.getElementById("chatArea");
    const texto = input.value.trim();
    if (!texto) return;

    chat.innerHTML += `
        <div class="mensaje usuario">
            <div class="burbuja">${texto}</div>
            <img src="${obtenerAvatarUsuario(texto)}" class="avatar usuario-avatar">
        </div>`;
    
    input.value = "";
    const pensando = document.createElement("div");
    pensando.className = "mensaje bot";
    pensando.innerHTML = `<img src="https://i.postimg.cc/WpxqwBv1/Feliz.png" class="avatar"><div class="burbuja pensando">Escribiendo...</div>`;
    chat.appendChild(pensando);
    chat.scrollTop = chat.scrollHeight;

    setTimeout(() => {
        pensando.remove();
        const msgBot = document.createElement("div");
        msgBot.className = "mensaje bot";
        msgBot.innerHTML = `<img src="${obtenerAvatarBot(texto)}" class="avatar"><div class="burbuja"></div>`;
        chat.appendChild(msgBot);
        escribirTexto(generarRespuesta(texto), msgBot.querySelector(".burbuja"), 15);
        chat.scrollTop = chat.scrollHeight;
    }, 800);
}

/* ========================= */
/* LÓGICA DE CALENDARIO */
/* ========================= */
async function cargarPartidos() {
    try {
        const res = await fetch("partidos.csv");
        const texto = await res.text();
        const lineas = texto.split("\n").slice(1);

        lineas.forEach(linea => {
            const [mes, dia, local, rival, hora, logoL, logoR] = linea.split(",");
            if (!mes) return;
            const clave = `${mes}-${dia}`;
            if (!partidos[clave]) partidos[clave] = [];
            partidos[clave].push({ rival, local, hora, logoLocal: logoL, logoRival: logoR });
        });

        marcarPartidos();
        activarClicks();
        revisarPartidosHoy();
        revisarPartidosAnteriores();
    } catch (e) { console.error("Error cargando CSV:", e); }
}

function marcarPartidos() {
    document.querySelectorAll(".mes").forEach((mesDiv, i) => {
        mesDiv.querySelectorAll(".dias span").forEach(dia => {
            if (partidos[`${i + 1}-${dia.dataset.dia}`]) dia.classList.add("partido");
        });
    });
}

function actualizarNumeroCampana() {
    const total = document.querySelectorAll(".notificacion-card").length;
    const badge = document.getElementById("badgeNoti");
    if (badge) {
        badge.textContent = total;
        badge.style.backgroundColor = total === 0 ? "#00c800" : "red";
    }
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    corregirInicioMeses();
    cargarPartidos();
    const input = document.getElementById("inputUsuario");
    input?.addEventListener("keypress", (e) => e.key === "Enter" && enviarMensaje());
});

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

