/* ======================================================== */
/* 1. CONFIGURACIÓN Y MOTOR REAL-TIME (SOLO HOME)           */
/* ======================================================== */
const pathRaw = '/estacionamiento/raw';

if (typeof firebase !== 'undefined' && document.querySelector(".mapa-estacionamiento")) {
    firebase.database().ref(pathRaw).on('value', (snapshot) => {
        const raw = snapshot.val(); 
        if (!raw) return;
        for (let i = 1; i <= 5; i++) {
            const cajon = document.querySelector(`.cajon${i}`);
            if (!cajon) continue;
            const estaLibre = raw[i - 1] === "1";
            if (estaLibre) {
                if (cajon.classList.contains("ocupado")) cajon.classList.replace("ocupado", "libre");
            } else {
                if (cajon.classList.contains("libre")) cajon.classList.replace("libre", "ocupado");
            }
        }
        const libres = (raw.match(/1/g) || []).length;
        const ocupados = (raw.match(/0/g) || []).length;
        requestAnimationFrame(() => {
            const elV = document.querySelector(".numero-verde");
            const elR = document.querySelector(".numero-rojo");
            if(elV) elV.innerText = libres.toString().padStart(3, '0');
            if(elR) elR.innerText = ocupados.toString().padStart(3, '0');
        });
    });
}

/* ======================================================== */
/* 2. NAVEGACIÓN Y MENÚ                                     */
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

/* ======================================================== */
/* 3. ASISTENTE DINO (AYUDA)                                */
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
    if (!input || !input.value.trim()) return;
    chat.innerHTML += `<div class="mensaje usuario"><div class="burbuja">${input.value}</div><img src="https://i.postimg.cc/3NzGy63L/Dina.png" class="avatar"></div>`;
    input.value = "";
    chat.scrollTop = chat.scrollHeight;
}

/* ======================================================== */
/* 4. CALENDARIO Y NOTIFICACIONES (CSV)                     */
/* ======================================================== */
let partidos = {};

async function cargarPartidos() {
    try {
        const respuesta = await fetch("partidos.csv");
        const texto = await respuesta.text();
        const lineas = texto.split("\n");
        lineas.shift();

        partidos = {}; // Resetear objeto
        lineas.forEach(linea => {
            const datos = linea.split(",");
            if(datos.length < 5) return;
            const clave = datos[0].trim() + "-" + datos[1].trim(); 
            if(!partidos[clave]) partidos[clave] = [];
            partidos[clave].push({ rival:datos[3], local:datos[2], hora:datos[4] });
        });

        // IMPORTANTE: Dibujar todo DESPUÉS de cargar los datos
        marcarPartidos();
        activarClicks();
        revisarPartidosHoy();
        revisarPartidosAnteriores();
    } catch (e) { console.error("Error cargando CSV:", e); }
}

function marcarPartidos() {
    const meses = document.querySelectorAll(".mes");
    meses.forEach((mesDiv, index) => {
        const mesNumero = index + 1;
        mesDiv.querySelectorAll(".dias span").forEach(dia => {
            if(partidos[mesNumero + "-" + dia.dataset.dia]) dia.classList.add("partido");
        });
    });
}

function activarClicks() {
    const meses = document.querySelectorAll(".mes");
    meses.forEach((mesDiv, index) => {
        const mesNumero = index + 1;
        mesDiv.querySelectorAll(".dias span").forEach(dia => {
            dia.addEventListener("click", function() {
                const clave = mesNumero + "-" + this.dataset.dia;
                if(partidos[clave]) mostrarPopup(partidos[clave]);
            });
        });
    });
}

function mostrarPopup(listaPartidos) {
    const popup = document.getElementById("popup");
    const rivalArea = document.getElementById("popup-rival");
    if(!popup) return;
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
    rivalArea.innerHTML = contenido;
}

function cerrarPopup() { document.getElementById("popup").style.display = "none"; }

function revisarPartidosHoy() {
    const hoy = new Date();
    const clave = (hoy.getMonth() + 1) + "-" + hoy.getDate();
    const contenedor = document.getElementById("hoy");
