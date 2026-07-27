function showScreen(screen){

 const home =
  document.getElementById(
   "homeScreen"
  );

 const calendar =
  document.getElementById(
   "calendarScreen"
  );

 const subjects =
  document.getElementById(
   "subjectsScreen"
  );

 const classSpace =
  document.getElementById(
   "classSpaceScreen"
  );

 const notesSubjects =
  document.getElementById(
   "notesSubjectsScreen"
  );

 home.style.display =
  screen === "home" ? "block" : "none";

 calendar.style.display =
  screen === "calendar" ? "block" : "none";

 subjects.style.display =
  screen === "subjects" ? "block" : "none";

 // classSpaceScreen y notesSubjectsScreen no son pestañas de
 // la bottom-nav, pero se ocultan cada vez que se cambia de
 // pantalla principal para que nunca queden superpuestas (ej:
 // usuario abre "Tomar notas" desde el Dashboard y después
 // toca "Calendario").
 if(classSpace){

  classSpace.style.display =
   "none";

 }

 if(notesSubjects){

  notesSubjects.style.display =
   "none";

 }

 document
  .querySelectorAll(
   ".nav-btn"
  )
  .forEach(btn=>{

   btn.classList.remove(
    "active"
   );

   if(
    btn.dataset.screen ===
    screen
   ){

    btn.classList.add(
     "active"
    );

   }

  });

 localStorage.setItem(
  "activeScreen",
  screen
 );

}

document
 .querySelectorAll(
  ".nav-btn"
 )
 .forEach(btn=>{

  btn.addEventListener(
   "click",
   ()=>{

    showScreen(
     btn.dataset.screen
    );

   }
 );

 });

showScreen(
 localStorage.getItem(
  "activeScreen"
 ) || "home"
);
