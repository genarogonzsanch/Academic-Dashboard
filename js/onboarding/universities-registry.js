// =========================================================
// REGISTRO DE UNIVERSIDADES Y CARRERAS
// =========================================================
//
// Estructura pensada para escalar sin tocar lógica:
// - Agregar una universidad nueva = agregar un objeto a
//   UNIVERSITIES.
// - Agregar una carrera nueva a una universidad = agregar un
//   objeto dentro de su array "careers".
//
// Cada carrera no guarda el plan de estudios directamente acá
// (para no duplicar datos): referencia, vía "planId", una
// entrada ya existente en AVAILABLE_PLANS (plans-registry.js).
// Si en el futuro una misma carrera tuviera planes distintos
// según la universidad, alcanza con registrar un nuevo plan en
// AVAILABLE_PLANS con otro id y apuntar "planId" a ese id: no
// hace falta cambiar nada de esta lógica.

const UNIVERSITIES = [

 {
  id: "uai",
  name: "Universidad Abierta Interamericana",
  careers: [

   {
    id: "psychology",
    name: "Psicología",
    planId: "psychology"
   }

  ]
 }

];

function getUniversities(){

 return UNIVERSITIES;

}

function getUniversityById(universityId){

 return (
  UNIVERSITIES.find(
   uni => uni.id === universityId
  ) || null
 );

}

function getCareersForUniversity(universityId){

 const university =
  getUniversityById(universityId);

 return university
  ? university.careers
  : [];

}

function getCareerFromUniversity(universityId, careerId){

 const careers =
  getCareersForUniversity(universityId);

 return (
  careers.find(
   career => career.id === careerId
  ) || null
 );

}

function getStudyPlanForCareer(universityId, careerId){

 const career =
  getCareerFromUniversity(
   universityId,
   careerId
  );

 if(!career){
  return null;
 }

 const planEntry =
  AVAILABLE_PLANS[career.planId];

 return planEntry
  ? planEntry.plan
  : null;

}
