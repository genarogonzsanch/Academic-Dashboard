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
// ACORDEÓN DE HOME — "Tomar apuntes" y "Tareas pendientes"
// Guarda cuál de las dos tarjetas está abierta ("notes",
// "tasks" o null). Es un acordeón real: abrir una cierra la
// otra. Reemplaza la navegación previa a Class Space desde
// estas dos tarjetas puntuales; el resto de la app (Próxima
// clase, Carrera, selector de materias para notas) sigue
// navegando exactamente igual que antes.
// =========================================================
let dashboardExpandedCard = null;

function toggleDashboardAccordion(cardName){
  dashboardExpandedCard =
    dashboardExpandedCard === cardName ? null : cardName;

  const data = getDashboardData();
  renderNotesCard(data);
  renderPendingTasks(data);
}

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

// Variante del mismo encabezado con la flecha de acordeón al
// final (mismo lenguaje visual que .anio-chevron). Solo la
// usan las tarjetas que se abren/cierran sobre sí mismas.
function _sectionHeadingAccordion(icon, text){
  return `<h2 class="section-heading"><i data-lucide="${icon}" class="icon"></i><span class="dashboard-card-heading-text">${text}</span><i data-lucide="chevron-down" class="icon dashboard-card-accordion-toggle"></i></h2>`;
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
// FIX (Take notes no debe saltar de clase apenas empieza):
// antes, "nextClass" salía siempre de getNextClasses(), que
// solo devuelve clases cuyo horario de inicio todavía no
// llegó (dateTime > ahora). Apenas una clase arrancaba, dejaba
// de cumplir esa condición y el dashboard saltaba directo a la
// siguiente clase programada, aunque el usuario siguiera
// cursando o recién hubiera terminado la actual.
//
// Esta función busca, entre las clases de HOY, la última que
// ya empezó (esté en curso o ya haya terminado) y la devuelve
// como "clase actual" para notas. Al estar acotada a `fecha
// === hoy`, se resetea sola a la medianoche: la tarjeta de
// notas se queda pegada a la última clase atendida durante
// todo el resto del día, en vez de saltar apenas empieza la
// próxima.
// =========================================================
function getCurrentClassForNotes(){

  const now = new Date();

  const todayStr =
    typeof formatDateYMD === "function"
      ? formatDateYMD(now)
      : now.toISOString().slice(0, 10);

  const clasesYaIniciadasHoy = generateEvents()
    .filter(e => e.tipo === EVENT_TYPES.CLASE && e.fecha === todayStr)
    .map(event => ({
      ...event,
      dateTime: _buildDateTime(event.fecha, event.horaInicio)
    }))
    .filter(event => event.dateTime && event.dateTime <= now)
    .sort((a, b) => b.dateTime - a.dateTime);

  return clasesYaIniciadasHoy.length > 0
    ? clasesYaIniciadasHoy[0]
    : null;

}

// =========================================================
// FIX (Tareas pendientes debe listar TODAS las materias):
// antes, si había una "próxima clase", esta tarjeta mostraba
// únicamente las tareas de esa materia y ocultaba el resto
// hasta que no quedara ninguna clase programada. Ahora siempre
// agrega las tareas pendientes de todas las materias
// "cursando", sin importar la tarjeta de "Próxima clase"/
// "Notas", y las ordena por la fecha de la próxima clase de
// cada materia (su vencimiento implícito, ya que estas tareas
// son "para la próxima clase").
// =========================================================
function getNextClassDateForMateria(materiaId){

  const now = new Date();

  const proxima = generateEvents()
    .filter(e => e.materiaId === materiaId && e.tipo === EVENT_TYPES.CLASE)
    .map(event => _buildDateTime(event.fecha, event.horaInicio))
    .filter(dt => dt && dt > now)
    .sort((a, b) => a - b);

  return proxima.length > 0 ? proxima[0] : null;

}

function getAllPendingTasks(){

  const allSpaces = typeof getClassSpaces === "function" ? getClassSpaces() : {};
  const activeStates = typeof getStates === "function" ? getStates() : {};
  const plan = typeof getPlan === "function" ? getPlan() : null;

  let pendientes = [];

  if (plan) {
    plan.años.forEach(anio => {
      anio.materias.forEach(materia => {
        const estadoMateria = activeStates[materia.codigo] || "pendiente";

        if (estadoMateria === "cursando") {
          const space = allSpaces[materia.codigo];

          if (space && space.tasks) {
            const dueDate = getNextClassDateForMateria(materia.codigo);

            const mappedTasks = space.tasks
              .filter(t => !t.done)
              .map(t => ({
                ...t,
                materiaId: materia.codigo,
                materiaNombre: materia.nombre,
                dueDate
              }));

            pendientes.push(...mappedTasks);
          }
        }
      });
    });
  }

  pendientes.sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate - b.dueDate;
  });

  return pendientes;

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

// FIX (Take notes): se prioriza la clase que ya empezó hoy
// (la más reciente) por sobre la próxima clase que todavía no
// arrancó. Si todavía no arrancó ninguna clase hoy, se usa la
// próxima clase, igual que antes.
const currentClassForNotes = getCurrentClassForNotes();

const nextClass =
    currentClassForNotes ||
    (nextClasses.length > 0 ? nextClasses[0] : null);

