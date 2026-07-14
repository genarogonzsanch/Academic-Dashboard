let aniosAbiertos = {};

// Búsqueda de materias en la pantalla principal (no afecta a
// las listas embebidas dentro del onboarding, que no tienen
// buscador). Reutiliza la misma normalización acento-insensible
// que ya usa el autocompletado de materias en eventos.
let materiasSearchQuery = "";

function normalizeText(str){

  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

}

// =========================================================
// ENCABEZADO DE CARRERA
// Antes vivía como "career-card" dentro del dashboard; ahora
// es lo primero que se ve al entrar a la pantalla Carrera
// (ex "Materias"). Reutiliza las mismas clases CSS
// (.career-card, .career-meta, etc.) que ya existían, solo
// cambia dónde se renderiza.
// =========================================================
function renderCareerHeader(plan, states){

  const container =
    document.getElementById("careerHeader");

  if(!container) return;

  let total = 0;
  let ap = 0;
  let pe = 0;

  plan.años.forEach(anio => {

    anio.materias.forEach(materia => {

      total++;

      const estado =
        states[materia.codigo] ||
        "pendiente";

      if(estado === "aprobada"){
        ap++;
      }else{
        pe++;
      }

    });

  });

  const porcentaje =
    total
      ? Math.round((ap / total) * 100)
      : 0;

  container.innerHTML = `

    <div class="career-card">

      <div class="career-card-top">

        <div>
          <div class="career-header">
            ${(plan.carrera || "").toUpperCase()}
          </div>

          <div class="career-status">
            ● Activa
          </div>
        </div>

        <div class="career-percent">
          ${porcentaje}%
        </div>

      </div>

      <div class="career-progress">

        <div
          class="career-progress-bar"
          data-progress="${porcentaje}"
        ></div>

      </div>

      <div class="career-meta">

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

  `;

  const progressBar =
    container.querySelector(
      ".career-progress-bar"
    );

  if(progressBar){

    requestAnimationFrame(() => {

      progressBar.style.width =
        progressBar.dataset.progress + "%";

    });

  }

}

function aprobarAnio(anio, states){

  anio.materias.forEach(m => {
    states[m.codigo] = "aprobada";
  });

  saveStates(states);

}

function reiniciarAnio(anio, states){

  anio.materias.forEach(m => {
    states[m.codigo] = "pendiente";
  });

  saveStates(states);

}

