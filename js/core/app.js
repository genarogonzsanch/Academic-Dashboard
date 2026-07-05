let states = getStates();

let currentPlan = null;

if (isOnboardingCompleted()) {

  const selectedCareer =
    getSelectedCareer();

  if (
    selectedCareer &&
    AVAILABLE_PLANS[selectedCareer]
  ) {

    currentPlan =
      AVAILABLE_PLANS[
        selectedCareer
      ].plan;

  }

}

function start(plan){

  currentPlan = plan;

  savePlan(plan);

  renderDashboard(
    plan,
    states
  );

  renderMaterias(
    plan,
    states
  );

}

if(currentPlan){

  start(currentPlan);

}

renderCalendar();

const startBtn =
 document.getElementById(
  "startAppBtn"
 );

if(startBtn){

 startBtn.addEventListener(
  "click",
  ()=>{

   const name =
    document
     .getElementById(
      "userName"
     )
     .value
     .trim();

   const career =
    document
     .getElementById(
      "careerSelect"
     )
     .value;

   if(!name){

    alert(
     "Ingresá tu nombre"
    );

    return;
   }

saveProfile({
 name
});

saveSelectedCareer(
 career
);

saveOnboardingCompleted();

const plan =
 AVAILABLE_PLANS[
  career
 ].plan;

start(plan);

onboarding.style.display =
 "none";

appContent.style.display =
 "block";

console.log(
 "Perfil guardado"
);
 }

 );

}
const onboarding =
 document.getElementById(
  "onboarding"
 );

const appContent =
 document.getElementById(
  "appContent"
 );
if(
 onboarding &&
 isOnboardingCompleted()
){

 onboarding.style.display =
  "none";

 appContent.style.display =
  "block";

}else{

 appContent.style.display =
  "none";

}

const careerSelect =
 document.getElementById(
  "careerSelect"
 );

if(careerSelect){

 Object.values(
  AVAILABLE_PLANS
 ).forEach(plan=>{

  const option =
   document.createElement(
    "option"
   );

  option.value =
   plan.id;

  option.textContent =
   plan.name;

  careerSelect.appendChild(
   option
  );

 });

}