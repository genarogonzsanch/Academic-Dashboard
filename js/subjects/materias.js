let aniosAbiertos = {};
function renderMaterias(plan, states) {

  const c = document.getElementById("materias");

  c.innerHTML = "";

  plan.años.forEach(anio => {

    const materias = anio.materias;

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

    if (aniosAbiertos[anio.numero]) {
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

    <span class="anio-chevron">▾</span>

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
 !aniosAbiertos[anio.numero]
) {

 contenido.style.display =
  "none";

}
contenido.appendChild(
 acciones
);
    materias.forEach(m => {

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
                  📅 Horario
                </button>
              `
              : ""
          }

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

          states[m.codigo] =
            e.target.value;

          saveStates(states);

          renderDashboard(
            plan,
            states
          );

          renderMaterias(
            plan,
            states
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
document
 .querySelectorAll(
  ".anio"
 )
 .forEach(card => {
  const header = card.querySelector(".anio-header");

  header.addEventListener(
   "click",
   () => {

    console.log("click acordeon");

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
     states
    );

   }
  );

 });

document
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
  

  document
    .querySelectorAll(".btn-anio")
    .forEach(btn => {

      btn.addEventListener(
        "click",
        () => {

          console.log("APROBAR");

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

          anio.materias.forEach(
            m => {

              states[m.codigo] =
                "aprobada";

            }
          );

          saveStates(states);

          renderDashboard(
            plan,
            states
          );

          renderMaterias(
            plan,
            states
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

  document
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

          anio.materias.forEach(
            m => {

              states[m.codigo] =
                "pendiente";

            }
          );

          saveStates(states);

          renderDashboard(
            plan,
            states
          );

          renderMaterias(
            plan,
            states
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

   }
