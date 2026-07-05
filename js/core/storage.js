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
      customEvents:[]
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
      customEvents:[]
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
      customEvents:[]
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
      customEvents: []
    };

    saveCareerData(allData);
  }

  return allData[careerId];
}