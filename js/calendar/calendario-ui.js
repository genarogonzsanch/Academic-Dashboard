function openScheduleModal(
 materia
){



 document
  .getElementById(
   "materiaHorarioId"
  )
  .value =
  materia.codigo;

 document
  .getElementById(
   "materiaHorarioNombre"
  )
  .value =
  materia.nombre;

 document
  .getElementById(
   "modalHorario"
  )
  .classList
  .remove(
   "hidden"
  );

}
function editSchedule(
 schedule
){

 document
  .getElementById(
   "editingScheduleId"
  )
  .value =
  schedule.id;

 document
  .getElementById(
   "materiaHorarioId"
  )
  .value =
  schedule.materiaId;

 const materia =
  getMateriaById(
   schedule.materiaId
  );

 document
  .getElementById(
   "materiaHorarioNombre"
  )
  .value =
  materia
   ? materia.nombre
   : "";

 document
  .getElementById(
   "weekday"
  )
  .value =
  schedule.weekday;

 document
  .getElementById(
   "startTime"
  )
  .value =
  schedule.startTime;

 document
  .getElementById(
   "endTime"
  )
  .value =
  schedule.endTime;

 document
  .getElementById(
   "startDate"
  )
  .value =
  schedule.startDate;

 document
  .getElementById(
   "endDate"
  )
  .value =
  schedule.endDate;

 document
  .getElementById(
   "modalHorario"
  )
  .classList
  .remove(
   "hidden"
  );

  document
 .getElementById(
  "classMode"
 )
 .value =
 schedule.mode ||
 "presencial";

}

function closeScheduleModal(){

 document
  .getElementById(
   "modalHorario"
  )
  .classList
  .add(
   "hidden"
  );

}

document
 .getElementById(
  "closeScheduleBtn"
 )
 ?.addEventListener(
  "click",
  closeScheduleModal
 );

document
 .getElementById(
  "saveScheduleBtn"
 )
 ?.addEventListener(
  "click",
  ()=>{

   const editingScheduleId =
    document
     .getElementById(
      "editingScheduleId"
     )
     .value;

   const materiaId =
    document
     .getElementById(
      "materiaHorarioId"
     )
     .value;

   const data = {

    materiaId,

    mode:
 document
  .getElementById(
   "classMode"
  )
  .value,

    weekday:
     document
      .getElementById(
       "weekday"
      )
      .value,

    startTime:
     document
      .getElementById(
       "startTime"
      )
      .value,

    endTime:
     document
      .getElementById(
       "endTime"
      )
      .value,

    startDate:
     document
      .getElementById(
       "startDate"
      )
      .value,

    endDate:
     document
      .getElementById(
       "endDate"
      )
      .value

   };

   if(editingScheduleId){

    updateSchedule(
     editingScheduleId,
     data
    );

   }else{

    createSchedule(
     data
    );

   }

   document
    .getElementById(
     "editingScheduleId"
    )
    .value = "";

   renderCalendar();

   if(
    typeof renderDashboard ===
    "function" &&
    typeof currentPlan !==
    "undefined" &&
    currentPlan
   ){

    renderDashboard(
     currentPlan,
     states
    );

   }

   alert(
    "Horario guardado"
   );

   closeScheduleModal();

  }
 );
 


function openDayEventsModal(date){

 const events =
  generateEvents()
   .filter(
    e => e.fecha === date
   );

 document.getElementById(
  "dayEventsTitle"
 ).textContent =
  `Eventos - ${date}`;

 const list =
  document.getElementById(
   "dayEventsList"
  );

 list.innerHTML = "";

 if(events.length === 0){

  list.innerHTML =
   "<p>No hay eventos para este día.</p>";

 }else{

  events.forEach(event=>{

   const div =
    document.createElement(
     "div"
    );

   div.className =
    "card";

if(event.scheduleId){

 div.innerHTML =
 `
 <strong>
  ${event.materiaNombre}
 </strong>

 <br>

 ${event.horaInicio}
 -
 ${event.horaFin}

 <br>

 Tipo:
 ${event.tipo}

 <br><br>

 <button
  class="edit-schedule-btn"
 >
  ✏️ Editar horario
 </button>

 <button
  class="delete-schedule-btn"
 >
  🗑 Eliminar horario
 </button>
 `;

}else{

 div.innerHTML =
 `
 <strong>
  ${event.materiaNombre}
 </strong>

 <br>

 ${event.horaInicio}
 -
 ${event.horaFin}

 <br>

Tipo:
${event.tipo}

<br>

${
 event.mode === "virtual"
 ? "💻 Virtual"
 : event.mode === "mixta"
 ? "🔄 Mixta"
 : "🏫 Presencial"
}

 <br><br>

 <button
  class="edit-event-btn"
 >
  ✏️ Editar
 </button>

 <button
  class="delete-event-btn"
 >
  🗑 Eliminar
 </button>
 `;

}

   list.appendChild(
    div
   );
   const editScheduleBtn =
 div.querySelector(
  ".edit-schedule-btn"
 );

if(editScheduleBtn){

 editScheduleBtn
  .addEventListener(
   "click",
   ()=>{

    const schedule =
     getSchedules()
      .find(
       s =>
        s.id ===
        event.scheduleId
      );

    if(schedule){

 closeDayEventsModal();

 editSchedule(
  schedule
 );

}

   }
  );

}
const deleteScheduleBtn =
 div.querySelector(
  ".delete-schedule-btn"
 );

if(deleteScheduleBtn){

 deleteScheduleBtn
  .addEventListener(
   "click",
   ()=>{

    if(
     confirm(
      "¿Eliminar horario?"
     )
    ){

deleteSchedule(
 event.scheduleId
);

renderCalendar();

if(
 typeof renderDashboard ===
 "function" &&
 typeof currentPlan !==
 "undefined" &&
 currentPlan
){

 renderDashboard(
  currentPlan,
  states
 );

}

closeDayEventsModal();
    }

   }
  );

}
   const editBtn =
 div.querySelector(
  ".edit-event-btn"
 );

if(editBtn){

 editBtn.addEventListener(
  "click",
  ()=>{

   editEvent(event);

  }
 );

}
   const deleteBtn =
 div.querySelector(
  ".delete-event-btn"
 );

if(deleteBtn){

 deleteBtn.addEventListener(
  "click",
  ()=>{

   if(
    confirm(
     "¿Eliminar evento?"
    )
   ){

    deleteEvent(
     event.id
    );

    renderCalendar();

    if(
     typeof renderDashboard ===
     "function" &&
     typeof currentPlan !==
     "undefined" &&
     currentPlan
    ){

     renderDashboard(
      currentPlan,
      states
     );

    }

    openDayEventsModal(
     date
    );

   }

  }
 );

}

  });

 }

 document
  .getElementById(
   "dayEventsModal"
  )
  .classList
  .remove(
   "hidden"
  );

   document
  .getElementById(
   "newEventBtn"
  )
  .onclick = ()=>{

   closeDayEventsModal();

   openEventModal(date);

  };
}


