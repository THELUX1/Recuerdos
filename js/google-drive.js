const GOOGLE_CLIENT_ID =
    "465014957251-fpunbmil8osnlep6o7dvfrqnmqjurmu4.apps.googleusercontent.com";

const GOOGLE_DRIVE_SCOPE =
    "https://www.googleapis.com/auth/drive.file";


let googleAccessToken = null;
let recuerdosFolderId = null;

let googleTokenClient = null;

let googleAuthPromise = null;


/* =========================================
   MOSTRAR ESTADO
========================================= */

function mostrarEstadoDrive(mensaje) {

    const elemento =
        document.getElementById("googleDriveStatus");

    if (!elemento) {
        return;
    }

    elemento.textContent = mensaje;
}


/* =========================================
   AUTORIZAR GOOGLE DRIVE
========================================= */

function iniciarGoogleDrive() {

    return new Promise((resolve, reject) => {

        if (
            !window.google ||
            !window.google.accounts ||
            !window.google.accounts.oauth2
        ) {

            const error =
                new Error(
                    "Google Identity Services no está disponible."
                );

            console.error(error);

            reject(error);

            return;
        }


        googleTokenClient =
            google.accounts.oauth2.initTokenClient({

                client_id:
                    GOOGLE_CLIENT_ID,

                scope:
                    GOOGLE_DRIVE_SCOPE,

                callback:
                    async (response) => {

                        if (response.error) {

                            console.error(
                                "Error de Google:",
                                response
                            );

                            googleAuthPromise = null;

                            reject(
                                new Error(
                                    "Google no autorizó el acceso."
                                )
                            );

                            return;
                        }


                        googleAccessToken =
                            response.access_token;


                        try {

                            await obtenerOCrearCarpeta();


                            mostrarEstadoDrive(
                                "✓ Google Drive conectado"
                            );


                            console.log(
                                "Google Drive conectado correctamente."
                            );


                            resolve(
                                googleAccessToken
                            );

                        } catch (error) {

                            googleAuthPromise = null;

                            reject(error);
                        }

                    }

            });


        googleTokenClient.requestAccessToken({
            prompt: ""
        });

    });

}


/* =========================================
   ASEGURAR AUTORIZACIÓN
========================================= */

async function asegurarGoogleDrive() {

    if (googleAccessToken) {

        return true;
    }


    if (googleAuthPromise) {

        await googleAuthPromise;

        return true;
    }


    googleAuthPromise =
        iniciarGoogleDrive();


    try {

        await googleAuthPromise;

        return true;

    } catch (error) {

        googleAuthPromise = null;

        console.error(
            "No se pudo conectar Google Drive:",
            error
        );

        return false;
    }

}


/* =========================================
   CARPETA
========================================= */

async function obtenerOCrearCarpeta() {

    if (!googleAccessToken) {

        throw new Error(
            "No hay autorización de Google Drive."
        );
    }


    const query =
        "name = 'Nuestra Historia'" +
        " and mimeType = 'application/vnd.google-apps.folder'" +
        " and trashed = false";


    const respuesta =
        await fetch(
            "https://www.googleapis.com/drive/v3/files?" +
            new URLSearchParams({

                q: query,

                spaces: "drive",

                fields: "files(id,name)"

            }),
            {
                headers: {

                    Authorization:
                        `Bearer ${googleAccessToken}`

                }
            }
        );


    if (!respuesta.ok) {

        const texto =
            await respuesta.text();

        throw new Error(
            "No se pudo buscar la carpeta: " +
            texto
        );
    }


    const resultado =
        await respuesta.json();


    if (
        resultado.files &&
        resultado.files.length > 0
    ) {

        recuerdosFolderId =
            resultado.files[0].id;


        return recuerdosFolderId;
    }


    /* CREAR CARPETA */

    const crear =
        await fetch(
            "https://www.googleapis.com/drive/v3/files",
            {
                method: "POST",

                headers: {

                    Authorization:
                        `Bearer ${googleAccessToken}`,

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    name:
                        "Nuestra Historia",

                    mimeType:
                        "application/vnd.google-apps.folder"

                })
            }
        );


    if (!crear.ok) {

        const texto =
            await crear.text();

        throw new Error(
            "No se pudo crear la carpeta: " +
            texto
        );
    }


    const carpeta =
        await crear.json();


    recuerdosFolderId =
        carpeta.id;


    return recuerdosFolderId;
}


