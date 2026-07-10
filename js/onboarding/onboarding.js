const ONBOARDING_STEPS = [
 "welcome",
 "career",
 "years",
 "subjects",
 "schedule",
 "event",
 "final"
];

let onboardingStepIndex = 0;

let onboardingData = {
 name: "",
 career: "psychology"
};

function initOnboardingWizard(){

 onboardingStepIndex = 0;

 renderOnboardingStep();

}

function getOnboardingPlan(){

 const plan =
  AVAILABLE_PLANS[
   onboardingData.career
  ];

 return plan ? plan.plan : null;

}

function renderOnboardingStep(){

 const step =
  ONBOARDING_STEPS[
   onboardingStepIndex
  ];

 const content =
  document.getElementById(
   "wizardStepContent"
  );

 const backBtn =
  document.getElementById(
   "wizardBackBtn"
  );

 const skipBtn =
  document.getElementById(
   "wizardSkipBtn"
  );

 const nextBtn =
  document.getElementById(
   "wizardNextBtn"
  );

 const progressBar =
  document.getElementById(
   "wizardProgressBar"
  );

 const progressLabel =
  document.getElementById(
   "wizardProgressLabel"
  );

 const stepNumberMap = {
  welcome: null,
  career: 1,
  years: 2,
  subjects: 3,
  schedule: 4,
  event: 5,
  final: 6
 };

 const stepNumber =
  stepNumberMap[step];

 if(stepNumber){

  progressLabel.textContent =
   `Paso ${stepNumber} de 6`;

  progressBar.style.width =
   `${(stepNumber/6)*100}%`;

  progressBar
   .parentElement
   .parentElement
   .style.display = "block";

 }else{

  progressBar
   .parentElement
   .parentElement
   .style.display = "none";

 }

 backBtn.style.display =
  (step === "welcome" || step === "final")
   ? "none"
   : "inline-flex";

 skipBtn.style.display =
  step === "welcome"
   ? "inline-flex"
   : "none";

 switch(step){

  case "welcome":

   content.innerHTML = `
    <h2>¡Bienvenido!</h2>
    <p>
     Te ayudaremos a configurar tu cuenta
     en menos de un minuto.
    </p>
   `;

   nextBtn.textContent = "Comenzar";

   break;

  case "career":

   content.innerHTML = `
    <h2>Contanos sobre vos</h2>

    <label>Tu nombre</label>

    <input
     type="text"
     id="onbName"
     placeholder="Ingresá tu nombre"
     value="${onboardingData.name}"
    >

    <label>Carrera</label>

    <select id="onbCareer"></select>
   `;

   populateCareerSelect(
    document.getElementById(
     "onbCareer"
    )
   );

   document.getElementById(
    "onbCareer"
   ).value =
    onboardingData.career;

   nextBtn.textContent = "Siguiente";

   break;

  case "years":

   content.innerHTML = `
    <h2>¿Qué años ya aprobaste?</h2>

    <p>
     Usá el botón
     <strong>APROBAR AÑO</strong>
     en los años que ya completaste.
    </p>

    <div id="onboardingMateriasContainer"></div>
   `;

   renderMaterias(
    getOnboardingPlan(),
    states,
    "onboardingMateriasContainer"
   );

   nextBtn.textContent = "Siguiente";

   break;

  case "subjects":

   content.innerHTML = `
    <h2>¿Qué materias estás cursando?</h2>

    <p>
     Cambiá el estado a
     <strong>Cursando</strong>
     en las materias de este cuatrimestre.
    </p>

    <div id="onboardingMateriasContainer"></div>
   `;

   renderMaterias(
    getOnboardingPlan(),
    states,
    "onboardingMateriasContainer"
   );

   nextBtn.textContent = "Siguiente";

   break;

  case "schedule":

   renderOnboardingScheduleStep(content);

   nextBtn.textContent = "Siguiente";

   break;

  case "event":

   renderOnboardingEventStep(content);

   nextBtn.textContent = "Omitir";

   break;

  case "final":

   content.innerHTML = `
    <h2>¡Todo listo!</h2>
    <p>Tu dashboard ya está configurado.</p>
   `;

   nextBtn.textContent =
    "Entrar a la aplicación";

   break;

 }

}

