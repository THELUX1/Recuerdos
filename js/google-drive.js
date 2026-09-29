const GOOGLE_CLIENT_ID =
    "465014957251-fpunbmil8osnlep6o7dvfrqnmqjurmu4.apps.googleusercontent.com";

let googleAccessToken = null;

function iniciarGoogleDrive() {
    if (!window.google || !google.accounts) {
        console.error("Google Identity Services no está cargado.");
        return;
    }

    const client = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,

        scope: "https://www.googleapis.com/auth/drive.file",

        callback: (response) => {
            if (response.error) {
                console.error("Error de Google:", response);
                return;
            }

            googleAccessToken = response.access_token;

            console.log("✅ Google Drive autorizado correctamente");
            console.log("Access Token recibido:", googleAccessToken);
        }
    });

    client.requestAccessToken();
}

window.iniciarGoogleDrive = iniciarGoogleDrive;