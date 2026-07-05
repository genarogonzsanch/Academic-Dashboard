function renderDashboard(plan, states) {

 const dashboard =
  document.getElementById(
   "dashboard"
  );

 if (!dashboard) return;

 let total = 0;
 let ap = 0;
 let pe = 0;

 plan.años.forEach(anio => {

  anio.materias.forEach(materia => {

   total++;

   const estado =
    states[materia.codigo] ||
    "pendiente";

   if (
    estado === "aprobada"
   ) {
    ap++;
   } else {
    pe++;
   }

  });

 });

 const porcentaje =
  total
   ? Math.round(
      (ap / total) * 100
     )
   : 0;

 const profile =
  typeof getProfile === "function"
   ? getProfile()
   : null;

 const saludo =
  profile && profile.name
   ? `Hola, ${profile.name.split(" ")[0]} 👋`
   : "Hola 👋";

 dashboard.innerHTML = `

 <div class="dashboard-v2">

  <div class="dashboard-hero">

   <div class="hero-eyebrow">
    ${saludo}
   </div>

   <h1>
    Seguí avanzando.
   </h1>

  </div>

  <div
   class="career-card"
  >

   <div class="career-card-top">

    <div>
     <div class="career-header">
      PSICOLOGÍA
     </div>

     <div class="career-status">
      ● Activa
     </div>
    </div>

    <div class="career-percent">
     ${porcentaje}%
    </div>

   </div>

   <div
    class="career-progress"
   >

    <div
     class="career-progress-bar"
     style="
      width:${porcentaje}%"
    ></div>

   </div>

   <div
    class="career-meta"
   >

    <div class="career-meta-item">
     <strong>${ap}</strong>
     <span>Aprobadas</span>
    </div>

    <div class="career-meta-item">
     <strong>${pe}</strong>
     <span>Pendientes</span>
    </div>

   </div>

  </div>

  <div class="quick-actions">

   <button
    type="button"
    class="quick-action-btn"
    data-goto="calendar"
   >
    <span aria-hidden="true">📅</span>
    <span>Calendario</span>
   </button>

   <button
    type="button"
    class="quick-action-btn"
    data-goto="subjects"
   >
    <span aria-hidden="true">📚</span>
    <span>Materias</span>
   </button>

  </div>

  <div
   id="nextClassCard"
   class="dashboard-card"
  >
  </div>

  <div
   id="upcomingEventsCard"
   class="dashboard-card"
  >
  </div>

 </div>

 `;

 dashboard
  .querySelectorAll(
   ".quick-action-btn"
  )
  .forEach(btn => {

   btn.addEventListener(
    "click",
    () => {

     if (
      typeof showScreen ===
      "function"
     ) {

      showScreen(
       btn.dataset.goto
      );

     }

    }
   );

  });

 renderNextClass();
 renderUpcomingEvents();
}
function formatDay(fecha) {

 const dias = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado"
 ];

 const [year, month, day] =
   fecha.split("-").map(Number);

 const localDate =
   new Date(
     year,
     month - 1,
     day
   );

 return dias[
   localDate.getDay()
 ];

}
function getNextClass() {

 const now = new Date();

 const clases = generateEvents()

  .filter(
   e => e.tipo === EVENT_TYPES.CLASE
  )

  .map(event => ({
   ...event,
   dateTime: new Date(
    `${event.fecha}T${event.horaInicio}`
   )
  }))

  .filter(
   event => event.dateTime > now
  )

  .sort(
   (a,b) => a.dateTime - b.dateTime
  );

 return clases[0] || null;
}

function getUpcomingEvents() {

 const now = new Date();

 return generateEvents()

  .filter(
   e => e.tipo !== EVENT_TYPES.CLASE
  )

  .map(event => ({
   ...event,
   dateTime: new Date(
    `${event.fecha}T${event.horaInicio || "00:00"}`
   )
  }))

  .filter(
   event => event.dateTime > now
  )

  .sort(
   (a,b) => a.dateTime - b.dateTime
  )

  .slice(0,3);
}

function renderNextClass() {

 const card =
  document.getElementById(
   "nextClassCard"
  );

 if (!card) return;

 const nextClass =
  getNextClass();

 if (!nextClass) {

  card.innerHTML = `

   <h2>
    Próxima clase
   </h2>

   <p class="empty-state">
    No hay clases programadas
   </p>

  `;

  return;
 }

 card.innerHTML = `

  <h2>
   Próxima clase
  </h2>

  <div class="next-class">

   <div class="next-class-main">

    <div class="next-class-subject">
     ${nextClass.materiaNombre}
    </div>

    <div class="next-class-meta">
     ${formatDay(nextClass.fecha)}
     ·
     ${nextClass.fecha}
    </div>

   </div>

   <div class="next-class-time">
    ${nextClass.horaInicio}
    -
    ${nextClass.horaFin}
   </div>

  </div>

 `;
}

function renderUpcomingEvents() {

 const card =
  document.getElementById(
   "upcomingEventsCard"
  );

 if (!card) return;

 const events =
  getUpcomingEvents();

 if (!events.length) {

  card.innerHTML = `

   <h2>
    Próximos eventos
   </h2>

   <p class="empty-state">
    No hay eventos próximos
   </p>

  `;

  return;
 }

 card.innerHTML = `

  <h2>
   Próximos eventos
  </h2>

  <div class="event-list">

${events.map(event => `

 <div class="event-row">

  <span
   class="event-dot badge-${event.tipo}"
  ></span>

  <div class="event-row-main">

   <div class="event-subject">
    ${event.materiaNombre}
   </div>

   <div class="event-meta">
    <span class="event-type">
     ${event.tipo}
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

`).join("")}

  </div>

 `;
}
