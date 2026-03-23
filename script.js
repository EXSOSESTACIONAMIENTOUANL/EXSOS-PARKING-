/* ========================================== */
/* 1. ASISTENTE AYUDA (DINO) - REPARADO       */
/* ========================================== */
function abrirAyuda() {
    const overlay = document.getElementById("overlayAyuda");
    const titulo = document.getElementById("tituloAyuda");
    const texto = document.getElementById("textoAyuda");
    const chatCont = document.querySelector(".chat-contenedor");
    const chatArea = document.getElementById("chatArea");
    const imagenCentral = document.getElementById("imagenCentral");
    const mensajeAyuda = document.getElementById("mensajeAyuda");

    if(!overlay) return;
    
    // Resetear visibilidad para que se vea como en tu foto
    overlay.classList.add("activo");
    imagenCentral.style.display = "block";
    mensajeAyuda.style.display = "block";
    chatCont.classList.remove("activo");

    // Efecto de escritura como en la referencia
    escribirTexto("¡Hola!", titulo, 50, () => {
        escribirTexto("Soy tu asistente virtual EXSOS", texto, 30, () => {
            setTimeout(() => {
                // Después del saludo, mostrar el chat si lo deseas
                imagenCentral.classList.add("monito-desaparece");
                mensajeAyuda.classList.add("monito-desaparece");
                setTimeout(() => {
                    imagenCentral.style.display = "none";
                    mensajeAyuda.style.display = "none";
                    chatCont.classList.add("activo");
                    if(chatArea.innerHTML === "") {
                        chatArea.innerHTML = `<div class="mensaje bot"><img src="https://i.postimg.cc/76TSnwb3/Dino.jpg" class="avatar"><div class="burbuja">¿En qué puedo ayudarte?</div></div>`;
                    }
                }, 500);
            }, 1500);
        });
    });
}

function escribirTexto(t, el, v, cb) {
    let i = 0; el.innerHTML = "";
    const int = setInterval(() => {
        el.innerHTML += t.charAt(i++);
        if (i >= t.length) { clearInterval(int); if(cb) cb(); }
    }, v);
}

/* ========================================== */
/* 2. NOTIFICACIONES (BALONCITO) - REPARADO   */
/* ========================================== */
async function cargarPartidos() {
    try {
        const res = await fetch("partidos.csv");
        const texto = await res.text();
        const lineas = texto.split("\n").slice(1);
        
        // Limpiar objeto partidos
        const partidosData = {};

        lineas.forEach(l => {
            const d = l.split(",");
            if (d.length < 5) return;
            const clave = `${d[0].trim()}-${d[1].trim()}`;
            if (!partidosData[clave]) partidosData[clave] = [];
            partidosData[clave].push({ local: d[2], rival: d[3], hora: d[4] });
        });

        revisarPartidos(partidosData);
        if(document.querySelector(".calendario")) marcarCalendario(partidosData);
    } catch (e) { console.error("Error al cargar baloncitos"); }
}

function revisarPartidos(data) {
    const hoy = new Date();
    const claveHoy = `${hoy.getMonth() + 1}-${hoy.getDate()}`;
    const contenedor = document.getElementById("hoy");
    const estadoVacio = document.getElementById("estadoVacioHoy");

    if (!contenedor) return;

    if (data[claveHoy]) {
        if(estadoVacio) estadoVacio.style.display = "none";
        contenedor.innerHTML = ""; // Limpiar antes de rellenar
        
        data[claveHoy].forEach(p => {
            // Creamos el HTML con el icono del balón igual a tu imagen
            const div = document.createElement("div");
            div.className = "notificacion-card";
            div.innerHTML = `
                <img src="https://i.imgur.com/gANyK8b.png" class="noti-icono-balon" style="width:30px; height:30px; margin-right:10px;">
                <div class="noti-texto">
                    <div class="noti-titulo"><b>Partido hoy</b></div>
                    <div class="noti-mensaje">Hoy hay partido a las ${p.hora}. Se recomienda salir temprano.</div>
                </div>`;
            contenedor.appendChild(div);
        });
    }
    actualizarBadge();
}

/* ========================================== */
/* 3. NAVEGACIÓN Y OTROS                      */
/* ========================================== */
function abrirMenu() {
    document.getElementById("menuLateral").classList.add("activo");
    document.getElementById("overlay").classList.add("activo");
}

function cerrarMenu() {
    document.getElementById("menuLateral").classList.remove("activo");
    document.getElementById("overlay").classList.remove("activo");
}

function cerrarAyuda() {
    document.getElementById("overlayAyuda").classList.remove("activo");
}

function toggleNotificaciones() {
    document.getElementById("panelNotificaciones").classList.toggle("activo");
}

function toggleSeccion(id) {
    document.getElementById(id)?.classList.toggle("activo");
    document.getElementById("flecha-" + id)?.classList.toggle("rotar");
}

function actualizarBadge() {
    const total = document.querySelectorAll(".notificacion-card").length;
    const badge = document.getElementById("badgeNoti");
    if(badge) {
        badge.textContent = total;
        badge.style.backgroundColor = (total === 0) ? "#00c800" : "red";
    }
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    cargarPartidos();
});
