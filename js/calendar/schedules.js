function renderSchedules(){

 const container =
  document.getElementById(
   "schedules"
  );

 if(!container) return;

 const schedules =
  getSchedules();

 container.innerHTML = "";

 schedules.forEach(schedule=>{

  // crear tarjeta

 });

}