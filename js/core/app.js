// =========================================================
// TOAST — feedback no bloqueante
// Reemplaza los alert() nativos usados al guardar horarios y
// eventos. No cambia ninguna lógica de guardado: solo se
// invoca en el mismo punto donde antes se llamaba a alert().
// =========================================================
function showToast(message, type = "success"){

  let container =
    document.getElementById("toastContainer");

  if(!container){

    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);

  }

  const toast =
    document.createElement("div");

  toast.className =
    `toast toast-${type}`;

  toast.textContent = message;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("toast-visible");
  });

  setTimeout(() => {

    toast.classList.remove("toast-visible");

    toast.addEventListener(
      "transitionend",
      () => toast.remove(),
      { once: true }
    );

  }, 2400);

}

let states = getStates();

let currentPlan = null;

// FIX (persistencia): antes acá se chequeaba únicamente
// isOnboardingCompleted(), mientras que más abajo (bloque que
// decide si mostrar el wizard o el contenido de la app) se
// chequea isTutorialCompleted() || isOnboardingCompleted().
// Si por algún motivo quedaba tutorialCompleted=true sin
// onboardingCompleted=true, la app mostraba el contenido pero
// nunca cargaba el plan guardado (currentPlan quedaba null),
// dando la sensación de que "se perdieron los datos" aunque
// siguieran intactos en localStorage. Ahora ambos chequeos
// usan exactamente la misma fuente de verdad.
const appAlreadySetUp =
  isTutorialCompleted() ||
  isOnboardingCompleted();

if (appAlreadySetUp) {

  const selectedCareer =
    getSelectedCareer();

  if (
    selectedCareer &&
    AVAILABLE_PLANS[selectedCareer]
  ) {

    // Resuelve el plan de la carrera seleccionada aplicando,
    // si hace falta, la migración incremental de estructura
    // (nuevas materias/años) sin tocar states/schedules/eventos.
    currentPlan =
      resolvePlanForCareer(
        selectedCareer
      );

  }

}

function start(plan){

  currentPlan = plan;

  savePlan(plan);

  const career =
    AVAILABLE_PLANS[
      getSelectedCareer()
    ];

  if(career){
    savePlanVersion(
      career.version
    );
  }

  renderDashboard(
    plan,
    states
  );

  renderMaterias(
    plan,
    states
  );

}

if(currentPlan){

  start(currentPlan);

}

renderCalendar();

function populateCareerSelect(selectEl){

  if(!selectEl) return;

  selectEl.innerHTML = "";

  Object.values(
    AVAILABLE_PLANS
  ).forEach(plan => {

    const option =
      document.createElement("option");

    option.value = plan.id;

    option.textContent = plan.name;

    selectEl.appendChild(option);

  });

}

const onboarding =
 document.getElementById(
  "onboarding"
 );

const appContent =
 document.getElementById(
  "appContent"
 );

const tutorialAlreadyDone =
  isTutorialCompleted() ||
  isOnboardingCompleted();

if(
 onboarding &&
 tutorialAlreadyDone
){

 onboarding.style.display =
  "none";

 appContent.style.display =
  "block";

}else if(onboarding){

 appContent.style.display =
  "none";

 if(
  typeof initOnboardingWizard ===
  "function"
 ){

  initOnboardingWizard();

 }

}

document
 .getElementById("settingsBtn")
 ?.addEventListener(
  "click",
  () => {

   document
    .getElementById("settingsModal")
    ?.classList.remove("hidden");

   const profileNameInput =
    document.getElementById(
     "profileNameInput"
    );

   if(profileNameInput){

    profileNameInput.value =
     getProfile()?.name || "";

   }

  }
 );

// =========================================================
// EDITAR NOMBRE — Configuración
// =========================================================
//
// Guarda en el mismo almacenamiento existente (saveProfile,
// misma función que usa el onboarding) y refresca el dashboard
// para que el nombre se actualice automáticamente donde se
// muestre, sin recargar la página.
function saveProfileNameFromSettings(){

 const profileNameInput =
  document.getElementById(
   "profileNameInput"
  );

 const name =
  profileNameInput?.value.trim();

 if(!name){

  showToast(
   "Ingresá un nombre",
   "error"
  );

  return;

 }

 saveProfile({
  ...getProfile(),
  name
 });

 if(currentPlan){

  renderDashboard(
   currentPlan,
   states
  );

 }

 showToast("Nombre actualizado");

}

document
 .getElementById("saveProfileNameBtn")
 ?.addEventListener(
  "click",
  saveProfileNameFromSettings
 );

document
 .getElementById("profileNameInput")
 ?.addEventListener(
  "keydown",
  (event) => {

   if(event.key === "Enter"){

    event.preventDefault();

    saveProfileNameFromSettings();

   }

  }
 );

document
 .getElementById("restartTutorialBtn")
 ?.addEventListener(
  "click",
  () => {

   if(
    confirm(
     "¿Reiniciar el tutorial de bienvenida?"
    )
   ){

    resetTutorial();

    location.reload();

   }

  }
 );

// ================================
// PWA - Registrar Service Worker
// ================================
//
// Además de registrar el Service Worker, se detecta cuando
// hay una versión nueva instalada y esperando, y se muestra
// el banner "Hay una nueva versión disponible". Al confirmar,
// se activa esa versión y se recarga: como el Service Worker
// solo cachea archivos estáticos (nunca localStorage), y el
// plan ya migra su estructura de forma incremental al iniciar
// (ver migration.js), el usuario no pierde ningún dato.

function showUpdateBanner(registration){

  const banner =
    document.getElementById("updateBanner");

  if(!banner) return;

  banner.classList.remove("hidden");

  const updateBtn =
    document.getElementById("updateNowBtn");

  if(updateBtn){

    updateBtn.onclick = () => {

      updateBtn.disabled = true;

      if(registration.waiting){

        registration.waiting.postMessage({
          type: "SKIP_WAITING"
        });

      }

    };

  }

}

if ("serviceWorker" in navigator) {

  window.addEventListener("load", async () => {

    try {

      // FIX (actualización PWA): el Service Worker vive en la
      // raíz del proyecto ("sw.js", junto a index.html), no en
      // "js/sw/sw.js". Con la ruta vieja el registro fallaba
      // (o, en el mejor de los casos, el SW quedaba con un scope
      // que no incluía la página principal), por lo que el SW
      // nunca terminaba de controlar la app y el banner de
      // actualización jamás podía dispararse.
      const registration =
        await navigator.serviceWorker.register("./sw.js");

      console.log("✅ Service Worker registrado");

      // Ya había una versión nueva esperando desde antes
      // de que se cargara esta pestaña.
if(
  registration.waiting &&
  navigator.serviceWorker.controller
){

  showUpdateBanner(registration);

}

      // Se detecta una versión nueva mientras la app está
      // abierta (recién descargada por el navegador).
      registration.addEventListener(
        "updatefound",
        () => {

          const newWorker =
            registration.installing;

          if(!newWorker) return;

          newWorker.addEventListener(
            "statechange",
            () => {

              if(
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ){

                showUpdateBanner(registration);

              }

            }
          );

        }
      );

      // Cuando el Service Worker nuevo toma control (después
      // de presionar "Actualizar ahora"), se recarga una sola
      // vez para que la app quede en la última versión.
      let refrescando = false;

      navigator.serviceWorker.addEventListener(
        "controllerchange",
        () => {

          if(refrescando) return;

          refrescando = true;

          location.reload();

        }
      );

    } catch (error) {

      console.error(
        "❌ Error registrando Service Worker:",
        error
      );

    }

  });

}