/* =========================================
   SUBIR ARCHIVO
========================================= */

async function subirArchivoADrive(file) {

    if (!file) {

        throw new Error(
            "No se recibió ningún archivo."
        );
    }


    const autorizado =
        await asegurarGoogleDrive();


    if (!autorizado) {

        throw new Error(
            "Google Drive no está autorizado."
        );
    }


    if (!recuerdosFolderId) {

        await obtenerOCrearCarpeta();
    }


    const metadata = {

        name:
            file.name,

        parents:
            [recuerdosFolderId],

        mimeType:
            file.type ||
            "application/octet-stream"

    };


    const formData =
        new FormData();


    formData.append(

        "metadata",

        new Blob(
            [
                JSON.stringify(metadata)
            ],
            {
                type:
                    "application/json"
            }
        )

    );


    formData.append(
        "file",
        file
    );


    const respuesta =
        await fetch(

            "https://www.googleapis.com/upload/drive/v3/files?" +
            new URLSearchParams({

                uploadType:
                    "multipart",

                fields:
                    "id,name,mimeType,size"

            }),

            {

                method:
                    "POST",

                headers: {

                    Authorization:
                        `Bearer ${googleAccessToken}`

                },

                body:
                    formData

            }

        );


    if (!respuesta.ok) {

        const texto =
            await respuesta.text();

        throw new Error(
            "Error subiendo archivo a Google Drive: " +
            texto
        );
    }


    const archivo =
        await respuesta.json();


    console.log(
        "Archivo subido a Google Drive:",
        archivo
    );


    return archivo;
}


/* =========================================
   OBTENER ARCHIVO
========================================= */

async function obtenerArchivoDrive(fileId) {

    const autorizado =
        await asegurarGoogleDrive();


    if (!autorizado) {

        throw new Error(
            "Google Drive no está autorizado."
        );
    }


    const respuesta =
        await fetch(

            `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`,

            {

                headers: {

                    Authorization:
                        `Bearer ${googleAccessToken}`

                }

            }

        );


    if (!respuesta.ok) {

        const texto =
            await respuesta.text();

        throw new Error(
            "No se pudo obtener el archivo: " +
            texto
        );
    }


    return await respuesta.blob();
}


/* =========================================
   ELIMINAR ARCHIVO
========================================= */

async function eliminarArchivoDrive(fileId) {

    if (!fileId) {
        return;
    }


    const autorizado =
        await asegurarGoogleDrive();


    if (!autorizado) {

        throw new Error(
            "Google Drive no está autorizado."
        );
    }


    const respuesta =
        await fetch(

            `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`,

            {

                method:
                    "DELETE",

                headers: {

                    Authorization:
                        `Bearer ${googleAccessToken}`

                }

            }

        );


    if (!respuesta.ok) {

        const texto =
            await respuesta.text();

        throw new Error(
            "No se pudo eliminar el archivo: " +
            texto
        );
    }

}


/* =========================================
   EXPONER FUNCIONES
========================================= */

window.iniciarGoogleDrive =
    iniciarGoogleDrive;

window.asegurarGoogleDrive =
    asegurarGoogleDrive;

window.subirArchivoADrive =
    subirArchivoADrive;

window.obtenerArchivoDrive =
    obtenerArchivoDrive;

window.eliminarArchivoDrive =
    eliminarArchivoDrive;