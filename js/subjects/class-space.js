// =========================================================
// CLASS SPACE
// Un Class Space = una materia (no un horario individual).
// Enfocado solo en dos cosas: Notas (por sesión de clase) y
// Tareas para la próxima clase.
//
// Reutiliza getMateriaById()/generateEvents() (calendario.js),
// generateId() (eventos.js), showToast() (app.js) y el storage
// de class-space en storage.js. No duplica lógica existente.
// =========================================================

let currentClassSpaceMateriaId = null;

function escapeHtml(str){

 return String(str || "")
  .replace(/&/g, "&amp;")
  .replace(/"/g, "&quot;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;");

}

// =========================================================
// FIX (Dashboard no reactivo): agregar/tildar/editar/borrar
// una tarea desde acá (Class Space) solo volvía a renderizar
// classSpaceTasks. La tarjeta "Pendientes" del Dashboard
// (pendingTasksCard) quedaba desactualizada hasta salir y
// volver a entrar a Home, porque nada la refrescaba.
//
// dashboard.js ya se encarga de re-renderizarse a sí mismo
// cuando el toggle se hace desde el propio Dashboard; esto
// cubre el caso que faltaba: cuando la mutación viene desde
// el Class Space. Se llama solo si la tarjeta existe en el
// DOM (el Dashboard ya se renderizó al menos una vez) y no
// duplica lógica: reutiliza getDashboardData()/renderPendingTasks()
// tal cual están definidas en dashboard.js.
// =========================================================
function refreshDashboardPendingTasks(){

 if(
  typeof getDashboardData === "function" &&
  typeof renderPendingTasks === "function" &&
  document.getElementById("pendingTasksCard")
 ){

  renderPendingTasks(getDashboardData());

 }

}

// =========================================================
// NAVEGACIÓN
// =========================================================

// Un mismo Class Space puede abrirse desde Home, Calendario o
// Carrera. Se guarda de dónde se vino (returnScreen) para que
// "Volver" lleve de nuevo ahí en vez de siempre a Carrera.
let classSpaceReturnScreen = "subjects";

function openClassSpace(materiaId, returnScreen){

 currentClassSpaceMateriaId = materiaId;

 classSpaceReturnScreen =
  returnScreen ||
  localStorage.getItem("activeScreen") ||
  "subjects";

 renderClassSpace(materiaId);

 // showScreen() ya se encarga de esconder home/calendar/subjects
 // y de esconder classSpaceScreen al arrancar; acá lo mostramos
 // encima una vez que showScreen terminó de acomodar todo.
 if(typeof showScreen === "function"){
  showScreen(classSpaceReturnScreen);
 }

 const classSpaceScreen =
  document.getElementById("classSpaceScreen");

 if(classSpaceScreen){
  classSpaceScreen.style.display = "block";
 }

}

function closeClassSpace(){

 currentClassSpaceMateriaId = null;

 if(typeof showScreen === "function"){
  showScreen(classSpaceReturnScreen);
 }

}

document
 .getElementById("classSpaceBackBtn")
 ?.addEventListener("click", closeClassSpace);

// =========================================================
// SELECTOR DE MATERIAS ACTIVAS ("Tomar notas" desde Home)
// No es un Class Space nuevo ni un dato nuevo: es una lista
// de materias con estado "cursando" que, al tocar una, abre
// el mismo Class Space de siempre (openClassSpace). Reemplaza
// el acceso directo "Ver clase" desde Home por este paso de
// selección explícita.
// =========================================================

function openNotesSubjectPicker(){

 renderNotesSubjectsList();

 if(typeof showScreen === "function"){
  showScreen("home");
 }

 const screen =
  document.getElementById("notesSubjectsScreen");

 if(screen){
  screen.style.display = "block";
 }

}

function closeNotesSubjectPicker(){

 if(typeof showScreen === "function"){
  showScreen("home");
 }

}

document
 .getElementById("notesSubjectsBackBtn")
 ?.addEventListener("click", closeNotesSubjectPicker);

function renderNotesSubjectsList(){

 const container =
  document.getElementById("notesSubjectsList");

 if(!container) return;

 const plan =
  typeof getPlan === "function" ? getPlan() : null;

 const states =
  typeof getStates === "function" ? getStates() : {};

 const activas = [];

 if(plan){

  plan.años.forEach(anio => {

   anio.materias.forEach(materia => {

    const estado =
     states[materia.codigo] || "pendiente";

    if(estado === "cursando"){
     activas.push(materia);
    }

   });

  });

 }

 if(activas.length === 0){

  container.innerHTML = `
   <p class="cs-empty">
    No tenés materias en curso ahora mismo.
   </p>
  `;

  return;

 }

 container.innerHTML = activas
  .map(materia => `

   <button
    type="button"
    class="notes-subject-row"
    data-id="${materia.codigo}"
   >
    <span class="notes-subject-name">
     ${escapeHtml(materia.nombre)}
    </span>
    <span class="notes-subject-arrow"><i data-lucide="chevron-right" class="icon"></i></span>
   </button>

  `)
  .join("");

 container
  .querySelectorAll(".notes-subject-row")
  .forEach(btn => {

   btn.addEventListener("click", () => {
    openClassSpace(btn.dataset.id, "home");
   });

  });

 _refreshIcons();

}

// =========================================================
// RENDER PRINCIPAL
// =========================================================

function renderClassSpace(materiaId){

 const materia = getMateriaById(materiaId);
 const space = getClassSpace(materiaId);

 const titleEl =
  document.getElementById("classSpaceTitle");

 if(titleEl){
  titleEl.textContent =
   materia ? materia.nombre : "Materia";
 }

 renderClassSpaceNotes(materiaId, space);
 renderClassSpaceTasks(materiaId, space);

}

// =========================================================
// NOTAS — siempre las de la PRÓXIMA sesión de clase de esta
// materia (la próxima ocurrencia generada a partir de un
// horario recurrente). No hay selector de fecha ni historial:
// cada clase programada abre con su propio editor, vacío
// salvo que ya se haya escrito algo para esa sesión puntual.
// Se identifica con el mismo id que usa generateEvents():
// `${schedule.id}_${fecha}`.
// =========================================================

function getClassSessions(materiaId){

 return generateEvents()
  .filter(e =>
   e.materiaId === materiaId &&
   e.tipo === EVENT_TYPES.CLASE
  )
  .sort((a, b) => {

   if(a.fecha === b.fecha){
    return (a.horaInicio || "").localeCompare(b.horaInicio || "");
   }

   return a.fecha.localeCompare(b.fecha);

  });

}

function getNextSession(sessions){

 if(!sessions.length) return null;

 const todayStr =
  typeof formatDateYMD === "function"
   ? formatDateYMD(new Date())
   : new Date().toISOString().slice(0, 10);

 const upcoming =
  sessions.find(s => s.fecha >= todayStr);

 return upcoming || sessions[sessions.length - 1];

}

// FIX (acordeón "Tomar apuntes" en Home): se agrega un tercer
// parámetro opcional `container`. Por defecto sigue apuntando
// a #classSpaceNotes (pantalla completa de Class Space, sin
// cambios de comportamiento ahí). Cuando dashboard.js la llama
// desde la tarjeta de Home, pasa su propio contenedor interno
// para reutilizar exactamente la misma lógica de edición y
// guardado de notas, sin duplicarla.
function renderClassSpaceNotes(materiaId, space, container){

 container =
  container ||
  document.getElementById("classSpaceNotes");

 if(!container) return;

 const sessions = getClassSessions(materiaId);
 const session = getNextSession(sessions);

 if(!session){

  container.innerHTML = `

   <h3 class="cs-section-title"><i data-lucide="notebook-pen" class="icon"></i>Notas</h3>

   <p class="cs-empty">
    Todavía no hay clases programadas para esta materia.
    Configurá un horario para poder llevar notas por clase.
   </p>

  `;

  _refreshIcons();

  return;

 }

 const todayStr =
  typeof formatDateYMD === "function"
   ? formatDateYMD(new Date())
   : "";

 const etiqueta =
  session.fecha === todayStr
   ? "hoy"
   : formatFechaLarga(session.fecha);

 container.innerHTML = `

  <h3 class="cs-section-title">
   <i data-lucide="notebook-pen" class="icon"></i>
   Notas · próxima clase (${etiqueta})
  </h3>

  <div class="cs-notes-toolbar">

   <button type="button" class="cs-notes-btn" data-cmd="bold" aria-label="Negrita">
    <i data-lucide="bold" class="icon"></i>
   </button>

   <button type="button" class="cs-notes-btn" data-cmd="italic" aria-label="Cursiva">
    <i data-lucide="italic" class="icon"></i>
   </button>

   <button type="button" class="cs-notes-btn" data-cmd="insertUnorderedList" aria-label="Lista">
    <i data-lucide="list" class="icon"></i>
   </button>

  </div>

  <div
   id="csNotesEditor"
   class="cs-notes-editor"
   contenteditable="true"
  ></div>

 `;

 const editor = container.querySelector("#csNotesEditor");

 editor.innerHTML =
  (space.notesBySession &&
   space.notesBySession[session.id]) ||
  "";

 container
  .querySelectorAll(".cs-notes-btn")
  .forEach(btn => {

   btn.addEventListener("click", () => {

    editor.focus();
    document.execCommand(btn.dataset.cmd, false, null);

   });

  });

 function persistNotes(){

  const currentSpace = getClassSpace(materiaId);

  const notesBySession = {
   ...(currentSpace.notesBySession || {}),
   [session.id]: editor.innerHTML
  };

  saveClassSpace(materiaId, { notesBySession });

 }

 let notesSaveTimeout = null;

 editor.addEventListener("input", () => {

  clearTimeout(notesSaveTimeout);

  notesSaveTimeout = setTimeout(persistNotes, 500);

 });

 editor.addEventListener("blur", () => {

  clearTimeout(notesSaveTimeout);
  persistNotes();

 });

 _refreshIcons();

}

// =========================================================
// TAREAS — checklist de próxima clase. Vive a nivel materia
// (no por sesión): una tarea creada acá sigue apareciendo
// hasta que se completa o se borra, así que naturalmente
// "viaja" a la próxima clase programada mientras siga pendiente.
// =========================================================

function addClassTask(materiaId, text){

 const space = getClassSpace(materiaId);
 const tasks = space.tasks || [];

 tasks.push({
  id: generateId("task"),
  text,
  done: false
 });

 saveClassSpace(materiaId, { tasks });

}

function toggleClassTask(materiaId, taskId){

 const space = getClassSpace(materiaId);

 const tasks = (space.tasks || []).map(t =>
  t.id === taskId ? { ...t, done: !t.done } : t
 );

 saveClassSpace(materiaId, { tasks });

}

function deleteClassTask(materiaId, taskId){

 const space = getClassSpace(materiaId);

 const tasks = (space.tasks || []).filter(
  t => t.id !== taskId
 );

 saveClassSpace(materiaId, { tasks });

}

function editClassTask(materiaId, taskId, newText){

 const space = getClassSpace(materiaId);

 const tasks = (space.tasks || []).map(t =>
  t.id === taskId ? { ...t, text: newText } : t
 );

 saveClassSpace(materiaId, { tasks });

}

function renderClassSpaceTasks(materiaId, space){

 const container =
  document.getElementById("classSpaceTasks");

 if(!container) return;

 const tasks = space.tasks || [];

 container.innerHTML = `

  <h3 class="cs-section-title"><i data-lucide="list-checks" class="icon"></i>Tareas próxima clase</h3>

  <div class="cs-task-add">

   <input
    type="text"
    id="csNewTaskInput"
    placeholder="Nueva tarea..."
   >

   <button type="button" id="csAddTaskBtn" aria-label="Agregar tarea"><i data-lucide="plus" class="icon"></i></button>

  </div>

  <div class="cs-task-list" id="csTaskList"></div>

 `;

 const list = container.querySelector("#csTaskList");

 if(tasks.length === 0){

  list.innerHTML =
   `<p class="cs-empty">No hay tareas todavía.</p>`;

 }else{

  tasks.forEach(task => {

   const row = document.createElement("div");

   row.className =
    "cs-task-row" + (task.done ? " cs-task-done" : "");

   row.innerHTML = `

    <label class="cs-task-checkbox">

     <input
      type="checkbox"
      ${task.done ? "checked" : ""}
     >

     <span class="cs-task-text">
      ${escapeHtml(task.text)}
     </span>

    </label>

    <div class="cs-task-actions">

     <button
      type="button"
      class="cs-task-edit"
      aria-label="Editar tarea"
     ><i data-lucide="pencil" class="icon"></i></button>

     <button
      type="button"
      class="cs-task-delete"
      aria-label="Eliminar tarea"
     ><i data-lucide="trash-2" class="icon"></i></button>

    </div>

   `;

   row
    .querySelector("input[type=checkbox]")
    .addEventListener("change", () => {

     toggleClassTask(materiaId, task.id);
     renderClassSpaceTasks(materiaId, getClassSpace(materiaId));
     // FIX (Dashboard no reactivo): además de refrescar la
     // lista local de tareas, se refresca la tarjeta de
     // pendientes del Dashboard si está en el DOM.
     refreshDashboardPendingTasks();

    });

   row
    .querySelector(".cs-task-delete")
    .addEventListener("click", () => {

     if(confirm("¿Eliminar tarea?")){

      deleteClassTask(materiaId, task.id);
      renderClassSpaceTasks(materiaId, getClassSpace(materiaId));
      refreshDashboardPendingTasks();

     }

    });

   row
    .querySelector(".cs-task-edit")
    .addEventListener("click", () => {

     const nuevoTexto = prompt("Editar tarea:", task.text);

     if(nuevoTexto !== null && nuevoTexto.trim() !== ""){

      editClassTask(materiaId, task.id, nuevoTexto.trim());
      renderClassSpaceTasks(materiaId, getClassSpace(materiaId));
      refreshDashboardPendingTasks();

     }

    });

   list.appendChild(row);

  });

 }

 const input = container.querySelector("#csNewTaskInput");
 const addBtn = container.querySelector("#csAddTaskBtn");

 function handleAdd(){

  const text = input.value.trim();

  if(!text) return;

  addClassTask(materiaId, text);
  renderClassSpaceTasks(materiaId, getClassSpace(materiaId));
  showToast("Tarea agregada");
  refreshDashboardPendingTasks();

 }

 addBtn.addEventListener("click", handleAdd);

 input.addEventListener("keydown", e => {

  if(e.key === "Enter"){
   e.preventDefault();
   handleAdd();
  }

 });

 _refreshIcons();

}

// =========================================================
// Helper de etiquetas de tipo de evento — la sigue usando
// dashboard.js (Próximo evento), así que se mantiene acá
// aunque Class Space ya no muestre su propio listado de
// eventos de la materia.
// =========================================================

function eventTypeLabel(tipo){

 const labels = {
  clase: "Clase",
  parcial: "Parcial",
  final: "Final",
  recuperatorio: "Recuperatorio",
  tp: "Entrega TP",
  presentacion: "Presentación",
  personalizado: "Personalizado"
 };

 return labels[tipo] || tipo;

}

function formatFechaLarga(fecha){

 const [y, m, d] = fecha.split("-");

 const date = new Date(
  Number(y),
  Number(m) - 1,
  Number(d)
 );

 return date.toLocaleDateString("es-AR", {
  weekday: "short",
  day: "numeric",
  month: "short"
 });

}
