// =========================
// CLAVES DE LOCALSTORAGE
// =========================
const STORAGE_KEYS = {
 PLAN: "planActual",
 EVENT_OVERRIDES: "eventOverrides",
 PROFILE: "profile",
 SELECTED_CAREER: "selectedCareer",
 PLAN_VERSION: "planVersion",
 ONBOARDING_COMPLETED: "onboardingCompleted",
 CAREER_DATA: "careerData",
 TUTORIAL_COMPLETED: "tutorialCompleted"
};

// =========================
// PLAN DE ESTUDIOS
// =========================

// Parseo seguro: si el JSON está corrupto, devuelve el
// fallback en lugar de tirar abajo toda la app. Solo atrapa
// fallos de JSON.parse, ningún otro tipo de error.
function _safeJSONParse(raw, fallback){
 try{
  return JSON.parse(raw);
 }catch(e){
  return fallback;
 }
}

function savePlan(plan){
 localStorage.setItem(
  STORAGE_KEYS.PLAN,
  JSON.stringify(plan)
 );
}

function getPlan(){
 return _safeJSONParse(
  localStorage.getItem(STORAGE_KEYS.PLAN)
  || "null",
  null
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
      planVersion:0,
      classSpaces:{}
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
      planVersion:0,
      classSpaces:{}
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
  STORAGE_KEYS.EVENT_OVERRIDES,
  JSON.stringify(overrides)
 );
}

function getOverrides(){
 return _safeJSONParse(
  localStorage.getItem(STORAGE_KEYS.EVENT_OVERRIDES)
  || "[]",
  []
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
      planVersion:0,
      classSpaces:{}
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
    STORAGE_KEYS.PROFILE,
    JSON.stringify(profile)
  );
}

function getProfile(){
  return _safeJSONParse(
    localStorage.getItem(STORAGE_KEYS.PROFILE)
    || "null",
    null
  );
}

// =========================
// CARRERA SELECCIONADA
// =========================

function saveSelectedCareer(career){
  localStorage.setItem(
    STORAGE_KEYS.SELECTED_CAREER,
    career
  );
}

function getSelectedCareer(){
  return localStorage.getItem(
    STORAGE_KEYS.SELECTED_CAREER
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
      STORAGE_KEYS.PLAN_VERSION,
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
      planVersion:0,
      classSpaces:{}
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
      localStorage.getItem(STORAGE_KEYS.PLAN_VERSION) || 0
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
    localStorage.getItem(STORAGE_KEYS.PLAN_VERSION) || 0
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
    STORAGE_KEYS.ONBOARDING_COMPLETED,
    "true"
  );
}

function isOnboardingCompleted(){
  return (
    localStorage.getItem(
      STORAGE_KEYS.ONBOARDING_COMPLETED
    ) === "true"
  );
}

function getCareerData() {
  return _safeJSONParse(
    localStorage.getItem(STORAGE_KEYS.CAREER_DATA)
    || "{}",
    {}
  );
}

function saveCareerData(data) {
  localStorage.setItem(
    STORAGE_KEYS.CAREER_DATA,
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
      planVersion: 0,
      classSpaces: {}
    };

    saveCareerData(allData);
  }

  return allData[careerId];
}

// =========================
// CLASS SPACE (por materia)
// =========================
//
// Un Class Space = una materia (no un horario). Guarda info
// (docente/aula/modalidad), notas, checklist de próxima clase
// y materiales, todo indexado por materiaId dentro de la misma
// carrera actual (mismo patrón que states/schedules/customEvents).

function getClassSpaces(){

  const storage =
    getCareerStorage();

  if(!storage){
    return {};
  }

  return storage.classSpaces || {};

}

function saveClassSpaces(classSpaces){

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
      planVersion:0,
      classSpaces:{}
    };

  }

  allData[careerId].classSpaces =
    classSpaces;

  saveCareerData(allData);

}

function getClassSpace(materiaId){

  const spaces =
    getClassSpaces();

  return spaces[materiaId] || {
    notesBySession:{},
    tasks:[]
  };

}

function saveClassSpace(materiaId, data){

  const spaces =
    getClassSpaces();

  spaces[materiaId] = {
    ...getClassSpace(materiaId),
    ...data
  };

  saveClassSpaces(spaces);

  return spaces[materiaId];

}

// =========================
// TUTORIAL GUIADO (ONBOARDING)
// =========================

function saveTutorialCompleted(){
  localStorage.setItem(
    STORAGE_KEYS.TUTORIAL_COMPLETED,
    "true"
  );
}

function isTutorialCompleted(){
  return (
    localStorage.getItem(
      STORAGE_KEYS.TUTORIAL_COMPLETED
    ) === "true"
  );
}

function resetTutorial(){
  localStorage.removeItem(
    STORAGE_KEYS.TUTORIAL_COMPLETED
  );
  localStorage.removeItem(
    STORAGE_KEYS.ONBOARDING_COMPLETED
  );
}
