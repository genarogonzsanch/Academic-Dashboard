// =========================
// PLAN DE ESTUDIOS
// =========================

function savePlan(plan){
 localStorage.setItem(
  "planActual",
  JSON.stringify(plan)
 );
}

function getPlan(){
 return JSON.parse(
  localStorage.getItem("planActual")
  || "null"
 );
}

// =========================
// ESTADOS DE MATERIAS
// =========================

function saveStates(states){

  
  const allData =
    getCareerData();

  const careerId =
    getCurrentCareerId();

  if(!careerId){
    return;
  }

  if(!allData[careerId]){

    allData[careerId] = {
      states:{},
      schedules:[],
      customEvents:[],
      planVersion:0
    };

  }

  allData[careerId].states =
    states;

  saveCareerData(allData);

}

function getStates(){

  const storage =
    getCareerStorage();

  if(!storage){
    return {};
  }

  return storage.states || {};

}

// =========================
// HORARIOS RECURRENTES
// =========================

function saveSchedules(schedules){

  const allData =
    getCareerData();

  const careerId =
    getCurrentCareerId();

  if(!careerId){
    return;
  }

  if(!allData[careerId]){

    allData[careerId] = {
      states:{},
      schedules:[],
      customEvents:[],
      planVersion:0
    };

  }

  allData[careerId].schedules =
    schedules;

  saveCareerData(allData);

}

function getSchedules(){

  const storage =
    getCareerStorage();

  if(!storage){
    return [];
  }

  return storage.schedules || [];

}
// =========================
// EXCEPCIONES
// =========================

function saveOverrides(overrides){
 localStorage.setItem(
  "eventOverrides",
  JSON.stringify(overrides)
 );
}

function getOverrides(){
 return JSON.parse(
  localStorage.getItem("eventOverrides")
  || "[]"
 );
}

// =========================
// EVENTOS MANUALES
// =========================

function saveCustomEvents(events){

  const allData =
    getCareerData();

  const careerId =
    getCurrentCareerId();

  if(!careerId){
    return;
  }

  if(!allData[careerId]){

    allData[careerId] = {
      states:{},
      schedules:[],
      customEvents:[],
      planVersion:0
    };

  }

  allData[careerId].customEvents =
    events;

  saveCareerData(allData);

}

function getCustomEvents(){

  const storage =
    getCareerStorage();

  if(!storage){
    return [];
  }

  return storage.customEvents || [];

}
// =========================
// PERFIL
// =========================

function saveProfile(profile){
  localStorage.setItem(
    "profile",
    JSON.stringify(profile)
  );
}

function getProfile(){
  return JSON.parse(
    localStorage.getItem("profile")
    || "null"
  );
}

// =========================
// CARRERA SELECCIONADA
// =========================

function saveSelectedCareer(career){
  localStorage.setItem(
    "selectedCareer",
    career
  );
}

function getSelectedCareer(){
  return localStorage.getItem(
    "selectedCareer"
  );
}

// =========================
// VERSIÓN DEL PLAN
// =========================
//
// A partir de la migración a soporte multi-carrera, la versión
// del plan se guarda DENTRO de careerData, por carrera (misma
// lógica que states/schedules/customEvents). Esto permite que
// en el futuro convivan varias carreras, cada una con su propio
// número de versión, sin pisarse entre sí.
//
// Se mantiene compatibilidad hacia atrás: si existe la clave
// global "planVersion" (esquema anterior) y todavía no hay un
// valor guardado para la carrera actual, se migra ese valor
// automáticamente la primera vez, sin perder información.

function savePlanVersion(version){

  const careerId =
    getCurrentCareerId();

  if(!careerId){

    // No hay carrera seleccionada todavía (ej: durante el
    // onboarding inicial): se guarda en la clave global legacy
    // para no perder el dato.
    localStorage.setItem(
      "planVersion",
      String(version)
    );

    return;

  }

  const allData =
    getCareerData();

  if(!allData[careerId]){

    allData[careerId] = {
      states:{},
      schedules:[],
      customEvents:[],
      planVersion:0
    };

  }

  allData[careerId].planVersion =
    version;

  saveCareerData(allData);

}

function getPlanVersion(){

  const careerId =
    getCurrentCareerId();

  if(!careerId){

    return Number(
      localStorage.getItem("planVersion") || 0
    );

  }

  const storage =
    getCareerStorage();

  if(
    storage &&
    typeof storage.planVersion === "number" &&
    storage.planVersion > 0
  ){

    return storage.planVersion;

  }

  // Compatibilidad hacia atrás: esquema global anterior
  // (una sola carrera, una sola versión). Si existe, se migra
  // a la carrera actual sin perder el dato.
  const legacy = Number(
    localStorage.getItem("planVersion") || 0
  );

  if(legacy){

    savePlanVersion(legacy);

    return legacy;

  }

  return 0;

}







// =========================
// ONBOARDING
// =========================

function saveOnboardingCompleted(){
  localStorage.setItem(
    "onboardingCompleted",
    "true"
  );
}

function isOnboardingCompleted(){
  return (
    localStorage.getItem(
      "onboardingCompleted"
    ) === "true"
  );
}

function getCareerData() {
  return JSON.parse(
    localStorage.getItem("careerData")
    || "{}"
  );
}

function saveCareerData(data) {
  localStorage.setItem(
    "careerData",
    JSON.stringify(data)
  );
}
function getCurrentCareerId() {
  return getSelectedCareer();
}

function getCareerStorage() {

  const careerId =
    getCurrentCareerId();

  if (!careerId) {
    return null;
  }

  const allData =
    getCareerData();

  if (!allData[careerId]) {

    allData[careerId] = {
      states: {},
      schedules: [],
      customEvents: [],
      planVersion: 0
    };

    saveCareerData(allData);
  }

  return allData[careerId];
}

// =========================
// TUTORIAL GUIADO (ONBOARDING)
// =========================

function saveTutorialCompleted(){
  localStorage.setItem(
    "tutorialCompleted",
    "true"
  );
}

function isTutorialCompleted(){
  return (
    localStorage.getItem(
      "tutorialCompleted"
    ) === "true"
  );
}

function resetTutorial(){
  localStorage.removeItem(
    "tutorialCompleted"
  );
  localStorage.removeItem(
    "onboardingCompleted"
  );
}
