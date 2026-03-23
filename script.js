/* ======================================================== */
/* 1. CONFIGURACIÓN Y SELECTORES (OPTIMIZADOS)              */
/* ======================================================== */
const dbRef = firebase.database().ref('/estacionamiento/raw');
let partidos = {}; 

// Cache de elementos para máxima fluidez
const dom = {
    cajones: Array.from({length: 5}, (_, i) => document.querySelector(`.cajon${i+1}`)),
    numLibres: document.querySelector(".numero-verde"),
    numOcupados: document.querySelector(".numero-rojo"),
    menu: document.getElementById("menuLateral"),
    overlay: document.getElementById("overlay"),
    input: document.getElementById("inputUsuario"),
    chat: document.getElementById("chatArea")
};

/* ======================================================== */
/* 2. MOTOR REAL-TIME (LECTURA DE SENSORES)                 */
/* ======================================================== */
dbRef.on('value', (snapshot) => {
    const raw = snapshot.val(); // Recibe "11001" del ESP32
    if (!raw) return;

    let libres = 0;
    let ocupados = 0;

    dom.cajones.forEach((cajon, i) => {
        if (!cajon) return;
        
        // El ESP32 manda 1 para Libre y 0 para Ocupado
        const estaLibre = raw[i] === "1";

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
    });

    // Sincronizar actualización con el refresco de pantalla
    requestAnimationFrame(() => {
        if(dom.numLibres) dom.numLibres.innerText = libres.toString().padStart(3, '0');
        if(dom.numOcupados) dom.numOcupados.innerText = ocupados.toString().padStart(3, '0');
    });
});

/* ======================================================== */
/* 3. NAVEGACIÓN Y MENÚ (LA BARRA)                          */
/* ======================================================== */
function abrirMenu() {
    dom.menu.classList.add("activo");
    dom.overlay.classList.add("activo");
}

function cerrarMenu() {
    dom.menu.classList.remove("activo");
    dom.overlay.classList.remove("activo");
}

function toggleNotificaciones() {
    document.getElementById("panelNotificaciones").classList.toggle("activo");
}

function toggleSeccion(id) {
    document.getElementById(id)?.classList.toggle("activo");
    document.getElementById("flecha-" + id)?.classList.toggle("rotar");
}

/* ======================================================== */
/* 4. ASISTENTE VIRTUAL (DINO CHAT)                         */
/* ======================================================== */
function abrirAyuda() {
    const overlay = document.getElementById("overlayAyuda");
    const titulo = document.getElementById("tituloAyuda");
    const texto = document.getElementById("textoAyuda");
    const mensajeAyuda = document.getElementById("mensajeAyuda");
    const imagenCentral = document.getElementById("imagenCentral");
    const chatContenedor = document.querySelector(".chat-contenedor");

    overlay.classList.add("activo");
    titulo.innerHTML = ""; texto.innerHTML = ""; dom.chat.innerHTML = "";
    chatContenedor.classList.remove("activo");
    imagenCentral.classList.remove("monito-desaparece");
    mensajeAyuda.classList.remove("monito-desaparece");
    imagenCentral.style.display = "block";
    mensajeAyuda.style.display = "block";

    escribirTexto("¡Hola!", titulo, 40, () => {
        escribirTexto("Soy tu asistente virtual EXSOS", texto, 25, () => {
            setTimeout(() => {
                imagenCentral.classList.add("monito-desaparece");
                mensajeAyuda.classList.add("monito-desaparece");
                setTimeout(() => {
                    imagenCentral.style.display = "none";
                    mensajeAyuda.style.display = "none";
                    chatContenedor.classList.add("activo");
                    dom.chat.innerHTML = `
                        <div class="mensaje bot">
                            <img src="https://i.postimg.cc/WpxqwBv1/Feliz.png" class="avatar">
                            <div class="burbuja">¿En qué puedo ayudarte?</div>
                        </div>`;
                }, 500);
            }, 1200);
        });
    });
}

function cerrarAyuda(){
    document.getElementById("overlayAyuda").classList.remove("activo");
}

function enviarMensaje() {
    const textoUsuario = dom.input.value.trim();
    if (textoUsuario === "") return;

    dom.chat.innerHTML += `
        <div class="mensaje usuario">
            <div class="burbuja">${textoUsuario}</div>
            <img src="https://i.postimg.cc/3NzGy63L/Dina.png" class="avatar usuario-avatar">
        </div>`;
    dom.input.value = "";
    dom.chat.scrollTop = dom.chat.scrollHeight;

    const pensando = document.createElement("div");
    pensando.className = "mensaje bot";
    pensando.innerHTML = `<img src="https://i.postimg.cc/WpxqwBv1/Feliz.png" class="avatar"><div class="burbuja pensando">Escribiendo...</div>`;
    dom.chat.appendChild(pensando);

    setTimeout(() => {
        pensando.remove();
        const respuesta = generarRespuesta(textoUsuario);
        const mensajeBot = document.createElement("div");
        mensajeBot.className = "mensaje bot";
        mensajeBot.innerHTML = `<img src="https://i.postimg.cc/WpxqwBv1/Feliz.png" class="avatar"><div class="burbuja"></div>`;
        dom.chat.appendChild(mensajeBot);
        escribirTexto(respuesta, mensajeBot.querySelector(".burbuja"), 20);
        dom.chat.scrollTop = dom.chat.scrollHeight;
    }, 800);
}

