/* ======================================================== */
/* 1. CONEXIÓN A FIREBASE (AÑADIDA A TU LÓGICA)             */
/* ======================================================== */
const dbRef = firebase.database().ref('/estacionamiento/raw');

// Esta es la única parte "nueva" para que los cajones funcionen
if (typeof firebase !== 'undefined' && document.querySelector(".mapa-estacionamiento")) {
    dbRef.on('value', (snapshot) => {
        const raw = snapshot.val(); 
        if (!raw) return;
        
        // Actualizamos los cajones usando tus clases
        for (let i = 1; i <= 5; i++) {
            const cajon = document.querySelector(`.cajon${i}`);
            if (cajon) {
                if (raw[i - 1] === "1") {
                    cajon.classList.remove("ocupado");
                    cajon.classList.add("libre");
                } else {
                    cajon.classList.remove("libre");
                    cajon.classList.add("ocupado");
                }
            }
        }
        
        // Actualizamos tus contadores
        const libres = (raw.match(/1/g) || []).length;
        const ocupados = (raw.match(/0/g) || []).length;
        const elV = document.querySelector(".numero-verde");
        const elR = document.querySelector(".numero-rojo");
        if(elV) elV.innerText = libres.toString().padStart(3, '0');
        if(elR) elR.innerText = ocupados.toString().padStart(3, '0');
    });
}

/* ========================= */
/* 2. TU LÓGICA DE MENÚ      */
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
/* 3. TU PANEL DE NOTIFICACIONES */
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
    if(contenido) contenido.classList.toggle("activo");
    if(flecha) flecha.classList.toggle("rotar");
}

