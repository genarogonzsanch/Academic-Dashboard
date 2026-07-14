// =========================================================
// CONFIGURACIÓN Y CONSTANTES DEL DASHBOARD
// =========================================================
const DASHBOARD_CONFIG = {
MAX_PENDING_HOME: 4,
CLASS_WINDOW_PRE_HOURS: 2,
CLASS_WINDOW_POST_HOURS: -3,
EXAM_WINDOW_HOURS: 24,
DEFAULT_EVENT_HOUR: "00:00",
MS_TO_HOURS: 1000 * 60 * 60
};
// =========================================================
// ENCABEZADO DE SECCIÓN — componente único
// Usado por "Próximos eventos", "Próxima clase" y "Tareas
// pendientes" para que las tres tarjetas del Home compartan
// exactamente el mismo ícono, tamaño, tipografía, peso y
// espaciado. Solo cambia el texto e ícono recibidos.
// =========================================================
function _sectionHeading(icon, text){
  return `<h2 class="section-heading"><i data-lucide="${icon}" class="icon"></i><span>${text}</span></h2>`;
}

function _refreshIcons(){
  if(typeof lucide !== "undefined"){
    lucide.createIcons();
  }
}

// =========================================================
// HELPERS COMPARTIDOS / UTILS INTERNOS
// =========================================================
function _buildDateTime(fecha, hora) {
  if (!fecha) return null;

  return new Date(
    `${fecha}T${hora || DASHBOARD_CONFIG.DEFAULT_EVENT_HOUR}`
  );
}
function _getHoursDifference(futureDate, baseDate = new Date()) {
if (!futureDate) return null;
return (futureDate - baseDate) / DASHBOARD_CONFIG.MS_TO_HOURS;
}
function _setupCardNavigation(card, action) {
card.onclick = action;
card.onkeydown = e => {
if (e.key === "Enter" || e.key === " ") {
e.preventDefault();
action();
}
};
}
function _openNextClassSpace(nextClass) {
if (typeof openClassSpace === "function") openClassSpace(nextClass.materiaId, "home");
}
// =========================================================
// HOME / DASHBOARD ENGINE
// =========================================================
function getDashboardData() {
const nextClasses = getNextClasses(1);
const upcomingEvents = getUpcomingEvents(1);
const tieneHorarios =
    typeof getSchedules === "function" &&
    getSchedules().length > 0;

let nextClass = null;
let pendientes = [];

if (nextClasses.length > 0) {
    nextClass = nextClasses[0];
    
    const space =
        typeof getClassSpace === "function"
            ? getClassSpace(nextClass.materiaId)
            : null;

    pendientes = space
        ? (space.tasks || []).filter(t => !t.done).slice(0, DASHBOARD_CONFIG.MAX_PENDING_HOME)
        : [];
} else {
    const allSpaces = typeof getClassSpaces === "function" ? getClassSpaces() : {};
    const activeStates = typeof getStates === "function" ? getStates() : {};
    const plan = typeof getPlan === "function" ? getPlan() : null;

    if (plan) {
        plan.años.forEach(anio => {
            anio.materias.forEach(materia => {
                const estadoMateria = activeStates[materia.codigo] || "pendiente";
                
                if (estadoMateria === "cursando") {
                    const space = allSpaces[materia.codigo];
                    if (space && space.tasks) {
                        const mappedTasks = space.tasks
                            .filter(t => !t.done)
                            .map(t => ({
                                ...t,
                                materiaId: materia.codigo,
                                materiaNombre: materia.nombre
                            }));
                        pendientes.push(...mappedTasks);
                    }
                }
            });
        });
        
        pendientes = pendientes.slice(0, DASHBOARD_CONFIG.MAX_PENDING_HOME);
    }
}

return {
    nextClasses,
    upcomingEvents,
    tieneHorarios,
    nextClass,
    pendientes
};
}
function resolveDashboardContext(data) {
const now = new Date();
// 1. VENTANA DE CLASE INMINENTE O EN CURSO
if (data.nextClasses && data.nextClasses.length > 0) {
    const currentClass = data.nextClasses[0];
    const classStart = _buildDateTime(currentClass.fecha, currentClass.horaInicio);
    if (classStart) {
        const diffHours = _getHoursDifference(classStart, now);
        if ((diffHours >= 0 && diffHours <= DASHBOARD_CONFIG.CLASS_WINDOW_PRE_HOURS) || 
            (diffHours < 0 && diffHours >= DASHBOARD_CONFIG.CLASS_WINDOW_POST_HOURS)) {
            return "class";
        }
    }
}

// 2. VENTANA DE EXAMEN CRÍTICO
if (data.upcomingEvents && data.upcomingEvents.length > 0) {
    const nextEvent = data.upcomingEvents[0];
    const esExamen = nextEvent.tipo === "parcial" || nextEvent.tipo === "final";

    if (esExamen) {
        const eventStart = _buildDateTime(nextEvent.fecha, nextEvent.horaInicio);
        if (eventStart) {
            const diffHours = _getHoursDifference(eventStart, now);
            if (diffHours >= 0 && diffHours <= DASHBOARD_CONFIG.EXAM_WINDOW_HOURS) {
                return "exam";
            }
        }
    }
}

return "default";
}
function renderDashboard(plan, states) {
const dashboard = document.getElementById("dashboard");
if (!dashboard) return;
const profile = typeof getProfile === "function" ? getProfile() : null;
const saludo = profile && profile.name ? `Hola, ${profile.name.split(" ")[0]} 👋` : "Hola 👋";

const data = getDashboardData();
const context = resolveDashboardContext(data);

// Mantenemos la estructura fija intacta. Los estilos inline desaparecen por completo.
dashboard.innerHTML = `
<div class="dashboard-v2">
    <div class="dashboard-hero">
        <div class="hero-eyebrow">
            ${saludo}
        </div>
        <h1>¿Qué necesitás hoy?</h1>
    </div>
    <div id="dashboardGrid" class="dashboard-grid-container context-${context}">
        <div id="nextEventCard" class="dashboard-card dashboard-card-primary dashboard-card-clickable" role="button" tabindex="0"></div>
        <div id="nextClassCard" class="dashboard-card dashboard-card-clickable" role="button" tabindex="0"></div>
        <div id="notesCard" class="dashboard-card dashboard-card-clickable" role="button" tabindex="0"></div>
        <div id="pendingTasksCard" class="dashboard-card"></div>
    </div>
</div>
`;

renderDashboardCards(data);
}
function renderDashboardCards(data) {
renderNextEvent(data);
renderNextClass(data);
renderNotesCard(data);
renderPendingTasks(data);
}
function formatDay(fecha) {
const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const [year, month, day] = fecha.split("-").map(Number);
const localDate = new Date(year, month - 1, day);
return dias[localDate.getDay()];
}
function getNextClasses(count = 3) {
const now = new Date();
const clases = generateEvents()
.filter(e => e.tipo === EVENT_TYPES.CLASE)
.map(event => ({
...event,
dateTime: _buildDateTime(event.fecha, event.horaInicio)
}))
.filter(event => event.dateTime > now)
.sort((a,b) => a.dateTime - b.dateTime);
return clases.slice(0, count);
}
function getUpcomingEvents(count = 3) {
const now = new Date();
return generateEvents()
.filter(e => e.tipo !== EVENT_TYPES.CLASE)
.map(event => ({
...event,
dateTime: _buildDateTime(event.fecha, event.horaInicio)
}))
.filter(event => event.dateTime > now)
.sort((a,b) => a.dateTime - b.dateTime)
.slice(0, count);
}
// =========================================================
// RENDERS PARTICULARES (Llenado de contenido e interacciones)
// =========================================================
function renderNextEvent(data) {
const card = document.getElementById("nextEventCard");
if (!card) return;
const events = data.upcomingEvents;
if (!events.length) {
    card.style.display = "none"; // Contracción dinámica nativa (Mantiene lógica del Commit 5)
    return;
}
card.style.display = ""; 

_setupCardNavigation(card, () => {
    if (typeof showScreen === "function") showScreen("calendar");
});

const event = events[0];

card.innerHTML = `
    ${_sectionHeading("calendar-clock", "Próximos eventos")}
    <div class="event-list">
        <div class="event-row">
            <span class="event-dot badge-${event.tipo}"></span>
            <div class="event-row-main">
                <div class="event-subject">
                    ${escapeHtml(event.materiaNombre)}
                </div>
                <div class="event-meta">
                    <span class="event-type">
                        ${eventTypeLabel(event.tipo)}
                    </span>
                    ·
                    ${formatDay(event.fecha)}
                    ${event.fecha}
                </div>
            </div>
            <div class="event-hour">
                ${event.horaInicio || ""}
            </div>
        </div>
    </div>
`;

_refreshIcons();

}
function renderNextClass(data) {
const card = document.getElementById("nextClassCard");
if (!card) return;
const nextClasses = data.nextClasses;
const tieneHorarios = data.tieneHorarios;

const goToSubjects = () => {
    if (typeof showScreen === "function") showScreen("subjects");
};

if (!nextClasses.length) {
    _setupCardNavigation(card, goToSubjects);
    card.innerHTML = tieneHorarios
        ? `${_sectionHeading("book-open", "Próxima clase")}<p class="empty-state empty-note">No hay clases programadas</p>`
        : `${_sectionHeading("book-open", "Próxima clase")}
           <p class="empty-state empty-note">Todavía no configuraste tus horarios de cursada.</p>
           <button type="button" class="btn-cta" id="setupClassesBtn"><i data-lucide="calendar-plus" class="icon"></i> Configurar horarios</button>`;

    card.querySelector("#setupClassesBtn")?.addEventListener("click", e => {
        e.stopPropagation();
        goToSubjects();
    });
    _refreshIcons();
    return;
}

const nextClass = nextClasses[0];
_setupCardNavigation(card, () => {
    _openNextClassSpace(nextClass);
});

card.innerHTML = `
    ${_sectionHeading("book-open", "Próxima clase")}
    <div class="next-class">
        <div class="next-class-main">
            <div class="next-class-subject">
                ${escapeHtml(nextClass.materiaNombre)}
            </div>
            <div class="next-class-meta">
                ${formatDay(nextClass.fecha)}
                ·
                ${nextClass.fecha}
            </div>
        </div>
        <div class="next-class-time">
            ${nextClass.horaInicio} - ${nextClass.horaFin}
        </div>
    </div>
`;

_refreshIcons();

}
function renderNotesCard(data) {
const card = document.getElementById("notesCard");
if (!card) return;
const nextClass = data.nextClass;
const action = () => {
    if (nextClass) {
        _openNextClassSpace(nextClass);
    } else {
        if (typeof openNotesSubjectPicker === "function") openNotesSubjectPicker();
    }
};

_setupCardNavigation(card, action);

card.innerHTML = nextClass
    ? `<h2><i data-lucide="notebook-pen" class="icon"></i><span>Notas · ${escapeHtml(nextClass.materiaNombre)}</span></h2>
       <p class="empty-state">Accedé directo a los apuntes para esta clase.</p>
       <button type="button" class="btn-cta" id="takeNotesBtn"><i data-lucide="pencil-line" class="icon"></i> Tomar apuntes</button>`
    : `<h2><i data-lucide="notebook-pen" class="icon"></i><span>Notas</span></h2>
       <p class="empty-state">Elegí una materia activa para tomar notas de su próxima clase.</p>
       <button type="button" class="btn-cta" id="takeNotesBtn"><i data-lucide="pencil-line" class="icon"></i> Tomar notas</button>`;

card.querySelector("#takeNotesBtn")?.addEventListener("click", e => {
    e.stopPropagation();
    action();
});

_refreshIcons();

}
function renderPendingTasks(data) {
const card = document.getElementById("pendingTasksCard");
if (!card) return;
const nextClass = data.nextClass;
const pendientes = data.pendientes;
const tituloTarjeta = nextClass ? `Tareas pendientes · ${escapeHtml(nextClass.materiaNombre)}` : "Tareas pendientes";
const heading = _sectionHeading("list-checks", tituloTarjeta);

// Manejo correcto de modificadores de clase css en el elemento fijo
card.classList.remove("dashboard-card-clickable");

if (!nextClass && pendientes.length === 0) {
    card.innerHTML = `${heading}<p class="empty-state empty-note">No tenés tareas pendientes en tus materias activas.</p>`;
    _refreshIcons();
    return;
}

card.classList.add("dashboard-card-clickable");

if (nextClass && pendientes.length === 0) {
    _setupCardNavigation(card, () => {
        _openNextClassSpace(nextClass);
    });
    card.innerHTML = `${heading}<p class="empty-state empty-note">No tenés tareas pendientes para tu próxima clase.</p>`;
    _refreshIcons();
    return;
}

_setupCardNavigation(card, () => {
    if (nextClass) {
        _openNextClassSpace(nextClass);
    } else {
        if (typeof showScreen === "function") showScreen("subjects");
    }
});

card.innerHTML = `
    ${heading}
    <div class="cs-task-list">
        ${pendientes.map(task => {
            const tagMateria = !nextClass && task.materiaNombre ? `<span class="task-materia-tag">(${escapeHtml(task.materiaNombre)})</span>` : "";
            return `
                <div class="cs-task-row" data-task-id="${task.id}" data-materia-id="${task.materiaId || (nextClass ? nextClass.materiaId : '')}">
                    <label class="cs-task-checkbox">
                        <input type="checkbox">
                        <span class="cs-task-text">
                            ${escapeHtml(task.text)}
                            ${tagMateria}
                        </span>
                    </label>
                </div>
            `;
        }).join("")}
    </div>
`;

card.querySelectorAll(".cs-task-row").forEach(row => {
    const checkbox = row.querySelector("input[type=checkbox]");

    checkbox.addEventListener("click", e => e.stopPropagation());
    checkbox.addEventListener("change", () => {
        const targetMateriaId = row.dataset.materiaId;
        if (targetMateriaId && typeof toggleClassTask === "function") {
            toggleClassTask(targetMateriaId, row.dataset.taskId);

            // FIX ATÓMICO: Obtenemos los nuevos datos y re-renderizamos SOLO los pendientes
            const updatedData = getDashboardData();
            renderPendingTasks(updatedData);
        }
    });
});

_refreshIcons();

}