let currentMonth =
 new Date().getMonth();

let currentYear =
 new Date().getFullYear();

// =========================================================
// VISTA SEMANA
// calendarViewMode: "month" (grilla existente, sin tocar) o
// "week" (agenda de 7 días). currentWeekStart siempre apunta
// al lunes de la semana que se está mostrando.
// =========================================================

let calendarViewMode = "month";

function getWeekStart(date){

 const d = new Date(date);
 const day = d.getDay();
 const diff = day === 0 ? -6 : 1 - day;

 d.setDate(d.getDate() + diff);
 d.setHours(0, 0, 0, 0);

 return d;

}

let currentWeekStart = getWeekStart(new Date());

function formatDateYMD(date){

 return `${date.getFullYear()}-${
  String(date.getMonth() + 1).padStart(2, "0")
 }-${
  String(date.getDate()).padStart(2, "0")
 }`;

}

function formatWeekRange(start){

 const end = new Date(start);
 end.setDate(end.getDate() + 6);

 const monthNamesShort = [
  "ene","feb","mar","abr","may","jun",
  "jul","ago","sep","oct","nov","dic"
 ];

 if(start.getMonth() === end.getMonth()){

  return `${start.getDate()} - ${end.getDate()} ${monthNamesShort[start.getMonth()]} ${start.getFullYear()}`;

 }

 return `${start.getDate()} ${monthNamesShort[start.getMonth()]} - ${end.getDate()} ${monthNamesShort[end.getMonth()]} ${end.getFullYear()}`;

}

function updateCalendarViewToggle(){

 document
  .getElementById("calendarViewMonthBtn")
  ?.classList.toggle("active", calendarViewMode === "month");

 document
  .getElementById("calendarViewWeekBtn")
  ?.classList.toggle("active", calendarViewMode === "week");

}

function renderWeekView(container, dayNamesShort){

 document.getElementById("calendarTitle").textContent =
  formatWeekRange(currentWeekStart);

 container.classList.add("calendar-week-mode");

 const events = generateEvents();

 const todayString = formatDateYMD(new Date());

 for(let i = 0; i < 7; i++){

  const date = new Date(currentWeekStart);

  date.setDate(date.getDate() + i);

  const dateString = formatDateYMD(date);

  const dayEvents = events
   .filter(e => e.fecha === dateString)
   .sort((a, b) =>
    (a.horaInicio || "").localeCompare(b.horaInicio || "")
   );

  const col = document.createElement("div");

  col.className = "calendar-week-day";

  if(dateString === todayString){
   col.classList.add("today");
  }

  col.innerHTML = `

   <div class="calendar-week-day-header">
    <span class="calendar-week-day-name">${dayNamesShort[i]}</span>
    <span class="calendar-week-day-number">${date.getDate()}</span>
   </div>

   <div class="calendar-week-day-events"></div>

  `;

  const eventsWrap =
   col.querySelector(".calendar-week-day-events");

  if(dayEvents.length === 0){

   eventsWrap.innerHTML =
    `<div class="calendar-week-empty">—</div>`;

  }else{

   dayEvents.forEach(event => {

    const badge = document.createElement("div");

    badge.className =
     `event-badge badge-${event.tipo}`;

    badge.textContent =
     `${event.horaInicio} ${event.materiaNombre}`;

    eventsWrap.appendChild(badge);

   });

  }

  col.addEventListener("click", () => {
   showDayEvents(dateString);
  });

  container.appendChild(col);

 }

}

document
 .getElementById("todayBtn")
 ?.addEventListener("click", () => {

  const now = new Date();

  if(calendarViewMode === "week"){

   currentWeekStart = getWeekStart(now);

  }else{

   currentMonth = now.getMonth();
   currentYear = now.getFullYear();

  }

  renderCalendar();

 });

document
 .getElementById("calendarViewMonthBtn")
 ?.addEventListener("click", () => {

  calendarViewMode = "month";
  updateCalendarViewToggle();
  renderCalendar();

 });

document
 .getElementById("calendarViewWeekBtn")
 ?.addEventListener("click", () => {

  calendarViewMode = "week";

  currentWeekStart =
   getWeekStart(new Date(currentYear, currentMonth, 1));

  updateCalendarViewToggle();
  renderCalendar();

 });

updateCalendarViewToggle();

