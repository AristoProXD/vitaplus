// Vita+ - Lógica de recordatorio y accesibilidad
// Autor: Copilot
// Instrucciones y comentarios incluidos para facilitar mantenimiento

// Elementos principales
const splash = document.getElementById('splash');
const startBtn = document.getElementById('start-btn');
const mainApp = document.getElementById('main-app');
const medForm = document.getElementById('med-form');
const medName = document.getElementById('med-name');
const medTime = document.getElementById('med-time');
const medList = document.getElementById('med-list');
const toggleDark = document.getElementById('toggle-dark');
const alertModal = document.getElementById('alert-modal');
const alertText = document.getElementById('alert-text');
const closeAlert = document.getElementById('close-alert');
const alarmAudio = document.getElementById('alarm-audio');
const quickTimeBtn = document.getElementById('quick-time-btn');
const quickTimePanel = document.getElementById('quick-time-panel');

// Splash: mostrar presentación y luego app
startBtn.addEventListener('click', () => {
  splash.classList.add('splash-hidden');
  setTimeout(() => {
    splash.style.display = 'none';
    mainApp.hidden = false;
    medName.focus();
  }, 400);
});

// Cargar medicamentos guardados al iniciar
let medicamentos = JSON.parse(localStorage.getItem('medicamentos') || '[]');
renderMedList();


let editIndex = null;
// Registrar o editar medicamento
medForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const nombre = medName.value.trim();
  const hora = medTime.value;
  if (!nombre || !hora) return;
  if (editIndex !== null) {
    medicamentos[editIndex] = { nombre, hora };
    editIndex = null;
  } else {
    medicamentos.push({ nombre, hora });
  }
  localStorage.setItem('medicamentos', JSON.stringify(medicamentos));
  renderMedList();
  medForm.reset();
  medName.focus();
  medForm.querySelector('#add-btn').textContent = 'Agregar';
});

// Renderizar lista de medicamentos
function renderMedList() {
  medList.innerHTML = '';
  if (medicamentos.length === 0) {
    medList.innerHTML = '<li>No hay medicamentos registrados.</li>';
    return;
  }
  medicamentos.forEach((med, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${med.nombre}</span> <span class="med-time">${med.hora}</span>`;
    // Acciones editar/eliminar con iconos
    const actions = document.createElement('span');
    actions.className = 'med-actions';
    const editBtn = document.createElement('button');
    editBtn.className = 'med-edit';
    editBtn.title = 'Editar';
    editBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 14.25V17h2.75l8.13-8.13-2.75-2.75L3 14.25zM17.71 6.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#6c63ff"/></svg>';
    editBtn.onclick = () => {
      medName.value = med.nombre;
      medTime.value = med.hora;
      editIndex = idx;
      medForm.querySelector('#add-btn').textContent = 'Guardar';
      medName.focus();
    };
    const delBtn = document.createElement('button');
    delBtn.className = 'med-delete';
    delBtn.title = 'Eliminar';
    delBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="9" stroke="#e57373" stroke-width="2"/><line x1="7" y1="7" x2="13" y2="13" stroke="#e57373" stroke-width="2"/><line x1="13" y1="7" x2="7" y2="13" stroke="#e57373" stroke-width="2"/></svg>';
    delBtn.onclick = () => {
      medicamentos.splice(idx, 1);
      localStorage.setItem('medicamentos', JSON.stringify(medicamentos));
      renderMedList();
      medForm.reset();
      editIndex = null;
      medForm.querySelector('#add-btn').textContent = 'Agregar';
    };
    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
    li.appendChild(actions);
    medList.appendChild(li);
  });
}
// Limpiar lista de medicamentos
const clearListBtn = document.getElementById('clear-list-btn');
clearListBtn.addEventListener('click', () => {
  if (confirm('¿Seguro que desea borrar todos los medicamentos?')) {
    medicamentos = [];
    localStorage.setItem('medicamentos', '[]');
    renderMedList();
    medForm.reset();
    editIndex = null;
    medForm.querySelector('#add-btn').textContent = 'Agregar';
  }
});

// Recordatorio: comprobar cada minuto si hay que alertar
setInterval(checkReminders, 1000 * 10); // cada 10 segundos para demo, cambiar a 60*1000 para producción
let alertedToday = {};
function checkReminders() {
  const now = new Date();
  const horaActual = now.toTimeString().slice(0,5); // formato HH:MM
  medicamentos.forEach((med) => {
    if (med.hora === horaActual && !alertedToday[med.nombre + med.hora]) {
      showAlert(`¡Hora de tomar: <b>${med.nombre}</b>!`);
      alarmAudio.currentTime = 0;
      alarmAudio.play();
      alertedToday[med.nombre + med.hora] = true;
      // Limpiar alertas viejas después de 2 minutos
      setTimeout(() => { alertedToday[med.nombre + med.hora] = false; }, 120000);
    }
  });
}

// Mostrar alerta visual
function showAlert(msg) {
  alertText.innerHTML = msg;
  alertModal.hidden = false;
  closeAlert.focus();
}
closeAlert.addEventListener('click', () => {
  alertModal.hidden = true;
});

// Modo oscuro
const darkMode = localStorage.getItem('darkMode') === 'true';
if (darkMode) {
  document.body.classList.add('dark');
  toggleDark.setAttribute('aria-pressed', 'true');
}
toggleDark.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('darkMode', isDark);
  toggleDark.setAttribute('aria-pressed', isDark);
});

// Accesibilidad: enfocar primer input al cargar
window.onload = () => {
  medName.focus();
};

// Panel de selección rápida de hora (mejorado)
quickTimeBtn.addEventListener('click', (e) => {
  e.preventDefault();
  quickTimePanel.hidden = !quickTimePanel.hidden;
});
document.querySelectorAll('.quick-time-option').forEach(btn => {
  btn.addEventListener('click', () => {
    medTime.value = btn.textContent;
    quickTimePanel.hidden = true;
    medTime.focus();
  });
});
// Cerrar panel si se hace clic fuera
document.addEventListener('mousedown', (e) => {
  if (!quickTimePanel.contains(e.target) && e.target !== quickTimeBtn) {
    quickTimePanel.hidden = true;
  }
});

// Nota: Para que el sonido funcione, debe existir alarm.mp3 en la carpeta del proyecto.
// Puede usar un sonido corto de alarma libre de derechos.
