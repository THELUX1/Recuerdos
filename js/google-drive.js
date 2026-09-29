const GOOGLE_CLIENT_ID =
    "465014957251-fpunbmil8osnlep6o7dvfrqnmqjurmu4.apps.googleusercontent.com";

const GOOGLE_DRIVE_SCOPE =
    "https://www.googleapis.com/auth/drive.file";

let googleAccessToken = null;
let recuerdosFolderId = null;


/* ================================
   AUTORIZAR GOOGLE DRIVE
================================ */

function iniciarGoogleDrive() {

    if (!window.google || !google.accounts) {
        console.error("Google Identity Services no está cargado.");
        return;
    }

    const client = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,

        scope: GOOGLE_DRIVE_SCOPE,

        callback: async (response) => {

            if (response.error) {
                console.error("Error de Google:", response);
                return;
            }

            googleAccessToken = response.access_token;

            console.log("✅ Google Drive autorizado");

            await obtenerOCrearCarpeta();
        }
    });

    client.requestAccessToken();
}


/* ================================
   BUSCAR / CREAR CARPETA
================================ */

async function obtenerOCrearCarpeta() {

    if (!googleAccessToken) {
        console.error("No hay token de Google.");
        return;
    }

    try {

        // Buscar carpeta existente
        const buscar = await fetch(
            "https://www.googleapis.com/drive/v3/files?" +
            new URLSearchParams({
                q: "name = 'Nuestra Historia' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
                spaces: "drive",
                fields: "files(id,name)"
            }),
            {
                headers: {
                    Authorization: `Bearer ${googleAccessToken}`
                }
            }
        );

        if (!buscar.ok) {
            throw new Error("No se pudo buscar la carpeta.");
        }

        const resultado = await buscar.json();

        if (resultado.files && resultado.files.length > 0) {

            recuerdosFolderId = resultado.files[0].id;

            console.log(
                "📁 Carpeta encontrada:",
                recuerdosFolderId
            );

            return;
        }


        // Crear carpeta
        const crear = await fetch(
            "https://www.googleapis.com/drive/v3/files",
            {
                method: "POST",

                headers: {
                    Authorization: `Bearer ${googleAccessToken}`,
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: "Nuestra Historia",
                    mimeType: "application/vnd.google-apps.folder"
                })
            }
        );

        if (!crear.ok) {
            throw new Error("No se pudo crear la carpeta.");
        }

        const carpeta = await crear.json();

        recuerdosFolderId = carpeta.id;

        console.log(
            "📁 Carpeta creada correctamente:",
            recuerdosFolderId
        );

    } catch (error) {

        console.error(
            "❌ Error con la carpeta de Google Drive:",
            error
        );
    }
}


/* ================================
   EXPORTAR
================================ */

window.iniciarGoogleDrive = iniciarGoogleDrive;