// FIX (Tareas pendientes): siempre agregadas de todas las
// materias en curso, ordenadas por fecha de vencimiento.
const pendientes = getAllPendingTasks();

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
// =========================================================
// FIX (acordeón "Tomar apuntes"): la tarjeta ya no navega a
// Class Space. Al tocarla, abre/cierra su propio editor de
// notas ahí mismo (reutilizando renderClassSpaceNotes con un
// contenedor propio), sin flecha de "volver" — la tarjeta
// misma abre y cierra el contenido. El único caso que sigue
// navegando es cuando no hay ninguna clase (ni en curso ni
// próxima): ahí se mantiene el selector de materias existente,
// porque no hay una sola materia obvia para abrir en el lugar.
// =========================================================
function renderNotesCard(data) {
const card = document.getElementById("notesCard");
if (!card) return;
const nextClass = data.nextClass;

if (!nextClass) {

    if (dashboardExpandedCard === "notes") dashboardExpandedCard = null;

    card.classList.remove("dashboard-card-open");

    const action = () => {
        if (typeof openNotesSubjectPicker === "function") openNotesSubjectPicker();
    };

    _setupCardNavigation(card, action);

    card.innerHTML = `<h2><i data-lucide="notebook-pen" class="icon"></i><span>Notas</span></h2>
       <p class="empty-state">Elegí una materia activa para tomar notas de su próxima clase.</p>
       <button type="button" class="btn-cta" id="takeNotesBtn"><i data-lucide="pencil-line" class="icon"></i> Tomar notas</button>`;

    card.querySelector("#takeNotesBtn")?.addEventListener("click", e => {
        e.stopPropagation();
        action();
    });

    _refreshIcons();
    return;

}

const isOpen = dashboardExpandedCard === "notes";

card.classList.toggle("dashboard-card-open", isOpen);

_setupCardNavigation(card, () => toggleDashboardAccordion("notes"));

card.innerHTML = isOpen
    ? `${_sectionHeadingAccordion("notebook-pen", `Notas · ${escapeHtml(nextClass.materiaNombre)}`)}
       <div class="dashboard-card-content" id="homeNotesContent"></div>`
    : `${_sectionHeadingAccordion("notebook-pen", `Notas · ${escapeHtml(nextClass.materiaNombre)}`)}
       <p class="empty-state">Accedé directo a los apuntes para esta clase.</p>
       <button type="button" class="btn-cta" id="takeNotesBtn"><i data-lucide="pencil-line" class="icon"></i> Tomar apuntes</button>`;

if (isOpen) {

    const contentContainer = card.querySelector("#homeNotesContent");

    if (
        contentContainer &&
        typeof renderClassSpaceNotes === "function" &&
        typeof getClassSpace === "function"
    ) {
        // Evita que clickear dentro del editor (o su toolbar)
        // cierre el acordeón, ya que el click en la tarjeta
        // entera dispara toggleDashboardAccordion.
        contentContainer.addEventListener("click", e => e.stopPropagation());

        renderClassSpaceNotes(
            nextClass.materiaId,
            getClassSpace(nextClass.materiaId),
            contentContainer
        );
    }

} else {

    card.querySelector("#takeNotesBtn")?.addEventListener("click", e => {
        e.stopPropagation();
        toggleDashboardAccordion("notes");
    });

}

_refreshIcons();

}
// =========================================================
// FIX (acordeón "Tareas pendientes" + todas las materias):
// la tarjeta ya no navega a otra pantalla. Colapsada muestra
// una vista previa (hasta MAX_PENDING_HOME), y al tocarla se
// expande mostrando todas las tareas pendientes de todas las
// materias en curso, ya ordenadas por fecha de vencimiento
// (data.pendientes viene así desde getAllPendingTasks()).
// =========================================================
function renderPendingTasks(data) {
const card = document.getElementById("pendingTasksCard");
if (!card) return;
const pendientes = data.pendientes;

card.classList.remove("dashboard-card-clickable");

if (pendientes.length === 0) {

    if (dashboardExpandedCard === "tasks") dashboardExpandedCard = null;

    card.classList.remove("dashboard-card-open");
    card.onclick = null;
    card.onkeydown = null;

    card.innerHTML = `${_sectionHeading("list-checks", "Tareas pendientes")}<p class="empty-state empty-note">No tenés tareas pendientes en tus materias activas.</p>`;
    _refreshIcons();
    return;
}

card.classList.add("dashboard-card-clickable");

const isOpen = dashboardExpandedCard === "tasks";

card.classList.toggle("dashboard-card-open", isOpen);

_setupCardNavigation(card, () => toggleDashboardAccordion("tasks"));

const visibleTasks = isOpen
    ? pendientes
    : pendientes.slice(0, DASHBOARD_CONFIG.MAX_PENDING_HOME);

const restantes = pendientes.length - visibleTasks.length;

card.innerHTML = `
    ${_sectionHeadingAccordion("list-checks", "Tareas pendientes")}
    <div class="cs-task-list">
        ${visibleTasks.map(task => {
            const tagMateria = task.materiaNombre ? `<span class="task-materia-tag">(${escapeHtml(task.materiaNombre)})</span>` : "";
            return `
                <div class="cs-task-row" data-task-id="${task.id}" data-materia-id="${task.materiaId}">
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
        ${!isOpen && restantes > 0 ? `<p class="empty-state empty-note">+${restantes} más · tocá para ver todas</p>` : ""}
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