function closeDayEventsModal(){

 document.getElementById(
  "dayEventsModal"
 ).classList.add(
  "hidden"
 );



}

document
 .getElementById(
  "closeEventBtn"
 )
 ?.addEventListener(
  "click",
  closeEventModal
 );

document
 .getElementById(
  "closeDayEventsBtn"
 )
 ?.addEventListener(
  "click",
  closeDayEventsModal
 );


function openEventModal(date){

 document.getElementById(
  "eventDate"
 ).value = date;

 const select =
  document.getElementById(
   "eventMateria"
  );

 select.innerHTML = "";

 const plan =
  getPlan();

 if(plan){

  plan.años.forEach(anio=>{

 anio.materias.forEach(materia=>{

  const estado =
   getStates()[materia.codigo] ||
   "pendiente";

  if(
   estado !== "cursando" &&
   estado !== "pendiente"
  ){
   return;
  }

  const option =
   document.createElement(
    "option"
   );

  option.value =
   materia.codigo;

  option.textContent =
   materia.nombre;

  select.appendChild(
   option
  );

 });

});

 }

 document.getElementById(
  "eventModal"
 ).classList.remove(
  "hidden"
 );

}
function editEvent(event){

 document.getElementById(
  "editingEventId"
 ).value =
  event.id;

 document.getElementById(
  "eventType"
 ).value =
  event.tipo;

 document.getElementById(
  "eventMateria"
 ).value =
  event.materiaId;

 document.getElementById(
  "eventDate"
 ).value =
  event.fecha;

 document.getElementById(
  "eventStart"
 ).value =
  event.horaInicio;

 document.getElementById(
  "eventEnd"
 ).value =
  event.horaFin;

 document.getElementById(
  "eventObs"
 ).value =
  event.observaciones || "";

 document.getElementById(
  "eventModal"
 ).classList.remove(
  "hidden"
 );

}
function closeEventModal(){

 document.getElementById(
  "eventModal"
 ).classList.add(
  "hidden"
 );

}

document
 .getElementById(
  "saveEventBtn"
 )
 ?.addEventListener(
  "click",
  ()=>{

   const editingId =
    document.getElementById(
     "editingEventId"
    ).value;

   const data = {

    tipo:
     document.getElementById(
      "eventType"
     ).value,

    materiaId:
     document.getElementById(
      "eventMateria"
     ).value,

    fecha:
     document.getElementById(
      "eventDate"
     ).value,

    horaInicio:
     document.getElementById(
      "eventStart"
     ).value,

    horaFin:
     document.getElementById(
      "eventEnd"
     ).value,

    observaciones:
     document.getElementById(
      "eventObs"
     ).value

   };

   if(editingId){

    updateEvent(
     editingId,
     data
    );

   }else{

    saveEvent(
     data
    );

   }

   document.getElementById(
    "editingEventId"
   ).value = "";

   renderCalendar();

   if(
    typeof renderDashboard ===
    "function" &&
    typeof currentPlan !==
    "undefined" &&
    currentPlan
   ){

    renderDashboard(
     currentPlan,
     states
    );

   }

   alert(
    "Evento guardado"
   );

   closeEventModal();

  }
 );

/* =========================================================
   Botón de cierre (✕) en el header de los modales.
   Reutiliza el mismo mecanismo que ya usan los botones
   "Cancelar"/"Cerrar" (agregar la clase "hidden" al modal),
   no agrega lógica nueva.
========================================================= */
document
 .querySelectorAll(
  ".modal-close"
 )
 .forEach(btn => {

  btn.addEventListener(
   "click",
   () => {

    const modal =
     btn.closest(".modal");

    if (modal) {

     modal.classList.add(
      "hidden"
     );

    }

   }
  );

 });
