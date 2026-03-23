/* ======================================================== */
/* 1. CONFIGURACIÓN Y MOTOR REAL-TIME (SOLO HOME)           */
/* ======================================================== */
const pathRaw = '/estacionamiento/raw';

// Verificamos si Firebase está cargado y si estamos en el Home (donde está el mapa)
if (typeof firebase !== 'undefined' && document.querySelector(".mapa-estacionamiento")) {
    firebase.database().ref(pathRaw).on('value', (snapshot) => {
        const raw = snapshot.val(); 
        if (!raw) return;

        let libres = 0, ocupados = 0;
        for (let i = 1; i <= 5; i++) {
            const cajon = document.querySelector(`.cajon${i}`);
            if (!cajon) continue;
            const estaLibre = raw[i - 1] === "1";

            if (estaLibre) {
                if (cajon.classList.contains("ocupado")) cajon.classList.replace("ocupado", "libre");
                libres++;
            } else {
                if (cajon.classList.contains("libre")) cajon.classList.replace("libre", "ocupado");
                ocupados++;
            }
        }

        // Actualización fluida de números
        requestAnimationFrame(() => {
            const elLibres = document.querySelector(".numero-verde");
            const elOcupados = document.querySelector(".numero-rojo");
            if(elLibres) elLibres.innerText = libres.toString().padStart(3, '0');
            if(elOcupados) elOcupados.innerText = ocupados.toString().padStart(3, '0');
        });
    });
}

/* ======================================================== */
/* 2. NAVEGACIÓN Y MENÚ (UNIVERSAL)                         */
/* ======================================================== */
function abrirMenu() {
    document.getElementById("menuLateral").classList.add("activo");
    document.getElementById("overlay").classList.add("activo");
}

function cerrarMenu() {
    document.getElementById("menuLateral").classList.remove("activo");
    document.getElementById("overlay").classList.remove("activo");
}

function toggleNotificaciones() {
    document.getElementById("panelNotificaciones").classList.toggle("activo");
}

function toggleSeccion(id) {
    document.getElementById(id)?.classList.toggle("activo");
    document.getElementById("flecha-" + id)?.classList.toggle("rotar");
}

// Cerrar al hacer clic fuera
document.addEventListener("click", (e) => {
    const panel = document.getElementById("panelNotificaciones");
    const btn = document.querySelector(".campana-wrapper");
    if (panel?.classList.contains("activo") && !panel.contains(e.target) && !btn.contains(e.target)) {
        panel.classList.remove("activo");
    }
});

/* ======================================================== */
/* 3. ASISTENTE DINO (AYUDA) - REPARADO                     */
/* ======================================================== */
function abrirAyuda() {
    const overlay = document.getElementById("overlayAyuda");
    const titulo = document.getElementById("tituloAyuda");
    const texto = document.getElementById("textoAyuda");
    const img = document.getElementById("imagenCentral");
    const chatCont = document.querySelector(".chat-contenedor");
    const msjAyuda = document.getElementById("mensajeAyuda");

    if(!overlay) return;
    
    overlay.classList.add("activo");
    img.style.display = "block";
    msjAyuda.style.display = "block";
    chatCont.classList.remove("activo");
    img.classList.remove("monito-desaparece");
    msjAyuda.classList.remove("monito-desaparece");

    escribirTexto("¡Hola!", titulo, 50, () => {
        escribirTexto("Soy tu asistente virtual EXSOS", texto, 30, () => {
            setTimeout(() => {
                img.classList.add("monito-desaparece");
                msjAyuda.classList.add("monito-desaparece");
                setTimeout(() => {
                    img.style.display = "none";
                    msjAyuda.style.display = "none";
                    chatCont.classList.add("activo");
                }, 500);
            }, 1500);
        });
    });
}

function cerrarAyuda() { document.getElementById("overlayAyuda").classList.remove("activo"); }

function escribirTexto(t, el, v, cb) {
    let i = 0; el.innerHTML = "";
    const timer = setInterval(() => {
        el.innerHTML += t.charAt(i++);
        if (i >= t.length) { clearInterval(timer); if(cb) cb(); }
    }, v);
}

