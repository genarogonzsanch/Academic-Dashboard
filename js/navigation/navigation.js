const PRIMARY_SCREENS = ["home", "calendar", "subjects"];
const SCREEN_TRANSITION_DURATION = 240;

let activePrimaryScreen = null;
let isPrimaryScreenTransitioning = false;

function getPrimaryScreens(){

 return {
  home: document.getElementById("homeScreen"),
  calendar: document.getElementById("calendarScreen"),
  subjects: document.getElementById("subjectsScreen")
 };

}

function animatePrimaryScreenChange(fromScreen, toScreen){

 const screens = getPrimaryScreens();
 const outgoing = screens[fromScreen];
 const incoming = screens[toScreen];
 const appContent = document.getElementById("appContent");

 if(!outgoing || !incoming || !appContent) return false;

 const direction =
  PRIMARY_SCREENS.indexOf(toScreen) >
  PRIMARY_SCREENS.indexOf(fromScreen)
   ? "forward"
   : "back";

 PRIMARY_SCREENS.forEach(name=>{

  if(name !== fromScreen && name !== toScreen){
   screens[name].style.display = "none";
  }

 });

 incoming.style.display = "block";
 outgoing.style.display = "block";

 appContent.style.minHeight =
  `${Math.max(outgoing.offsetHeight, incoming.offsetHeight)}px`;

 outgoing.classList.add(
  "screen-transitioning",
  `screen-exit-${direction}`
 );

 incoming.classList.add(
  "screen-transitioning",
  `screen-enter-${direction}`
 );

 isPrimaryScreenTransitioning = true;

 const finish = ()=>{

  if(!isPrimaryScreenTransitioning) return;

  outgoing.classList.remove(
   "screen-transitioning",
   `screen-exit-${direction}`,
   "screen-transition-active"
  );

  incoming.classList.remove(
   "screen-transitioning",
   `screen-enter-${direction}`,
   "screen-transition-active"
  );

  outgoing.style.display = "none";
  incoming.style.display = "block";
  appContent.style.minHeight = "";
  isPrimaryScreenTransitioning = false;

 };

 requestAnimationFrame(()=>{

  outgoing.classList.add("screen-transition-active");
  incoming.classList.add("screen-transition-active");

 });

 const onTransitionEnd = event=>{

  if(event.target === incoming && event.propertyName === "transform"){
   incoming.removeEventListener("transitionend", onTransitionEnd);
   finish();
  }

 };

 incoming.addEventListener("transitionend", onTransitionEnd);

 window.setTimeout(()=>{
  incoming.removeEventListener("transitionend", onTransitionEnd);
  finish();
 }, SCREEN_TRANSITION_DURATION + 80);

 return true;

}

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

 if(isPrimaryScreenTransitioning) return;

 const shouldAnimate =
  activePrimaryScreen &&
  activePrimaryScreen !== screen &&
  PRIMARY_SCREENS.includes(activePrimaryScreen) &&
  PRIMARY_SCREENS.includes(screen);

 const animated = shouldAnimate &&
  animatePrimaryScreenChange(activePrimaryScreen, screen);

 if(!animated){

  home.style.display =
   screen === "home" ? "block" : "none";

  calendar.style.display =
   screen === "calendar" ? "block" : "none";

  subjects.style.display =
   screen === "subjects" ? "block" : "none";

 }

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

 activePrimaryScreen = screen;

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

const navigationAppContent = document.getElementById("appContent");
const SWIPE_MIN_DISTANCE = 64;
const SWIPE_AXIS_THRESHOLD = 12;

let swipeStart = null;

function resetSwipe(){

 if(navigationAppContent){
  navigationAppContent.classList.remove("screen-swipe-active");
 }

 swipeStart = null;

}

if(navigationAppContent){

 navigationAppContent.addEventListener("pointerdown", event=>{

  if(
   isPrimaryScreenTransitioning ||
   !event.isPrimary ||
   (event.pointerType === "mouse" && event.button !== 0) ||
   event.target.closest(
    "button, a, input, select, textarea, [contenteditable='true'], #classSpaceScreen, #notesSubjectsScreen"
   )
  ) return;

  swipeStart = {
   pointerId: event.pointerId,
   x: event.clientX,
   y: event.clientY,
   axis: null
  };

 });

 navigationAppContent.addEventListener("pointermove", event=>{

  if(!swipeStart || event.pointerId !== swipeStart.pointerId) return;

  const deltaX = event.clientX - swipeStart.x;
  const deltaY = event.clientY - swipeStart.y;

  if(!swipeStart.axis &&
   Math.max(Math.abs(deltaX), Math.abs(deltaY)) >= SWIPE_AXIS_THRESHOLD){

   swipeStart.axis =
    Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";

   if(swipeStart.axis === "horizontal"){
    navigationAppContent.setPointerCapture?.(event.pointerId);
    navigationAppContent.classList.add("screen-swipe-active");
   }

  }

  if(swipeStart.axis === "horizontal"){
   event.preventDefault();
  }

 });

 navigationAppContent.addEventListener("pointerup", event=>{

  if(!swipeStart || event.pointerId !== swipeStart.pointerId) return;

  const deltaX = event.clientX - swipeStart.x;
  const deltaY = event.clientY - swipeStart.y;
  const isHorizontalSwipe =
   swipeStart.axis === "horizontal" &&
   Math.abs(deltaX) >= SWIPE_MIN_DISTANCE &&
   Math.abs(deltaX) > Math.abs(deltaY);

  if(isHorizontalSwipe){

   event.preventDefault();

   const currentIndex =
    PRIMARY_SCREENS.indexOf(activePrimaryScreen);

   const nextIndex = deltaX > 0
    ? currentIndex + 1
    : currentIndex - 1;

   if(nextIndex >= 0 && nextIndex < PRIMARY_SCREENS.length){
    showScreen(PRIMARY_SCREENS[nextIndex]);
   }

  }

  resetSwipe();

 });

 navigationAppContent.addEventListener("pointercancel", resetSwipe);
 navigationAppContent.addEventListener("lostpointercapture", resetSwipe);

}

showScreen(
 localStorage.getItem(
  "activeScreen"
 ) || "home"
);