function renderOnboardingScheduleStep(content){

 const plan = getOnboardingPlan();

 const cursando = [];

 plan.años.forEach(anio => {

  anio.materias.forEach(m => {

   if(
    (states[m.codigo] || "pendiente") ===
    "cursando"
   ){

    cursando.push(m);

   }

  });

 });

 content.innerHTML = `
  <h2>Configurá tus horarios</h2>
  <p>
   Elegí una materia para cargar
   sus horarios de cursada.
  </p>
  <div id="onboardingScheduleList"></div>
 `;

 const list =
  document.getElementById(
   "onboardingScheduleList"
  );

 if(cursando.length === 0){

  list.innerHTML =
   `<p class="empty-state">
    No marcaste materias como cursando
    en el paso anterior.
   </p>`;

  return;

 }

 cursando.forEach(materia => {

  const row =
   document.createElement("div");

  row.className = "materia";

  row.innerHTML = `
   <div class="materia-info">
    <strong class="materia-nombre">
     ${materia.nombre}
    </strong>
   </div>
   <div class="materia-acciones">
    <button
     class="btn-horario"
     type="button"
    >
     📅 Horario
    </button>
   </div>
  `;

  row
   .querySelector(".btn-horario")
   .addEventListener(
    "click",
    () => {

     openScheduleModal(materia);

    }
   );

  list.appendChild(row);

 });

}

function renderOnboardingEventStep(content){

 content.innerHTML = `
  <h2>Creá tu primer evento</h2>
  <p>
   Este paso es opcional. Podés agregar
   un parcial, final o entrega.
  </p>
 `;

 const btn =
  document.createElement("button");

 btn.id = "onboardingNewEventBtn";
 btn.type = "button";
 btn.textContent = "➕ Nuevo Evento";

 content.appendChild(btn);

 btn.addEventListener(
  "click",
  () => {

   const today = new Date();

   const fecha =
    `${today.getFullYear()}-${
     String(today.getMonth()+1)
      .padStart(2,"0")
    }-${
     String(today.getDate())
      .padStart(2,"0")
    }`;

   openEventModal(fecha);

  }
 );

}

function goToOnboardingStep(index){

 onboardingStepIndex = index;

 renderOnboardingStep();

}

document
 .getElementById("wizardNextBtn")
 ?.addEventListener(
  "click",
  () => {

   const step =
    ONBOARDING_STEPS[
     onboardingStepIndex
    ];

   if(step === "career"){

    const name =
     document
      .getElementById("onbName")
      .value.trim();

    const career =
     document
      .getElementById("onbCareer")
      .value;

    if(!name){

     alert("Ingresá tu nombre");

     return;

    }

    onboardingData.name = name;
    onboardingData.career = career;

    saveProfile({ name });
    saveSelectedCareer(career);
    savePlan(getOnboardingPlan());

   }

   if(
    onboardingStepIndex ===
    ONBOARDING_STEPS.length - 1
   ){

    finishOnboarding();

    return;

   }

   goToOnboardingStep(
    onboardingStepIndex + 1
   );

  }
 );

document
 .getElementById("wizardBackBtn")
 ?.addEventListener(
  "click",
  () => {

   if(onboardingStepIndex > 0){

    goToOnboardingStep(
     onboardingStepIndex - 1
    );

   }

  }
 );

document
 .getElementById("wizardSkipBtn")
 ?.addEventListener(
  "click",
  () => {

   onboardingData.career = "psychology";

   saveSelectedCareer("psychology");
   savePlan(getOnboardingPlan());

   finishOnboarding();

  }
 );

function finishOnboarding(){

 saveOnboardingCompleted();
 saveTutorialCompleted();

 const plan = getOnboardingPlan();

 start(plan);

 renderCalendar();

 if(typeof showScreen === "function"){

  showScreen("home");

 }

 document.getElementById(
  "onboarding"
 ).style.display = "none";

 document.getElementById(
  "appContent"
 ).style.display = "block";

}
