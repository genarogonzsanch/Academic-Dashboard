// =========================================================
// MIGRACIÓN DE PLANES DE ESTUDIO ENTRE VERSIONES
// =========================================================
//
// Objetivo: cuando se publica una nueva versión de la app
// (nuevas materias, nuevos años, cambios en la carga horaria,
// correlativas, etc. dentro de js/plans/*.js), el usuario
// jamás debe perder datos.
//
// Este módulo compara el plan guardado en LocalStorage
// ("planActual") contra el plan vigente en AVAILABLE_PLANS y,
// si la versión cambió, hace un merge INCREMENTAL y ADITIVO:
//
//   - agrega años nuevos que no existían
//   - agrega materias nuevas dentro de años ya existentes
//   - actualiza campos estructurales de materias existentes
//     (nombre, periodo, cargaHoraria, correlativas)
//   - conserva materias/años que ya no estén en la definición
//     nueva (por las dudas, para no romper referencias)
//
// NUNCA toca:
//   - states (estados de materias)
//   - schedules (horarios)
//   - customEvents (eventos)
//   - profile / selectedCareer / configuración
//
// NUNCA borra LocalStorage ni reinicia la aplicación.
//
// Preparado para escalar a futuras carreras: todo el proceso
// se hace por "careerId", igual que states/schedules/customEvents
// en storage.js.
// =========================================================

function mergeMateria(materiaGuardada, materiaNueva){

 // Se conserva el objeto guardado como base (por si en el
 // futuro se agregan campos propios del usuario a nivel
 // materia) y se pisan únicamente los campos estructurales
 // que vienen del plan de estudios.

 return {
  ...materiaGuardada,
  nombre: materiaNueva.nombre,
  periodo: materiaNueva.periodo,
  cargaHoraria: materiaNueva.cargaHoraria,
  correlativas: materiaNueva.correlativas
 };

}

function mergeAnio(anioGuardado, anioNuevo){

 const materiasGuardadas =
  anioGuardado.materias || [];

 const materiasFinal = [];

 // 1) Actualiza (o conserva) las materias que ya existían
 materiasGuardadas.forEach(materiaGuardada => {

  const materiaNueva =
   anioNuevo.materias.find(
    m => m.codigo === materiaGuardada.codigo
   );

  if(materiaNueva){

   materiasFinal.push(
    mergeMateria(
     materiaGuardada,
     materiaNueva
    )
   );

  }else{

   // Ya no figura en el plan nuevo: se conserva tal cual
   // para no perder ninguna referencia (estados/horarios/
   // eventos guardados apuntan a este código).
   materiasFinal.push(
    materiaGuardada
   );

  }

 });

 // 2) Agrega las materias nuevas que no existían antes
 anioNuevo.materias.forEach(materiaNueva => {

  const yaExiste =
   materiasFinal.some(
    m => m.codigo === materiaNueva.codigo
   );

  if(!yaExiste){

   materiasFinal.push(
    { ...materiaNueva }
   );

  }

 });

 return {
  ...anioGuardado,
  cargaHoraria: anioNuevo.cargaHoraria,
  materias: materiasFinal
 };

}

function mergePlanEstructura(planGuardado, planNuevo){

 const añosGuardados =
  planGuardado.años || [];

 const añosFinal = [];

 // 1) Recorre los años del plan nuevo (mantiene su orden)
 planNuevo.años.forEach(anioNuevo => {

  const anioGuardado =
   añosGuardados.find(
    a => a.numero === anioNuevo.numero
   );

  if(anioGuardado){

   añosFinal.push(
    mergeAnio(
     anioGuardado,
     anioNuevo
    )
   );

  }else{

   // Año completamente nuevo (ej: se agregó un 6° año)
   añosFinal.push(
    { ...anioNuevo }
   );

  }

 });

 // 2) Conserva años guardados que ya no estén en el plan nuevo
 añosGuardados.forEach(anioGuardado => {

  const yaExiste =
   añosFinal.some(
    a => a.numero === anioGuardado.numero
   );

  if(!yaExiste){

   añosFinal.push(
    anioGuardado
   );

  }

 });

 return {
  ...planGuardado,
  carrera: planNuevo.carrera,
  plan: planNuevo.plan,
  titulo: planNuevo.titulo,
  duracion: planNuevo.duracion,
  cargaHorariaTotal: planNuevo.cargaHorariaTotal,
  años: añosFinal
 };

}

// =========================================================
// Punto de entrada público.
//
// Se llama una vez al iniciar la app para la carrera
// actualmente seleccionada. Devuelve el plan definitivo
// (ya migrado si hacía falta) para usar como currentPlan.
//
// No modifica states / schedules / customEvents / profile.
// =========================================================
function resolvePlanForCareer(careerId){

 const careerConfig =
  AVAILABLE_PLANS[careerId];

 if(!careerConfig){
  return null;
 }

 const planNuevo =
  careerConfig.plan;

 const planGuardado =
  getPlan();

 const versionAlmacenada =
  getPlanVersion();

 // Primera vez que se carga esta carrera en este dispositivo:
 // no hay nada que migrar, se guarda el plan tal cual.
 if(!planGuardado){

  savePlan(planNuevo);

  savePlanVersion(
   careerConfig.version
  );

  return planNuevo;

 }

 // Misma versión: no hay cambios estructurales, se continúa
 // normalmente con lo que ya está guardado.
 if(versionAlmacenada === careerConfig.version){

  return planGuardado;

 }

 // Versión distinta: migración incremental de la ESTRUCTURA
 // del plan (nunca de los datos del usuario).
 console.log(
  `Academic Dashboard: migrando plan "${careerId}" de v${versionAlmacenada} a v${careerConfig.version}`
 );

 const planMigrado =
  mergePlanEstructura(
   planGuardado,
   planNuevo
  );

 savePlan(planMigrado);

 savePlanVersion(
  careerConfig.version
 );

 return planMigrado;

}
