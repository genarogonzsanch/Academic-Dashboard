function createSchedule(data){

 const schedules =
  getSchedules();

 const schedule = {

  id:
   generateId("sch"),

  materiaId:
   data.materiaId,

   mode:
 data.mode,

  weekday:
   Number(data.weekday),

  startTime:
   data.startTime,

  endTime:
   data.endTime,

  startDate:
   data.startDate,

  endDate:
   data.endDate

 };

 schedules.push(schedule);

 saveSchedules(schedules);

 return schedule;
}

function updateSchedule(
 scheduleId,
 updates
){

 const schedules =
  getSchedules();

 const index =
  schedules.findIndex(
   s => s.id === scheduleId
  );

 if(index === -1){
  return null;
 }

 schedules[index] = {
  ...schedules[index],
  ...updates
 };

 saveSchedules(schedules);

 return schedules[index];
}

function deleteSchedule(
 scheduleId
){

 const schedules =
  getSchedules();

 const filtered =
  schedules.filter(
   s => s.id !== scheduleId
  );

 saveSchedules(filtered);
}

function getMateriaById(id){

 const plan = getPlan();

 if(!plan){
  return null;
 }

 for(const anio of plan.años){

  const materia =
   anio.materias.find(
    m => m.codigo === id
   );

  if(materia){
   return materia;
  }

 }

 return null;
}

function generateEvents(){

 const schedules = getSchedules();

 const states = getStates();

 const generated = [];

 schedules.forEach(schedule => {

  const estadoMateria =
   states[schedule.materiaId] ||
   "pendiente";

  if(estadoMateria !== "cursando"){
   return;
  }

  let current = new Date(
   schedule.startDate + "T00:00:00"
  );

  const end = new Date(
   schedule.endDate + "T23:59:59"
  );

  while(current <= end){

   if(
    current.getDay() ===
    Number(schedule.weekday)
   ){

    const materia =
     getMateriaById(
      schedule.materiaId
     );

    const year =
     current.getFullYear();

    const month =
     String(
      current.getMonth() + 1
     ).padStart(2,"0");

    const day =
     String(
      current.getDate()
     ).padStart(2,"0");

    const fecha =
     `${year}-${month}-${day}`;

    generated.push({

     id:
      `${schedule.id}_${fecha}`,

     scheduleId:
      schedule.id,

     materiaId:
      schedule.materiaId,

     materiaNombre:
      materia
       ? materia.nombre
       : "Materia",

mode:
 schedule.mode,

     tipo:
      EVENT_TYPES.CLASE,

     fecha,

     horaInicio:
      schedule.startTime,

     horaFin:
      schedule.endTime

    });

   }

   current.setDate(
    current.getDate() + 1
   );

  }

  });

 const customEvents =
  getCustomEvents();

 return [
  ...generated,
  ...customEvents
 ];
}
