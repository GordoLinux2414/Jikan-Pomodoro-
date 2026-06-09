const fs = require('fs');
const path = require('path');

// ─── REFERENCIAS AL DOM ───────────────────────────────────────────────────────
const temporizador = document.getElementById('temporizador');
const btnIniciar = document.getElementById('btn-iniciar');
const btnPausar = document.getElementById('btn-pausar');
const btnReiniciar = document.getElementById('btn-reiniciar');
const notiCustom = document.getElementById('notificacion-custom');
const notiMensaje = document.getElementById('noti-mensaje');
const inputTarea = document.getElementById('input-tarea');
const btnSetTarea = document.getElementById('btn-set-tarea');
const btnCompletado = document.getElementById('btn-completado');
const btnAbandonado = document.getElementById('btn-abandonado');
const divHistorial = document.getElementById('historial');
const pNombreTarea = document.getElementById('nombre-tarea');
const btnBorrar = document.getElementById('btn-borrarHistorial');
const btnAbrirTiempo = document.getElementById('btn-abrir-tiempo');
const contenedorTiempoFlotante = document.getElementById('contenedor-tiempo-flotante');
const inputMinutosModal = document.getElementById('input-minutos-modal');
const btnMenosModal = document.getElementById('btn-menos-modal');
const btnMasModal = document.getElementById('btn-mas-modal');
const btnConfirmarModal = document.getElementById('btn-confirmar-modal');
const sonidoDescanso = new Audio('descanso.mp3');
const sonidoEstudio = new Audio('fueraDescanso.mp3');
const btnMenosEstudio = document.getElementById('btn-menos-estudio');
const btnMasEstudio = document.getElementById('btn-mas-estudio');
const inputMinutosEstudio = document.getElementById('input-minutos-estudio');
const btnConfirmarEstudio = document.getElementById('btn-confirmar-estudio');
const btnMenosDescanso = document.getElementById('btn-menos-descanso');
const btnMasDescanso = document.getElementById('btn-mas-descanso');
const inputMinutosDescanso = document.getElementById('input-minutos-descanso');
const btnConfirmarDescanso = document.getElementById('btn-confirmar-descanso');

// ─── ESTADO ───────────────────────────────────────────────────────────────────
let minutos = 25;
let segundos = 0;
let idIntervalo = null;
let modo = "estudio";
let tareaActual = null;
let historial = [];
let totalMinutos = 0;
let duracionInicialMinutos = 25;
let duracionEstudioConfigurada = 25;
let descansoConfi = 5;