function enviarMensaje() {
    const input = document.getElementById("inputUsuario");
    const chat = document.getElementById("chatArea");
    if (!input.value.trim()) return;
    chat.innerHTML += `<div class="mensaje usuario"><div class="burbuja">${input.value}</div><img src="https://i.postimg.cc/3NzGy63L/Dina.png" class="avatar"></div>`;
    input.value = "";
    chat.scrollTop = chat.scrollHeight;
}

/* ======================================================== */
/* 4. NOTIFICACIONES (BALONCITO) Y CALENDARIO               */
/* ======================================================== */
let partidosGlobal = {};

async function cargarPartidos() {
    try {
        const res = await fetch("partidos.csv");
        const texto = await res.text();
        const lineas = texto.split("\n").slice(1);

        lineas.forEach(l => {
            const d = l.split(",");
            if (d.length < 5) return;
            const clave = `${d[0].trim()}-${d[1].trim()}`;
            if (!partidosGlobal[clave]) partidosGlobal[clave] = [];
            partidosGlobal[clave].push({ local: d[2], rival: d[3], hora: d[4] });
        });

        revisarHoy();
        if(document.querySelector(".calendario")) marcarDias();
    } catch (e) { console.warn("Archivo CSV no detectado."); }
}

function revisarHoy() {
    const hoy = new Date();
    const clave = `${hoy.getMonth() + 1}-${hoy.getDate()}`;
    const contenedor = document.getElementById("hoy");
    if (!contenedor) return;

    if (partidosGlobal[clave]) {
        document.getElementById("estadoVacioHoy").style.display = "none";
        contenedor.innerHTML = "";
        partidosGlobal[clave].forEach(p => {
            contenedor.innerHTML += `
                <div class="notificacion-card">
                    <img src="https://i.imgur.com/gANyK8b.png" class="noti-icono-balon" style="width:30px; height:30px;">
                    <div class="noti-texto">
                        <div class="noti-titulo"><b>Partido hoy</b></div>
                        <div class="noti-mensaje">${p.local} vs ${p.rival} a las ${p.hora}</div>
                    </div>
                </div>`;
        });
    }
    actualizarBadge();
}

function marcarDias() {
    document.querySelectorAll(".mes").forEach((mesDiv, i) => {
        mesDiv.querySelectorAll(".dias span").forEach(dia => {
            if (partidosGlobal[`${i + 1}-${dia.dataset.dia}`]) {
                dia.classList.add("partido");
                dia.onclick = () => mostrarPopup(partidosGlobal[`${i + 1}-${dia.dataset.dia}`]);
            }
        });
    });
}

function mostrarPopup(lista) {
    document.getElementById("popup").style.display = "flex";
    let html = "";
    lista.forEach(p => html += `<div class="partido-card"><b>${p.local} vs ${p.rival}</b><br>🕒 ${p.hora}</div>`);
    document.getElementById("popup-rival").innerHTML = html;
}

function cerrarPopup() { document.getElementById("popup").style.display = "none"; }

function actualizarBadge() {
    const n = document.querySelectorAll(".notificacion-card").length;
    const badge = document.getElementById("badgeNoti");
    if (badge) {
        badge.textContent = n;
        badge.style.backgroundColor = n === 0 ? "#00c800" : "red";
    }
}

/* ======================================================== */
/* 5. INICIALIZACIÓN                                        */
/* ======================================================== */
document.addEventListener("DOMContentLoaded", () => {
    cargarPartidos();
    // Alinear meses
    if(document.querySelector(".mes")) {
        document.querySelectorAll(".mes").forEach((mesDiv, index) => {
            const container = mesDiv.querySelector(".dias");
            let offset = new Date(2026, index, 1).getDay() - 1;
            if (offset < 0) offset = 6;
            for (let i = 0; i < offset; i++) {
                const span = document.createElement("span");
                span.className = "vacio";
                container.prepend(span);
            }
        });
    }
});
