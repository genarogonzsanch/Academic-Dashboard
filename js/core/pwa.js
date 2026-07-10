// =========================================================
// PWA — INSTALACIÓN
// =========================================================
//
// Detecta automáticamente si el navegador ofrece instalar la
// app (evento "beforeinstallprompt") y muestra un botón dentro
// del modal de Configuración solo cuando corresponde.
//
// Si el navegador no soporta instalación (ej: Firefox desktop,
// iOS Safari sin el flujo nativo), el botón simplemente nunca
// aparece y el resto de la app sigue funcionando igual.
// =========================================================

let deferredInstallPrompt = null;

function isAppInstalled(){

  return (

    window.matchMedia(
      "(display-mode: standalone)"
    ).matches ||

    window.navigator.standalone === true

  );

}

function getInstallBtn(){
  return document.getElementById("installAppBtn");
}

function getInstallSuccessMsg(){
  return document.getElementById("installSuccessMsg");
}

// Si ya está instalada, el botón nunca se muestra.
if(isAppInstalled()){

  getInstallBtn()
    ?.classList.add("hidden");

}

window.addEventListener(
  "beforeinstallprompt",
  event => {

    // Evita el mini-infobar automático del navegador; en su
    // lugar se ofrece el botón propio dentro de Configuración.
    event.preventDefault();

    deferredInstallPrompt = event;

    if(!isAppInstalled()){

      getInstallBtn()
        ?.classList.remove("hidden");

    }

  }
);

document
  .getElementById("installAppBtn")
  ?.addEventListener(
    "click",
    async () => {

      const installBtn =
        getInstallBtn();

      if(!deferredInstallPrompt){
        return;
      }

      installBtn.disabled = true;

      deferredInstallPrompt.prompt();

      const { outcome } =
        await deferredInstallPrompt.userChoice;

      deferredInstallPrompt = null;

      installBtn.disabled = false;

      if(outcome === "accepted"){

        installBtn.classList.add(
          "hidden"
        );

      }

    }
  );

window.addEventListener(
  "appinstalled",
  () => {

    deferredInstallPrompt = null;

    getInstallBtn()
      ?.classList.add("hidden");

    const successMsg =
      getInstallSuccessMsg();

    if(successMsg){

      successMsg.classList.remove(
        "hidden"
      );

      setTimeout(() => {

        successMsg.classList.add(
          "hidden"
        );

      }, 4000);

    }

  }
);
