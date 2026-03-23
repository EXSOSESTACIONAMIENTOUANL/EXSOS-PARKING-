/* ========================================== */
/* 1. CONFIGURACIÓN Y SELECTORES (CACHE)      */
/* ========================================== */
const dbRef = firebase.database().ref('/estacionamiento/raw');
let partidos = {}; 

const dom = {
    cajones: Array.from({length: 5}, (_, i) => document.querySelector(`.cajon${i+1}`)),
    numLibres: document.querySelector(".numero-verde"),
    numOcupados: document.querySelector(".numero-rojo"),
    menu: document.getElementById("menuLateral"),
    overlay: document.getElementById("overlay"),
    input: document.getElementById("inputUsuario"),
    chat: document.getElementById("chatArea"),
    badge: document.getElementById("badgeNoti")
};

/* ========================================== */
/* 2. MOTOR REAL-TIME (SENSORES)              */
/* ========================================== */
dbRef.on('value', (snapshot) => {
    const raw = snapshot.val(); // Recibe "01101"
    if (!raw) return;

    let libres = 0, ocupados = 0;
    dom.cajones.forEach((cajon, i) => {
        if (!cajon) return;
        const estaLibre = raw[i] === "1";
        if (estaLibre) {
            if (cajon.classList.contains("ocupado")) cajon.classList.replace("ocupado", "libre");
            libres++;
        } else {
            if (cajon.classList.contains("libre")) cajon.classList.replace("libre", "ocupado");
            ocupados++;
        }
    });

    requestAnimationFrame(() => {
        if(dom.numLibres) dom.numLibres.innerText = libres.toString().padStart(3, '0');
        if(dom.numOcupados) dom.numOcupados.innerText = ocupados.toString().padStart(3, '0');
    });
});

/* ========================================== */
/* 3. NAVEGACIÓN (MENÚ Y NOTIFICACIONES)      */
/* ========================================== */
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

/* ========================================== */
/* 4. ASISTENTE DINO (AYUDA)                  */
/* ========================================== */
function abrirAyuda() {
    const overlay = document.getElementById("overlayAyuda");
    const titulo = document.getElementById("tituloAyuda");
    const texto = document.getElementById("textoAyuda");
    const msj = document.getElementById("mensajeAyuda");
    const img = document.getElementById("imagenCentral");
    const chatCont = document.querySelector(".chat-contenedor");

    overlay.classList.add("activo");
    titulo.innerHTML = ""; texto.innerHTML = ""; dom.chat.innerHTML = "";
    chatCont.classList.remove("activo");
    img.classList.remove("monito-desaparece");
    msj.classList.remove("monito-desaparece");
    img.style.display = msj.style.display = "block";

    escribirTexto("¡Hola!", titulo, 40, () => {
        escribirTexto("Soy Dino, tu asistente EXSOS", texto, 25, () => {
            setTimeout(() => {
                img.classList.add("monito-desaparece");
                msj.classList.add("monito-desaparece");
                setTimeout(() => {
                    img.style.display = "none";
                    msj.style.display = "none";
                    chatCont.classList.add("activo");
                    dom.chat.innerHTML = `<div class="mensaje bot"><img src="https://i.postimg.cc/WpxqwBv1/Feliz.png" class="avatar"><div class="burbuja">¿En qué te ayudo?</div></div>`;
                }, 500);
            }, 1000);
        });
    });
}

function cerrarAyuda() { document.getElementById("overlayAyuda").classList.remove("activo"); }

function escribirTexto(t, el, v, cb) {
    let i = 0; el.innerHTML = "";
    const int = setInterval(() => {
        el.innerHTML += t.charAt(i++);
        if (i >= t.length) { clearInterval(int); if(cb) cb(); }
    }, v);
}

function enviarMensaje() {
    const t = dom.input.value.trim();
    if (!t) return;
    dom.chat.innerHTML += `<div class="mensaje usuario"><div class="burbuja">${t}</div><img src="https://i.postimg.cc/3NzGy63L/Dina.png" class="avatar usuario-avatar"></div>`;
    dom.input.value = "";
    dom.chat.scrollTop = dom.chat.scrollHeight;
}

/* ========================================== */
/* 5. CALENDARIO Y PARTIDOS (CSV)             */
/* ========================================== */
async function cargarPartidos() {
    try {
        const res = await fetch("partidos.csv");
        const texto = await res.text();
        texto.split("\n").slice(1).forEach(l => {
            const d = l.split(",");
            if (d.length < 4) return;
            const clave = `${d[0]}-${d[1]}`;
            if (!partidos[clave]) partidos[clave] = [];
            partidos[clave].push({ local: d[2], rival: d[3], hora: d[4] });
        });
        marcarPartidos();
        revisarEventos();
    } catch (e) { console.error("Error CSV"); }
}

function marcarPartidos() {
    document.querySelectorAll(".mes").forEach((mesDiv, i) => {
        const mesNum = i + 1;
        mesDiv.querySelectorAll(".dias span").forEach(dia => {
            const clave = `${mesNum}-${dia.dataset.dia}`;
            if (partidos[clave]) {
                dia.classList.add("partido");
                dia.onclick = () => mostrarPopup(partidos[clave]);
            }
        });
    });
}

function mostrarPopup(lista) {
    document.getElementById("popup").style.display = "flex";
    let html = "";
    lista.forEach(p => {
        html += `<div class="partido-card"><b>${p.local} vs ${p.rival}</b><br>🕒 ${p.hora}</div>`;
    });
    document.getElementById("popup-rival").innerHTML = html;
}

function cerrarPopup() { document.getElementById("popup").style.display = "none"; }

function revisarEventos() {
    const hoy = new Date();
    const clave = `${hoy.getMonth() + 1}-${hoy.getDate()}`;
    const cont = document.getElementById("hoy");
    if (partidos[clave]) {
        document.getElementById("estadoVacioHoy").style.display = "none";
        partidos[clave].forEach(p => {
            cont.innerHTML += `<div class="notificacion-card">⚽ Partido a las ${p.hora}</div>`;
        });
    }
    const n = document.querySelectorAll(".notificacion-card").length;
    if (dom.badge) {
        dom.badge.textContent = n;
        dom.badge.style.backgroundColor = n === 0 ? "#00c800" : "red";
    }
}

/* ========================================== */
/* INICIALIZACIÓN                             */
/* ========================================== */
document.addEventListener("DOMContentLoaded", () => {
    // Corregir inicio de meses
    document.querySelectorAll(".mes").forEach((mesDiv, index) => {
        const container = mesDiv.querySelector(".dias");
        if (!container) return;
        container.querySelectorAll(".vacio").forEach(v => v.remove());
        let offset = new Date(2026, index, 1).getDay() - 1;
        if (offset < 0) offset = 6;
        for (let i = 0; i < offset; i++) {
            const span = document.createElement("span");
            span.className = "vacio";
            container.prepend(span);
        }
    });
    cargarPartidos();
    dom.input?.addEventListener("keypress", (e) => e.key === "Enter" && enviarMensaje());
});