function renderCalendar(){

 const container =
  document.getElementById(
   "calendar"
  );

 if(!container) return;

 container.innerHTML = "";

 container.classList.remove(
  "calendar-week-mode"
 );

 if(calendarViewMode === "week"){

  renderWeekView(
   container,
   ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"]
  );

  container.classList.remove("calendar-fade");
  void container.offsetWidth;
  container.classList.add("calendar-fade");

  return;

 }

 const monthNames = [

  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"

 ];

 document.getElementById(
  "calendarTitle"
 ).textContent =
  `${monthNames[currentMonth]} ${currentYear}`;

 const dayNames = [

  "L",
  "M",
  "X",
  "J",
  "V",
  "S",
  "D"

 ];

 dayNames.forEach(day=>{

  const div =
   document.createElement("div");

  div.className =
   "calendar-day-name";

  div.textContent =
   day;

  container.appendChild(div);

 });

 const firstDay =
  new Date(
   currentYear,
   currentMonth,
   1
  );

 let offset =
  firstDay.getDay()-1;

 if(offset < 0){
  offset = 6;
 }

 const events =
  generateEvents();

 const today = new Date();

 const todayString =
  formatDateYMD(today);

 // FIX (rediseño estilo Google Calendar): grilla fija de 42
 // celdas (6 semanas), en vez de un bloque de divs vacíos para
 // completar el offset inicial + un loop de largo variable
 // para los días del mes. Así todas las celdas tienen el mismo
 // tamaño, el alto de la grilla no salta entre meses cortos y
 // largos, y los días del mes anterior/siguiente se muestran
 // atenuados (en vez de vacíos) para completar cada semana —
 // igual que Google Calendar. No cambia qué eventos se buscan
 // ni cómo: sigue siendo generateEvents() + e.fecha === fecha
 // real de la celda, y el click sigue llamando a showDayEvents
 // con esa misma fecha.
 const TOTAL_CELLS = 42;

 const gridStart =
  new Date(
   currentYear,
   currentMonth,
   1 - offset
  );

 for(
  let i=0;
  i<TOTAL_CELLS;
  i++
 ){

  const cellDate =
   new Date(gridStart);

  cellDate.setDate(
   gridStart.getDate() + i
  );

  const dateString =
   formatDateYMD(cellDate);

  const isOutsideMonth =
   cellDate.getMonth() !== currentMonth;

  const cell =
   document.createElement("div");

  cell.className =
   "calendar-day" +
   (isOutsideMonth ? " calendar-day-outside" : "");

  if(dateString === todayString){

   cell.classList.add(
    "today"
   );

  }

  const dayEvents =
   events.filter(
    e =>
     e.fecha ===
     dateString
   );

  cell.innerHTML =
   `
    <div
     class="calendar-day-number">
     ${cellDate.getDate()}
    </div>
   `;

  dayEvents
   .slice(0,3)
   .forEach(event=>{

    const badge =
     document
      .createElement("div");

    badge.className =
     `event-badge badge-${event.tipo}`;

    badge.textContent =
 `${event.materiaNombre}
  ${event.horaInicio}`;

    cell.appendChild(
     badge
    );

   });

  if(dayEvents.length > 3){

   const moreBadge =
    document.createElement("div");

   moreBadge.className =
    "event-badge event-badge-more";

   moreBadge.textContent =
    `+${dayEvents.length - 3} más`;

   cell.appendChild(
    moreBadge
   );

  }

  cell.addEventListener(
   "click",
   ()=>{

    // Pequeño pulso visual al seleccionar el día, puramente
    // cosmético (no afecta qué eventos se muestran).
    cell.classList.add(
     "day-selected-pulse"
    );

    cell.addEventListener(
     "animationend",
     ()=>{

      cell.classList.remove(
       "day-selected-pulse"
      );

     },
     { once:true }
    );

    showDayEvents(
     dateString
    );

   }
  );

  container.appendChild(
   cell
  );

 }

 // Reinicia y vuelve a aplicar la clase de fade para que la
 // animación se reproduzca en cada cambio de mes (no solo la
 // primera vez que se pinta el calendario).
 container.classList.remove(
  "calendar-fade"
 );

 void container.offsetWidth;

 container.classList.add(
  "calendar-fade"
 );

}

function showDayEvents(date){

 openDayEventsModal(date);

}
 



document
 .getElementById(
  "prevMonth"
 )
 ?.addEventListener(
  "click",
  ()=>{

   if(calendarViewMode === "week"){

    currentWeekStart.setDate(
     currentWeekStart.getDate() - 7
    );

    renderCalendar();

    return;

   }

   currentMonth--;

   if(currentMonth<0){

    currentMonth=11;

    currentYear--;

   }

   renderCalendar();

  }
 );

document
 .getElementById(
  "nextMonth"
 )
 ?.addEventListener(
  "click",
  ()=>{

   if(calendarViewMode === "week"){

    currentWeekStart.setDate(
     currentWeekStart.getDate() + 7
    );

    renderCalendar();

    return;

   }

   currentMonth++;

   if(currentMonth>11){

    currentMonth=0;

    currentYear++;

   }

   renderCalendar();

  }
 );
