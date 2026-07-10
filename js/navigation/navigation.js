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

 home.style.display =
  "none";

 calendar.style.display =
  "none";

 subjects.style.display =
  "none";

 if(screen === "home"){
  home.style.display =
   "block";
 }

 if(screen === "calendar"){
  calendar.style.display =
   "block";
 }

 if(screen === "subjects"){
  subjects.style.display =
   "block";
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