function renderMaterias(plan, states, containerId = "materias") {

  const c = document.getElementById(containerId);

  if (!c) return;

  if(containerId === "materias"){
    renderCareerHeader(plan, states);
  }

  c.innerHTML = "";

  const query =
    containerId === "materias"
      ? materiasSearchQuery.trim()
      : "";

  let huboResultados = false;

  plan.años.forEach(anio => {

    const materias = anio.materias;

    const materiasVisibles = query
      ? materias.filter(m =>
          normalizeText(m.nombre).includes(
            normalizeText(query)
          )
        )
      : materias;

    if (query && materiasVisibles.length === 0) {
      return;
    }

    huboResultados = true;

    const aprobadas = materias.filter(
      m => (states[m.codigo] || "pendiente") === "aprobada"
    ).length;

    const cursando = materias.filter(
      m => (states[m.codigo] || "pendiente") === "cursando"
    ).length;

    let claseAnio = "anio-pendiente";

    if (aprobadas === materias.length) {
      claseAnio = "anio-aprobado";
    } else if (cursando > 0) {
      claseAnio = "anio-cursando";
    } else if (aprobadas > 0) {
      claseAnio = "anio-incompleto";
    }

    const div = document.createElement("div");
    div.className = `anio ${claseAnio}`;

    const forzarAbierto =
      query && materiasVisibles.length > 0;

    if (aniosAbiertos[anio.numero] || forzarAbierto) {
      div.classList.add("anio-open");
    }

div.innerHTML = `
<div
  class="anio-header"
  data-anio="${anio.numero}"
>

  <div class="anio-titulo">
    <h2>${anio.numero}° Año</h2>
    <span class="anio-subtitulo">
      ${aprobadas}/${materias.length} materias aprobadas
    </span>
  </div>

  <div class="anio-header-right">

    <div class="anio-stats">
      <span>
        ${Math.round(
          (aprobadas / materias.length) * 100
        )}%
      </span>
    </div>

    <span class="anio-chevron"><i data-lucide="chevron-down" class="icon"></i></span>

  </div>

</div>

`;
    const contenido =
  document.createElement("div");

contenido.className =
  "anio-contenido";

  const acciones =
 document.createElement("div");

acciones.className =
 "anio-acciones";

acciones.innerHTML = `
<button
 class="btn-anio"
 data-anio="${anio.numero}">
 APROBAR AÑO
</button>

<button
 class="btn-reset-anio"
 data-anio="${anio.numero}">
 REINICIAR
</button>
`;

  if (
 !aniosAbiertos[anio.numero] &&
 !forzarAbierto
) {

 contenido.style.display =
  "none";

}
contenido.appendChild(
 acciones
);
    materiasVisibles.forEach(m => {

      const estado =
        states[m.codigo] || "pendiente";

      const item =
        document.createElement("div");

      item.className = "materia";

      item.innerHTML = `
        <div class="materia-info">

          <strong class="materia-nombre">${m.nombre}</strong>

          <div class="materia-meta">
            Código: ${m.codigo}
            ·
            ${m.cargaHoraria} hs
          </div>

          <div class="materia-correlativas">
            Correlativas:
            ${
              m.correlativas &&
              m.correlativas.length > 0
                ? m.correlativas.join(", ")
                : "Ninguna"
            }
          </div>

        </div>

        <div class="materia-acciones">

          <select data-id="${m.codigo}">
            <option value="pendiente">
              Pendiente
            </option>

            <option value="cursando">
              Cursando
            </option>

            <option value="aprobada">
              Aprobada
            </option>
          </select>

          ${
            estado === "cursando"
              ? `
                <button
                  class="btn-horario"
                  data-id="${m.codigo}">
                  <i data-lucide="calendar" class="icon"></i> Horario
                </button>
              `
              : ""
          }

          <button
            class="btn-class-space"
            data-id="${m.codigo}">
            <i data-lucide="folder-open" class="icon"></i> Clase
          </button>

        </div>
      `;

      contenido.appendChild(item);

      const select =
        item.querySelector("select");

      select.value = estado;

      select.classList.add(
  "estado-" + estado
);

      select.addEventListener(
        "change",
        e => {

          select.className = "";

select.classList.add(
  "estado-" + e.target.value
);

          // Pequeño "rebote" visual al cambiar de estado.
          // Puramente cosmético: no afecta el guardado ni
          // el estado real de la materia.
          select.classList.add(
            "materia-state-pulse"
          );

          select.addEventListener(
            "animationend",
            () => {

              select.classList.remove(
                "materia-state-pulse"
              );

            },
            { once: true }
          );

          states[m.codigo] =
            e.target.value;

          saveStates(states);

          renderDashboard(
            plan,
            states
          );

          renderMaterias(
            plan,
            states,
            containerId
          );

          if(
           typeof renderCalendar ===
           "function"
          ){

           renderCalendar();

          }

        }
      );

    });

    div.appendChild(contenido);

    c.appendChild(div);

  });

  if (query && !huboResultados) {

    c.innerHTML = `
      <p class="empty-state materias-empty-search">
        No encontramos materias para
        "${query}".
      </p>
    `;

  }

  c
 .querySelectorAll(
  ".anio"
 )
 .forEach(card => {
  const header = card.querySelector(".anio-header");

  header.addEventListener(
   "click",
   () => {

    const numero =
 card
  .querySelector(
   ".anio-header"
  )
  .dataset.anio;

    aniosAbiertos[numero] =
     !aniosAbiertos[numero];

    renderMaterias(
     plan,
     states,
     containerId
    );

   }
  );

 });

  c
 .querySelectorAll(
  ".btn-horario"
 )
 .forEach(btn => {

  btn.addEventListener(
   "click",
   (e) => {

    e.stopPropagation();

    const codigo =
     btn.dataset.id;

    const materia =
     plan.años
      .flatMap(
       a => a.materias
      )
      .find(
       m =>
        m.codigo === codigo
      );

    if(materia){

      openScheduleModal(
       materia
      );

    }

   }
  );

 });

  c
 .querySelectorAll(
  ".btn-class-space"
 )
 .forEach(btn => {

  btn.addEventListener(
   "click",
   (e) => {

    e.stopPropagation();

    const codigo =
     btn.dataset.id;

    if(
     typeof openClassSpace ===
     "function"
    ){

     openClassSpace(
      codigo
     );

    }

   }
  );

 });


  c
    .querySelectorAll(".btn-anio")
    .forEach(btn => {

      btn.addEventListener(
        "click",
        () => {

          if (
            !confirm(
              "¿Aprobar todas las materias del año?"
            )
          ) {
            return;
          }

          const numero =
            Number(
              btn.dataset.anio
            );

          const anio =
            plan.años.find(
              a =>
                a.numero === numero
            );

          aprobarAnio(anio, states);

          renderDashboard(
            plan,
            states
          );

          renderMaterias(
            plan,
            states,
            containerId
          );

          if(
           typeof renderCalendar ===
           "function"
          ){

           renderCalendar();

          }

        }
      );

    });

  c
    .querySelectorAll(".btn-reset-anio")
    .forEach(btn => {

      btn.addEventListener(
        "click",
        () => {

          if (
            !confirm(
              "¿Reiniciar todas las materias de este año?"
            )
          ) {
            return;
          }

          const numero =
            Number(
              btn.dataset.anio
            );

          const anio =
            plan.años.find(
              a =>
                a.numero === numero
            );

          reiniciarAnio(anio, states);

          renderDashboard(
            plan,
            states
          );

          renderMaterias(
            plan,
            states,
            containerId
          );

          if(
           typeof renderCalendar ===
           "function"
          ){

           renderCalendar();

          }

        }
      );

    });

   if(typeof _refreshIcons === "function"){
    _refreshIcons();
   }

   }

/* =========================================================
   BUSCADOR DE MATERIAS
   Filtra por nombre (acento-insensible) sobre la pantalla
   principal de Materias. No afecta al onboarding, que no
   tiene input de búsqueda.
========================================================= */
document
 .getElementById("materiasSearchInput")
 ?.addEventListener(
  "input",
  e => {

   materiasSearchQuery = e.target.value;

   if(
    typeof currentPlan !== "undefined" &&
    currentPlan
   ){

    renderMaterias(
     currentPlan,
     states,
     "materias"
    );

   }

  }
 );
