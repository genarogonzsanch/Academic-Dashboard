const EVENT_TYPES = {
 CLASE: "clase",
 PARCIAL: "parcial",
 FINAL: "final",
 RECUPERATORIO: "recuperatorio",
 TP: "tp",
 SUSPENDIDA: "suspendida",
 PERSONALIZADO: "personalizado"
};

function generateId(prefix = "id"){
 return (
  prefix +
  "_" +
  Date.now() +
  "_" +
  Math.floor(Math.random()*10000)
 );
}

function createCustomEvent(data){

   const materia =
 getMateriaById(
  data.materiaId
 );

return {

 id: generateId("evt"),

 tipo:
  data.tipo ||
  EVENT_TYPES.PERSONALIZADO,

 titulo:
  data.titulo || "",

 materiaId:
  data.materiaId || null,

 materiaNombre:
  materia
   ? materia.nombre
   : "",

 fecha:
  data.fecha,

 horaInicio:
  data.horaInicio || "",

 horaFin:
  data.horaFin || "",

 modalidad:
  data.modalidad || "",

 aula:
  data.aula || "",

 observaciones:
  data.observaciones || ""

};
}

function saveEvent(data){

 const events =
  getCustomEvents();

 const event =
  createCustomEvent(data);

 events.push(event);

 saveCustomEvents(events);

 return event;

}

function deleteEvent(eventId){

 const events =
  getCustomEvents();

 const filtered =
  events.filter(
   e => e.id !== eventId
  );

 saveCustomEvents(
  filtered
 );

}

function updateEvent(
 eventId,
 updates
){

 const events =
  getCustomEvents();

 const index =
  events.findIndex(
   e => e.id === eventId
  );

 if(index === -1){
  return null;
 }

 events[index] = {
  ...events[index],
  ...updates
 };

 saveCustomEvents(
  events
 );

 return events[index];

}