function generarRespuesta(texto) {
    texto = texto.toLowerCase();
    if (texto.includes("verde")) return "El color verde indica que el lugar está disponible.";
    if (texto.includes("rojo")) return "El color rojo indica que el cajón está ocupado.";
    if (texto.includes("tiempo real")) return "Sí, el sistema se actualiza al instante con los sensores.";
    return "Lo siento, aún estoy aprendiendo. Pregúntame sobre los colores o el tiempo real.";
}

function escribirTexto(textoCompleto, elemento, velocidad, callback) {
    let i = 0;
    elemento.innerHTML = "";
    const intervalo = setInterval(() => {
        elemento.innerHTML += textoCompleto.charAt(i);
        i++;
        if (i >= textoCompleto.length) {
            clearInterval(intervalo);
            if (callback) callback();
        }
    }, velocidad);
}

/* ======================================================== */
/* 5. CALENDARIO Y PARTIDOS (LECTURA CSV)                   */
/* ======================================================== */
async function cargarPartidos() {
    try {
        const respuesta = await fetch("partidos.csv");
        const texto = await respuesta.text();
        const lineas = texto.split("\n").slice(1);

        lineas.forEach(linea => {
            const datos = linea.split(",");
            if (datos.length < 5) return;
            const clave = `${datos[0]}-${datos[1]}`;
            if (!partidos[clave]) partidos[clave] = [];
            partidos[clave].push({ rival: datos[3], local: datos[2], hora: datos[4] });
        });

        marcarPartidos();
        revisarPartidosHoy();
        revisarPartidosAnteriores();
    } catch (e) { console.error("Error al cargar partidos:", e); }
}

function marcarPartidos() {
    document.querySelectorAll(".mes").forEach((mesDiv, index) => {
        const mesNumero = index + 1;
        mesDiv.querySelectorAll(".dias span").forEach(dia => {
            const clave = `${mesNumero}-${dia.dataset.dia}`;
            if (partidos[clave]) {
                dia.classList.add("partido");
                dia.onclick = () => mostrarPopup(partidos[clave]);
            }
        });
    });
}

function mostrarPopup(listaPartidos) {
    const popup = document.getElementById("popup");
    popup.style.display = "flex";
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

function cerrarPopup() { document.getElementById("popup").style.display = "none"; }

function revisarPartidosHoy() {
    const hoy = new Date();
    const clave = `${hoy.getMonth() + 1}-${hoy.getDate()}`;
    const contenedor = document.getElementById("hoy");
    if (partidos[clave]) {
        document.getElementById("estadoVacioHoy").style.display = "none";
        partidos[clave].forEach(p => {
            const aviso = document.createElement("div");
            aviso.className = "notificacion-card";
            aviso.innerHTML = `<div class="noti-icono">⚽</div><div class="noti-texto"><b>Partido hoy</b><br>A las ${p.hora}</div>`;
            contenedor.appendChild(aviso);
        });
    }
    actualizarNumeroCampana();
}

function revisarPartidosAnteriores() {
    const hoy = new Date();
    const mesAct = hoy.getMonth() + 1;
    const diaAct = hoy.getDate();
    const contenedor = document.getElementById("anteriores");
    let hayEventos = false;

    Object.keys(partidos).forEach(clave => {
        const [m, d] = clave.split("-").map(Number);
        if (m < mesAct || (m === mesAct && d < diaAct)) {
            partidos[clave].forEach(p => {
                const aviso = document.createElement("div");
                aviso.className = "notificacion-card";
                aviso.innerHTML = `<div class="noti-icono">📅</div><div class="noti-texto"><b>${p.local} vs ${p.rival}</b><br>${d}/${m}/26</div>`;
                contenedor.appendChild(aviso);
                hayEventos = true;
            });
        }
    });
    document.getElementById("estadoVacioAnteriores").style.display = hayEventos ? "none" : "flex";
    actualizarNumeroCampana();
}

function corregirInicioMeses() {
    document.querySelectorAll(".mes").forEach((mesDiv, index) => {
        const diasContainer = mesDiv.querySelector(".dias");
        if (!diasContainer) return;
        diasContainer.querySelectorAll(".vacio").forEach(e => e.remove());
        let offset = new Date(2026, index, 1).getDay() - 1;
        if (offset < 0) offset = 6;
        for (let i = 0; i < offset; i++) {
            const espacio = document.createElement("span");
            espacio.className = "vacio";
            diasContainer.prepend(espacio);
        }
    });
}

function actualizarNumeroCampana() {
    const total = document.querySelectorAll(".notificacion-card").length;
    const badge = document.getElementById("badgeNoti");
    if (badge) {
        badge.textContent = total;
        badge.style.backgroundColor = (total === 0) ? "#00c800" : "red";
    }
}

// Inicialización final
document.addEventListener("DOMContentLoaded", () => {
    corregirInicioMeses();
    cargarPartidos();
    dom.input?.addEventListener("keypress", (e) => { if (e.key === "Enter") enviarMensaje(); });
});