// ─── RELOJ ────────────────────────────────────────────────────────────────────
function mostrarEnPantalla() {
  temporizador.innerText =
    `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

function resetearReloj() {
  clearInterval(idIntervalo);
  document.getElementById('tomate').classList.remove('ticking');
  idIntervalo = null;
  minutos = duracionEstudioConfigurada;
  segundos = 0;
  duracionInicialMinutos = duracionEstudioConfigurada;
  modo = "estudio";
  mostrarEnPantalla();
}

function actualizarReloj() {
  if (segundos === 0) {
    if (minutos === 0) {
      if (modo === 'estudio') {
        sonidoDescanso.play();
        totalMinutos += duracionInicialMinutos;
        modo = 'descanso';
        minutos = descansoConfi;
        duracionInicialMinutos = descansoConfi;
        notificacion.lanzarNotificacion(`¡Tiempo terminado! Iniciando descanso de ${descansoConfi} minutos.`);
      } else {
        modo = 'estudio';
        minutos = duracionEstudioConfigurada;
        duracionInicialMinutos = duracionEstudioConfigurada;
        sonidoEstudio.play();
        notificacion.lanzarNotificacion(`¡Descanso terminado! Volviendo al bloque de estudio de ${duracionEstudioConfigurada} minutos.`);
      }
      segundos = 0;
      mostrarEnPantalla();
      return;
    }
    minutos--;
    segundos = 59;
  } else {
    segundos--;
  }
  mostrarEnPantalla();
}

// ─── NOTIFICACIÓN ─────────────────────────────────────────────────────────────
class Notificacion {
  lanzarNotificacion(texto) {
    notiMensaje.innerText = texto;
    notiCustom.classList.add('mostrar');
    setTimeout(() => notiCustom.classList.remove('mostrar'), 2500);
  }

  notificacionNoInvasiva(texto) {
    const noti = document.createElement('div');
    noti.className = 'noti-no-invasiva';
    noti.innerText = texto;
    document.body.appendChild(noti);

    noti.getBoundingClientRect();
    noti.classList.add('visible');

    setTimeout(() => {
      noti.classList.remove('visible');
      noti.addEventListener('transitionend', () => noti.remove(), { once: true });
    }, 2500);
  }
}

const notificacion = new Notificacion();

// ─── TAREA ────────────────────────────────────────────────────────────────────
function setTarea() {
  const valor = inputTarea.value;
  if (valor === '') return;
  tareaActual = { nombre: valor, horaInicio: new Date() };
  pNombreTarea.innerText = valor;

  if (valor.length >= 24) {
    document.getElementById('btn-ver-tarea').style.display = 'inline';
    document.getElementById('nombre-tarea').classList.add('truncado');
  } else {
    document.getElementById('btn-ver-tarea').style.display = 'none';
    document.getElementById('nombre-tarea').classList.remove('truncado');
  }
  inputTarea.value = '';
}

function limpiarTareaActual() {
  tareaActual = null;
  pNombreTarea.innerText = '';
  document.getElementById('btn-ver-tarea').style.display = 'none';
}

function agregarAlHistorial(estado) {
  if (tareaActual === null) return false;

  const minutosTrabajados = totalMinutos + (modo === 'estudio'
    ? (duracionInicialMinutos - minutos - (segundos > 0 ? 1 : 0))
    : 0);
  const segundosTrabajados = modo === 'estudio' && segundos > 0 ? 60 - segundos : 0;

  historial.push({
    nombre: tareaActual.nombre,
    estado,
    minutos: minutosTrabajados,
    segundos: segundosTrabajados
  });
  limpiarTareaActual(); // ← corregido
  return true;
}

// ─── HISTORIAL ────────────────────────────────────────────────────────────────
function itemHistorialHTML(p, index) {
  return `
    <div class="item-historial">
        <button class="btn-borrar-item" onclick="borrarItem(${index})" title="Borrar tarea">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
        <div class="item-historial-header">
            <span class="item-nombre">${p.nombre}</span>
        </div>
        <div class="item-historial-footer">
            <span class="${p.estado === 'hecha' ? 'item-estado' : 'estado-abandonada'}">${p.estado}</span>
            <span class="item-tiempo">${p.minutos} min ${p.segundos} seg</span>
        </div>
    </div>`;
}

function renderizarHistorial() {
  divHistorial.innerHTML = historial.map(itemHistorialHTML).join('');
  guardarEstado();
}

function borrarItem(index) {
  historial.splice(index, 1);
  renderizarHistorial();
}

function borrarHistorial() {
  historial = [];
  divHistorial.innerHTML = "";
  guardarEstado();
}

// ─── PERSISTENCIA ─────────────────────────────────────────────────────────────
function guardarEstado() {
  fs.writeFileSync('datos.json', JSON.stringify({ historial }));
}

function cargarEstado() {
  try {
    const estado = JSON.parse(fs.readFileSync('datos.json', 'utf-8'));
    historial = estado.historial;
  } catch { return; }
}

// ─── COMPLETAR / ABANDONAR ────────────────────────────────────────────────────
function finalizarTarea(estado, notifExito) {
  const agregado = agregarAlHistorial(estado);
  if (!agregado) {
    notificacion.lanzarNotificacion('¡No hay tarea activa!');
    return;
  }
  renderizarHistorial();
  totalMinutos = 0;
  resetearReloj();
  notificacion.lanzarNotificacion(notifExito);
}

// ─── PERMISOS ─────────────────────────────────────────────────────────────────
if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
  Notification.requestPermission().then(p => {
    if (p === 'granted') console.log('¡Permiso de notificaciones concedido!');
  });
}

// ─── MODAL FLOTANTE ───────────────────────────────────────────────────────────
function abrirAjustadorTiempo() {
  if (modo === 'descanso') {
    notificacion.lanzarNotificacion('No puedes modificar el tiempo de estudio durante el descanso.');
    return;
  }
  inputMinutosModal.value = minutos;
  contenedorTiempoFlotante.classList.add('mostrar');
}

function cerrarAjustadorTiempo() {
  contenedorTiempoFlotante.classList.remove('mostrar');
}

temporizador.style.cursor = 'pointer';
temporizador.addEventListener('click', abrirAjustadorTiempo);

btnMenosModal.addEventListener('click', () => {
  let val = parseInt(inputMinutosModal.value) || 1;
  if (val > 1) inputMinutosModal.value = val - 1;
});

btnMasModal.addEventListener('click', () => {
  let val = parseInt(inputMinutosModal.value) || 0;
  if (val < 60) inputMinutosModal.value = val + 1;
});

inputMinutosModal.addEventListener('input', () => {
  let val = parseInt(inputMinutosModal.value);
  if (val > 60) {
    inputMinutosModal.value = 60;
    notificacion.lanzarNotificacion('El tiempo máximo es de 1 hora (60 minutos)');
  }
});

inputMinutosModal.addEventListener('blur', () => {
  let val = parseInt(inputMinutosModal.value);
  if (isNaN(val) || val < 1) inputMinutosModal.value = 1;
});

btnConfirmarModal.addEventListener('click', () => {
  let val = parseInt(inputMinutosModal.value);
  if (isNaN(val) || val < 1) val = 1;
  if (val > 60) val = 60;

  if (idIntervalo !== null) {
    document.getElementById('tomate').classList.remove('ticking');
    clearInterval(idIntervalo);
    idIntervalo = null;
  }

  minutos = val;
  duracionInicialMinutos = val;
  duracionEstudioConfigurada = val;
  modo = 'estudio';
  segundos = 0;
  mostrarEnPantalla();
  cerrarAjustadorTiempo();
  notificacion.lanzarNotificacion(`Tiempo ajustado a ${minutos} minutos.`);
});

contenedorTiempoFlotante.addEventListener('click', (e) => {
  if (e.target === contenedorTiempoFlotante) cerrarAjustadorTiempo();
});

// ─── VALIDACIÓN INPUTS AJUSTES ────────────────────────────────────────────────
inputMinutosEstudio.addEventListener('input', () => {
  let val = parseInt(inputMinutosEstudio.value);
  if (val > 60) {
    inputMinutosEstudio.value = 60;
    notificacion.notificacionNoInvasiva('El tiempo máximo es 60 minutos.');
  }
});

inputMinutosEstudio.addEventListener('blur', () => {
  let val = parseInt(inputMinutosEstudio.value);
  if (isNaN(val) || val < 1) inputMinutosEstudio.value = 1;
});

inputMinutosDescanso.addEventListener('input', () => {
  let val = parseInt(inputMinutosDescanso.value);
  if (val > 30) {
    inputMinutosDescanso.value = 30;
    notificacion.notificacionNoInvasiva('El tiempo máximo es de 30 minutos.');
  }
});

inputMinutosDescanso.addEventListener('blur', () => {
  let val = parseInt(inputMinutosDescanso.value);
  if (isNaN(val) || val < 1) inputMinutosDescanso.value = 1;
});

// ─── AJUSTES: ESTUDIO ────────────────────────────────────────────────────────
btnMenosEstudio.addEventListener('click', () => {
  let val = parseInt(inputMinutosEstudio.value) || 1;
  if (val > 1) inputMinutosEstudio.value = val - 1;
});

btnMasEstudio.addEventListener('click', () => {
  let val = parseInt(inputMinutosEstudio.value) || 0;
  if (val < 60) inputMinutosEstudio.value = val + 1;
});

btnConfirmarEstudio.addEventListener('click', () => {
  let val = parseInt(inputMinutosEstudio.value);
  if (isNaN(val) || val < 1) val = 1;
  if (val > 60) val = 60;

  duracionEstudioConfigurada = val;

  if (modo === 'estudio' && idIntervalo === null) {
    minutos = val;
    segundos = 0;
    duracionInicialMinutos = val;
    mostrarEnPantalla();
  }

  notificacion.notificacionNoInvasiva(`Estudio configurado a ${val} minutos.`);
});

// ─── AJUSTES: DESCANSO ───────────────────────────────────────────────────────
btnMenosDescanso.addEventListener('click', () => {
  let val = parseInt(inputMinutosDescanso.value) || 1;
  if (val > 1) inputMinutosDescanso.value = val - 1;
});

btnMasDescanso.addEventListener('click', () => {
  let val = parseInt(inputMinutosDescanso.value) || 0;
  if (val < 30) inputMinutosDescanso.value = val + 1;
});

btnConfirmarDescanso.addEventListener('click', () => {
  let val = parseInt(inputMinutosDescanso.value);
  if (isNaN(val) || val < 1) val = 1;
  if (val > 30) val = 30;

  descansoConfi = val;

  if (modo === 'descanso' && idIntervalo === null) {
    minutos = val;
    segundos = 0;
    duracionInicialMinutos = val;
    mostrarEnPantalla();
  }

  notificacion.notificacionNoInvasiva(`Descanso configurado a ${val} minutos.`);
});

// ─── LISTENERS ────────────────────────────────────────────────────────────────
btnIniciar.addEventListener('click', () => {
  if (tareaActual === null && inputTarea.value !== '') {
    notificacion.lanzarNotificacion('¡Dale a Asignar primero!');
    return;
  }
  if (tareaActual === null) {
    notificacion.lanzarNotificacion('¡Escribe una tarea antes de iniciar!');
    return;
  }
  if (idIntervalo !== null) return;
  idIntervalo = setInterval(actualizarReloj, 1000);
  document.getElementById('tomate').classList.add('ticking');
});

btnPausar.addEventListener('click', () => {
  if (idIntervalo === null) return;
  document.getElementById('tomate').classList.remove('ticking');
  clearInterval(idIntervalo);
  idIntervalo = null;
});

btnReiniciar.addEventListener('click', resetearReloj);

btnSetTarea.addEventListener('click', setTarea);

document.getElementById('btn-ver-tarea').addEventListener('click', () => {
  document.getElementById('nombre-tarea').classList.toggle('truncado');
});

btnCompletado.addEventListener('click', () => {
  if (!tareaActual) {
    notificacion.lanzarNotificacion('¡No hay tarea activa!');
    return;
  }

  if (modo === 'estudio') {
    const tiempoInicialSegundos = duracionInicialMinutos * 60;
    const tiempoActualSegundos = (minutos * 60) + segundos;
    const tiempoTranscurrido = tiempoInicialSegundos - tiempoActualSegundos;

    if (tiempoTranscurrido < 60 && totalMinutos === 0) {
      notificacion.lanzarNotificacion('¡Estudia al menos 1 minuto antes de completar!');
      return;
    }
  }

  finalizarTarea('hecha', '¡Felicidades, tarea completada!');
});

btnAbandonado.addEventListener('click', () => {
  finalizarTarea('abandonada', '¡Nunca te rindas, vuelve a intentarlo!');
});

btnBorrar.addEventListener('click', () => {
  if (historial.length === 0) {
    notificacion.lanzarNotificacion("¡No hay historial que borrar!");
    return;
  }
  borrarHistorial();
});

// ─── INICIO ───────────────────────────────────────────────────────────────────
cargarEstado();
renderizarHistorial();