/* ========================= */
/* 4. TU AYUDANTE DINO       */
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
    titulo.innerHTML = ""; texto.innerHTML = ""; chat.innerHTML = "";
    chatContenedor.classList.remove("activo");
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
                        <div class="burbuja">¿En qué puedo ayudarte?</div>
                    </div>`;
                    chat.scrollTop = chat.scrollHeight;
                },500);
            },1500);
        });
    });
}

function cerrarAyuda(){
    document.getElementById("overlayAyuda").classList.remove("activo");
}

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

function enviarMensaje(){
    const input = document.getElementById("inputUsuario");
    const chat = document.getElementById("chatArea");
    const textoUsuario = input.value.trim();
    if(textoUsuario === "") return;

    chat.innerHTML += `
    <div class="mensaje usuario">
        <div class="burbuja">${textoUsuario}</div>
        <img src="https://i.postimg.cc/3NzGy63L/Dina.png" class="avatar usuario-avatar">
    </div>`;

    input.value="";
    chat.scrollTop = chat.scrollHeight;

    setTimeout(()=>{
        const mensajeBot = document.createElement("div");
        mensajeBot.classList.add("mensaje","bot");
        mensajeBot.innerHTML = `<img src="https://i.postimg.cc/WpxqwBv1/Feliz.png" class="avatar"><div class="burbuja">Entendido, estoy procesando tu duda...</div>`;
        chat.appendChild(mensajeBot);
        chat.scrollTop = chat.scrollHeight;
    },1000);
}

/* ========================= */
/* 5. TU CALENDARIO (CSV)    */
/* ========================= */
let partidos = {};

async function cargarPartidos(){
    try {
        const respuesta = await fetch("partidos.csv");
        const texto = await respuesta.text();
        const lineas = texto.split("\n");
        lineas.shift();

        lineas.forEach(linea => {
            const datos = linea.split(",");
            if(datos.length < 5) return;
            const clave = datos[0].trim() + "-" + datos[1].trim(); 
            if(!partidos[clave]) partidos[clave] = [];
            partidos[clave].push({ rival:datos[3], local:datos[2], hora:datos[4], logoLocal:datos[5], logoRival:datos[6] });
        });

        marcarPartidos();
        activarClicks();
        revisarPartidosHoy();
        revisarPartidosAnteriores();
    } catch(e) { console.error("Error al cargar el CSV"); }
}

function marcarPartidos(){
    const meses = document.querySelectorAll(".mes");
    meses.forEach((mesDiv, index) => {
        const mesNumero = index + 1;
        mesDiv.querySelectorAll(".dias span").forEach(dia => {
            if(partidos[mesNumero + "-" + dia.dataset.dia]) dia.classList.add("partido");
        });
    });
}

function activarClicks(){
    const meses = document.querySelectorAll(".mes");
    meses.forEach((mesDiv, index) => {
        const mesNumero = index + 1;
        mesDiv.querySelectorAll(".dias span").forEach(dia => {
            dia.addEventListener("click", function(){
                const clave = mesNumero + "-" + this.dataset.dia;
                if(partidos[clave]) mostrarPopup(partidos[clave]);
            });
        });
    });
}

function mostrarPopup(listaPartidos){
    const popup = document.getElementById("popup");
    popup.style.display="flex";
    let contenido = "";
    listaPartidos.forEach(p => {
        contenido += `
        <div class="partido-card">
            <div class="partido-info">
                <div class="equipo"><span class="nombre-equipo">${p.local}</span></div>
                <div class="vs">VS</div>
                <div class="equipo"><span class="nombre-equipo">${p.rival}</span></div>
                <div class="info-partido"><div class="hora">🕒 ${p.hora}</div></div>
            </div>
            <div class="barra-color"></div>
        </div>`;
    });
    document.getElementById("popup-rival").innerHTML = contenido;
}

function cerrarPopup(){ document.getElementById("popup").style.display="none"; }

function revisarPartidosHoy(){
    const hoy = new Date();
    const clave = (hoy.getMonth() + 1) + "-" + hoy.getDate();
    const contenedor = document.getElementById("hoy");
    if(contenedor && partidos[clave]){
        document.getElementById("estadoVacioHoy").style.display = "none";
        partidos[clave].forEach(p => {
            const aviso = document.createElement("div");
            aviso.classList.add("notificacion-card");
            aviso.innerHTML = `<div class="noti-icono">⚽</div><div class="noti-texto"><b>Partido hoy</b><br>A las ${p.hora}</div>`;
            contenedor.appendChild(aviso);
        });
    }
    actualizarNumeroCampana();
}

function revisarPartidosAnteriores(){
    const hoy = new Date();
    const mesAct = hoy.getMonth() + 1;
    const diaAct = hoy.getDate();
    const contenedor = document.getElementById("anteriores");
    if(!contenedor) return;
    let hayEventos = false;

    Object.keys(partidos).forEach(clave => {
        const [m, d] = clave.split("-").map(Number);
        if(m < mesAct || (m === mesAct && d < diaAct)){
            partidos[clave].forEach(p => {
                const aviso = document.createElement("div");
                aviso.classList.add("notificacion-card");
                aviso.innerHTML = `<div class="noti-icono">📅</div><div class="noti-texto"><b>${p.local} vs ${p.rival}</b><br>${d}/${m}/26</div>`;
                contenedor.appendChild(aviso);
                hayEventos = true;
            });
        }
    });
    if(document.getElementById("estadoVacioAnteriores")) 
        document.getElementById("estadoVacioAnteriores").style.display = hayEventos ? "none" : "flex";
    actualizarNumeroCampana();
}

function actualizarNumeroCampana(){
    const total = document.querySelectorAll(".notificacion-card").length;
    const badge = document.getElementById("badgeNoti");
    if(badge){
        badge.textContent = total;
        badge.style.backgroundColor = (total === 0) ? "#00c800" : "red";
    }
}

/* ========================= */
/* 6. INICIALIZACIÓN         */
/* ========================= */
document.addEventListener("DOMContentLoaded", () => {
    // Alinear meses
    document.querySelectorAll(".mes").forEach((mesDiv, index) => {
        const diasContainer = mesDiv.querySelector(".dias");
        if(diasContainer) {
            diasContainer.querySelectorAll(".vacio").forEach(e => e.remove());
            let offset = new Date(2026, index, 1).getDay() - 1;
            if (offset < 0) offset = 6;
            for (let i = 0; i < offset; i++) {
                const span = document.createElement("span");
                span.className = "vacio";
                diasContainer.prepend(span);
            }
        }
    });
    cargarPartidos();
});
