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

// Elementos para planes
const plansBtn = document.getElementById('plans-btn');
const plansModal = document.getElementById('plans-modal');
const closePlans = document.getElementById('close-plans');

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
const medRepeat = document.getElementById('med-repeat');
const medNote = document.getElementById('med-note');
const alarmSound = document.getElementById('alarm-sound');
// Registrar o editar medicamento
medForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const nombre = medName.value.trim();
  const hora = medTime.value;
  const repeat = medRepeat.value;
  const note = medNote.value.trim();
  const sound = alarmSound.value;
  if (!nombre || !hora) return;
  const medObj = { nombre, hora, repeat, note, sound };
  if (editIndex !== null) {
    medicamentos[editIndex] = medObj;
    editIndex = null;
  } else {
    medicamentos.push(medObj);
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
    let repeatText = med.repeat === 'once' ? 'Solo hoy' : (med.repeat === 'diario' ? 'Diario' : med.repeat.charAt(0).toUpperCase() + med.repeat.slice(1));
    li.innerHTML = `<span>${med.nombre}</span> <span class="med-time">${med.hora}</span>` +
      (med.note ? `<br><span style='font-size:0.95em;color:#888;'>${med.note}</span>` : '') +
      `<br><span style='font-size:0.9em;color:#6c63ff;'>${repeatText}</span>`;
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
      medRepeat.value = med.repeat || 'once';
      medNote.value = med.note || '';
      alarmSound.value = med.sound || 'alarm.mp3';
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
let alarmInterval = null;
function checkReminders() {
  const now = new Date();
  const horaActual = now.toTimeString().slice(0,5); // formato HH:MM
  const diaSemana = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'][now.getDay()];
  medicamentos.forEach((med) => {
    let debeAlertar = false;
    if (med.repeat === 'diario') {
      debeAlertar = med.hora === horaActual;
    } else if (med.repeat === 'once') {
      // Solo hoy
      const key = med.nombre + med.hora + med.repeat;
      if (med.hora === horaActual && !alertedToday[key]) {
        debeAlertar = true;
        alertedToday[key] = true;
      }
    } else if (med.repeat === diaSemana) {
      debeAlertar = med.hora === horaActual;
    }
    if (debeAlertar && !alertedToday[med.nombre + med.hora + med.repeat]) {
      showAlert(`¡Hora de tomar: <b>${med.nombre}</b>!<br>${med.note ? med.note : ''}`);
      playAlarm(med.sound || 'alarm.mp3');
      alertedToday[med.nombre + med.hora + med.repeat] = true;
      // Limpiar alertas viejas después de 2 minutos
      setTimeout(() => { alertedToday[med.nombre + med.hora + med.repeat] = false; }, 120000);
    }
  });
}

function playAlarm(soundFile) {
  alarmAudio.src = soundFile;
  alarmAudio.currentTime = 0;
  alarmAudio.play();
  // Repetir alarma cada 10 segundos hasta cerrar
  if (alarmInterval) clearInterval(alarmInterval);
  alarmInterval = setInterval(() => {
    alarmAudio.currentTime = 0;
    alarmAudio.play();
  }, 10000);
}

// Mostrar alerta visual
function showAlert(msg) {
  alertText.innerHTML = msg;
  alertModal.hidden = false;
  closeAlert.focus();
}
closeAlert.addEventListener('click', () => {
  alertModal.hidden = true;
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
  alarmAudio.pause();
  alarmAudio.currentTime = 0;
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
  
  // Configurar modal de planes después de que todo esté cargado
  setupPlansModal();
};

// Función para configurar el modal de planes
function setupPlansModal() {
  const plansBtn = document.getElementById('plans-btn');
  const plansModal = document.getElementById('plans-modal');
  const closePlans = document.getElementById('close-plans');
  const premiumBtn = document.querySelector('.premium-btn');
  
  if (plansBtn && plansModal) {
    plansBtn.addEventListener('click', () => {
      console.log('Abriendo modal de planes...');
      plansModal.style.display = 'flex';
      plansModal.hidden = false;
      if (closePlans) closePlans.focus();
    });
  }
  
  if (closePlans && plansModal) {
    closePlans.addEventListener('click', () => {
      console.log('Cerrando modal de planes...');
      plansModal.hidden = true;
      plansModal.style.display = 'none';
    });
  }
  
  if (plansModal) {
    plansModal.addEventListener('click', (e) => {
      if (e.target === plansModal) {
        plansModal.hidden = true;
        plansModal.style.display = 'none';
      }
    });
  }
  
  if (premiumBtn) {
    premiumBtn.addEventListener('click', () => {
      alert('¡Gracias por tu interés! Esta función estará disponible próximamente.\n\nContacto: vitaplus@email.com');
    });
  }
}

// Nota: Para que el sonido funcione, debe existir alarm.mp3 en la carpeta del proyecto.
// Puede usar un sonido corto de alarma libre de derechos.
