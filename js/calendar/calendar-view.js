let currentMonth =
 new Date().getMonth();

let currentYear =
 new Date().getFullYear();

function renderCalendar(){

 const container =
  document.getElementById(
   "calendar"
  );

 if(!container) return;

 container.innerHTML = "";

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

 for(
  let i=0;
  i<offset;
  i++
 ){

  container.appendChild(
   document.createElement("div")
  );

 }

 const lastDay =
  new Date(
   currentYear,
   currentMonth+1,
   0
  ).getDate();

 const events =
  generateEvents();

 const today = new Date();

 const todayString =
  `${today.getFullYear()}-${
   String(today.getMonth()+1)
    .padStart(2,"0")
  }-${
   String(today.getDate())
    .padStart(2,"0")
  }`;

 for(
  let day=1;
  day<=lastDay;
  day++
 ){

  const cell =
   document.createElement("div");

  cell.className =
   "calendar-day";

  const dateString =
   `${currentYear}-${
    String(currentMonth+1)
     .padStart(2,"0")
   }-${
    String(day)
     .padStart(2,"0")
   }`;

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
     ${day}
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

  cell.addEventListener(
   "click",
   ()=>{

    showDayEvents(
     dateString
    );

   }
  );

  container.appendChild(
   cell
  );

 }

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

   currentMonth++;

   if(currentMonth>11){

    currentMonth=0;

    currentYear++;

   }

   renderCalendar();

  }
 );
