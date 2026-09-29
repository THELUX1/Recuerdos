/* =========================================
   NUESTRA HISTORIA
   recuerdos.js
   Supabase + Google Drive
========================================= */
alert("recuerdos.js cargó correctamente");
let recuerdos = [];
let googleDrivePreparado = false;


/* =========================================
   INICIO
========================================= */

document.addEventListener("DOMContentLoaded", async () => {

    console.log("📖 Nuestra Historia iniciando...");

    try {

        const {
            data,
            error
        } = await supabaseClient.auth.getSession();

        if (error) {
            console.error(
                "Error obteniendo sesión:",
                error
            );
            return;
        }

        if (!data.session) {

            window.location.replace(
                "./index.html"
            );

            return;
        }

        console.log(
            "✅ Sesión de Supabase activa"
        );


        /* Mostrar email */

        const emailUsuario =
            document.getElementById(
                "emailUsuario"
            );

        if (emailUsuario) {

            emailUsuario.textContent =
                data.session.user.email;
        }


        /* Cargar recuerdos */

        await cargarRecuerdos();


    } catch (error) {

        console.error(
            "❌ Error iniciando aplicación:",
            error
        );
    }
});


/* =========================================
   MENÚ
========================================= */

function alternarMenu() {

    const sidebar =
        document.querySelector(".sidebar");

    const overlay =
        document.getElementById("menuOverlay");

    const boton =
        document.getElementById("menuToggle");

    if (!sidebar) {
        console.error("No se encontró .sidebar");
        return;
    }

    const abierto =
        sidebar.classList.contains("open") ||
        sidebar.classList.contains("active");

    if (abierto) {

        sidebar.classList.remove("open");
        sidebar.classList.remove("active");

        if (overlay) {
            overlay.classList.remove("open");
            overlay.classList.remove("active");
        }

        if (boton) {
            boton.setAttribute(
                "aria-expanded",
                "false"
            );
        }

    } else {

        sidebar.classList.add("open");

        if (overlay) {
            overlay.classList.add("open");
        }

        if (boton) {
            boton.setAttribute(
                "aria-expanded",
                "true"
            );
        }
    }
}


function cerrarMenu() {

    const sidebar =
        document.querySelector(".sidebar");

    const overlay =
        document.getElementById("menuOverlay");

    const boton =
        document.getElementById("menuToggle");


    if (sidebar) {
        sidebar.classList.remove("open");
        sidebar.classList.remove("active");
    }

    if (overlay) {
        overlay.classList.remove("open");
        overlay.classList.remove("active");
    }

    if (boton) {
        boton.setAttribute(
            "aria-expanded",
            "false"
        );
    }
}


/* =========================================
   CERRAR SESIÓN
========================================= */

async function cerrarSesion() {

    try {

        await supabaseClient.auth.signOut();

        window.location.replace(
            "./index.html"
        );

    } catch (error) {

        console.error(
            "Error cerrando sesión:",
            error
        );
    }
}


/* =========================================
   CARGAR RECUERDOS
========================================= */

async function cargarRecuerdos() {

    const gallery =
        document.getElementById(
            "gallery"
        );


    if (!gallery) {
        return;
    }


    gallery.innerHTML = `
        <div class="loading">
            Cargando recuerdos...
        </div>
    `;


    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("memories")
            .select("*")
            .order(
                "date",
                {
                    ascending: false
                }
            );


        if (error) {
            throw error;
        }


        recuerdos =
            data || [];


        console.log(
            "📚 Recuerdos encontrados:",
            recuerdos.length
        );


        if (!recuerdos.length) {

            gallery.innerHTML = `
                <div class="loading">
                    Todavía no hay recuerdos ❤️
                </div>
            `;

            return;
        }


        gallery.innerHTML = "";


        /*
         * Por ahora renderizamos uno por uno.
         * Más adelante vamos a optimizar la carga
         * para que Drive no tenga que descargar
         * todos los archivos al mismo tiempo.
         */

        for (const recuerdo of recuerdos) {

            const tarjeta =
                await crearTarjeta(
                    recuerdo
                );

            gallery.appendChild(
                tarjeta
            );
        }


    } catch (error) {

        console.error(
            "❌ Error cargando recuerdos:",
            error
        );


        gallery.innerHTML = `
            <div class="loading">
                No se pudieron cargar los recuerdos.
            </div>
        `;
    }
}


/* =========================================
   CREAR TARJETA
========================================= */

async function crearTarjeta(
    recuerdo
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "memory-card";


    /*
     * Al hacer clic abrimos el visor.
     */

    card.addEventListener(
        "click",
        () => {

            abrirViewer(
                recuerdo
            );
        }
    );


    /* -----------------------------------------
       MEDIA
    ----------------------------------------- */

    const media =
        document.createElement(
            "div"
        );

    media.className =
        "memory-media";


    if (recuerdo.drive_file_id) {

        try {

            await asegurarDrive();


            if (!googleAccessToken) {

                throw new Error(
                    "Google Drive no está autorizado."
                );
            }


            const blob =
                await obtenerArchivoDrive(
                    recuerdo.drive_file_id
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            if (
                recuerdo.media_type ===
                "video"
            ) {

                const video =
                    document.createElement(
                        "video"
                    );

                video.src = url;

                video.muted = true;

                video.playsInline = true;

                video.preload = "metadata";

                media.appendChild(
                    video
                );

            } else {

                const img =
                    document.createElement(
                        "img"
                    );

                img.src = url;

                img.alt =
                    recuerdo.title ||
                    "Recuerdo";


                media.appendChild(
                    img
                );
            }


        } catch (error) {

            console.error(
                "❌ Error cargando desde Drive:",
                error
            );


            media.innerHTML = `
                <div class="media-error">
                    ♡
                </div>
            `;
        }


    } else if (
        recuerdo.storage_path
    ) {

        /*
         * Compatibilidad con los recuerdos
         * antiguos de Supabase Storage.
         */

        try {

            const {
                data,
                error
            } = await supabaseClient
                .storage
                .from("Recuerdos")
                .createSignedUrl(
                    recuerdo.storage_path,
                    3600
                );


            if (
                !error &&
                data?.signedUrl
            ) {

                const img =
                    document.createElement(
                        "img"
                    );

                img.src =
                    data.signedUrl;

                img.alt =
                    recuerdo.title ||
                    "Recuerdo";


                media.appendChild(
                    img
                );
            }


        } catch (error) {

            console.error(
                "Error cargando Storage:",
                error
            );
        }
    }


    /* -----------------------------------------
       INFORMACIÓN
    ----------------------------------------- */

    const info =
        document.createElement(
            "div"
        );

    info.className =
        "memory-info";


    const fecha =
        document.createElement(
            "span"
        );

    fecha.className =
        "memory-date";

    fecha.textContent =
        formatearFecha(
            recuerdo.date
        );


    const titulo =
        document.createElement(
            "h3"
        );

    titulo.textContent =
        recuerdo.title ||
        "Sin título";


    const descripcion =
        document.createElement(
            "p"
        );

    descripcion.textContent =
        recuerdo.description ||
        "";


    info.appendChild(
        fecha
    );

    info.appendChild(
        titulo
    );


    if (recuerdo.description) {

        info.appendChild(
            descripcion
        );
    }


    card.appendChild(
        media
    );

    card.appendChild(
        info
    );


    return card;
}


/* =========================================
   PREPARAR GOOGLE DRIVE
========================================= */

async function asegurarDrive() {

    if (googleAccessToken) {

        googleDrivePreparado =
            true;

        return true;
    }


    /*
     * IMPORTANTE:
     * No mostramos el selector de Google
     * automáticamente al cargar la página.
     *
     * Primero intentamos conseguir el token
     * sin mostrar una ventana innecesaria.
     */

    return new Promise(resolve => {

        if (
            typeof google ===
            "undefined" ||
            !google.accounts
        ) {

            console.error(
                "Google Identity Services no está disponible."
            );

            resolve(false);

            return;
        }


        const client =
            google.accounts.oauth2
                .initTokenClient({

                    client_id:
                        GOOGLE_CLIENT_ID,

                    scope:
                        GOOGLE_DRIVE_SCOPE,

                    callback:
                        async response => {

                            if (
                                response.error
                            ) {

                                console.error(
                                    "Google Drive:",
                                    response
                                );

                                resolve(false);

                                return;
                            }


                            googleAccessToken =
                                response.access_token;


                            googleDrivePreparado =
                                true;


                            console.log(
                                "✅ Google Drive autorizado"
                            );


                            try {

                                await obtenerOCrearCarpeta();

                            } catch (error) {

                                console.error(
                                    "Error preparando carpeta:",
                                    error
                                );
                            }


                            resolve(true);
                        }
                });


        client.requestAccessToken({
            prompt: ""
        });
    });
}


/* =========================================
   ABRIR MODAL
========================================= */

function abrirModal() {

    const modal =
        document.getElementById(
            "modal"
        );


    if (!modal) {
        return;
    }


    modal.classList.add(
        "active"
    );
}


/* =========================================
   CERRAR MODAL
========================================= */

function cerrarModal() {

    const modal =
        document.getElementById(
            "modal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "active"
    );
}


/* =========================================
   CERRAR MODAL AL TOCAR FONDO
========================================= */

function cerrarModalFondo(
    event
) {

    if (
        event.target.id ===
        "modal"
    ) {

        cerrarModal();
    }
}


/* =========================================
   GUARDAR RECUERDO
========================================= */

async function guardarRecuerdo(
    event
) {

    if (event) {

        event.preventDefault();
    }


    const archivoInput =
        document.getElementById(
            "archivo"
        );

    const tituloInput =
        document.getElementById(
            "titulo"
        );

    const descripcionInput =
        document.getElementById(
            "descripcion"
        );

    const fechaInput =
        document.getElementById(
            "fecha"
        );

    const saveButton =
        document.getElementById(
            "saveButton"
        );


    if (
        !archivoInput ||
        !archivoInput.files.length
    ) {

        mostrarToast(
            "Elegí una foto primero."
        );

        return;
    }


    const archivo =
        archivoInput.files[0];


    const titulo =
        tituloInput.value.trim();


    const descripcion =
        descripcionInput.value.trim();


    const fecha =
        fechaInput.value ||
        new Date()
            .toISOString()
            .split("T")[0];


    try {

        /* -----------------------------------------
           DESACTIVAR BOTÓN
        ----------------------------------------- */

        if (saveButton) {

            saveButton.disabled =
                true;

            saveButton.innerHTML =
                "Subiendo... <span>☁️</span>";
        }


        mostrarToast(
            "Conectando con Google Drive..."
        );


        /* -----------------------------------------
           AUTORIZAR DRIVE
        ----------------------------------------- */

        const autorizado =
            await asegurarDrive();


        if (!autorizado) {

            throw new Error(
                "No se pudo autorizar Google Drive."
            );
        }


        /* -----------------------------------------
           SUBIR A DRIVE
        ----------------------------------------- */

        mostrarToast(
            "Guardando foto en Google Drive..."
        );


        const archivoDrive =
            await subirArchivoADrive(
                archivo
            );


        console.log(
            "☁️ Archivo guardado:",
            archivoDrive
        );


        /* -----------------------------------------
           SESIÓN SUPABASE
        ----------------------------------------- */

        const {
            data: sessionData,
            error: sessionError
        } =
            await supabaseClient.auth.getSession();


        if (
            sessionError ||
            !sessionData.session
        ) {

            throw new Error(
                "La sesión de Supabase no está disponible."
            );
        }


        const usuario =
            sessionData.session.user;


        /* -----------------------------------------
           GUARDAR EN MEMORIES
        ----------------------------------------- */

        mostrarToast(
            "Registrando recuerdo..."
        );


        const {
            data,
            error
        } =
            await supabaseClient
                .from("memories")
                .insert({

                    title:
                        titulo ||
                        "Sin título",

                    description:
                        descripcion,

                    date:
                        fecha,

                    media_type:
                        archivo.type.startsWith(
                            "video/"
                        )
                            ? "video"
                            : "image",

                    storage_path:
                        null,

                    created_by:
                        usuario.id,

                    drive_file_id:
                        archivoDrive.id,

                    drive_file_name:
                        archivoDrive.name,

                    drive_mime_type:
                        archivoDrive.mimeType,

                    is_favorite:
                        false
                })
                .select()
                .single();


        if (error) {

            /*
             * Supabase falló.
             * Intentamos eliminar el archivo
             * recién subido a Drive.
             */

            try {

                await eliminarArchivoDrive(
                    archivoDrive.id
                );

            } catch (driveError) {

                console.error(
                    "No se pudo eliminar archivo de Drive:",
                    driveError
                );
            }


            throw error;
        }


        console.log(
            "✅ Recuerdo creado:",
            data
        );


        /* -----------------------------------------
           LIMPIAR
        ----------------------------------------- */

        document
            .getElementById(
                "memoryForm"
            )
            .reset();


        cerrarModal();


        mostrarToast(
            "♡ Recuerdo guardado"
        );


        /* -----------------------------------------
           RECARGAR GALERÍA
        ----------------------------------------- */

        await cargarRecuerdos();


    } catch (error) {

        console.error(
            "❌ Error guardando recuerdo:",
            error
        );


        mostrarToast(
            "No se pudo guardar el recuerdo."
        );


    } finally {

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.innerHTML =
                `
                Guardar recuerdo
                <span>♡</span>
                `;
        }
    }
}


/* =========================================
   VISOR
========================================= */

async function abrirViewer(
    recuerdo
) {

    const viewer =
        document.getElementById(
            "viewer"
        );

    const image =
        document.getElementById(
            "viewerImage"
        );


    if (!viewer || !image) {
        return;
    }


    viewer.classList.add(
        "active"
    );


    image.style.display =
        "none";


    image.src =
        "";


    try {

        if (
            recuerdo.drive_file_id
        ) {

            await asegurarDrive();


            const blob =
                await obtenerArchivoDrive(
                    recuerdo.drive_file_id
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            image.src =
                url;


            image.style.display =
                "block";


        } else if (
            recuerdo.storage_path
        ) {

            const {
                data,
                error
            } =
                await supabaseClient
                    .storage
                    .from("Recuerdos")
                    .createSignedUrl(
                        recuerdo.storage_path,
                        3600
                    );


            if (
                error ||
                !data?.signedUrl
            ) {

                throw new Error(
                    "No se pudo obtener la imagen."
                );
            }


            image.src =
                data.signedUrl;


            image.style.display =
                "block";
        }


    } catch (error) {

        console.error(
            "Error abriendo recuerdo:",
            error
        );


        cerrarViewer();


        mostrarToast(
            "No se pudo abrir el recuerdo."
        );
    }
}


/* =========================================
   CERRAR VISOR
========================================= */

function cerrarViewer() {

    const viewer =
        document.getElementById(
            "viewer"
        );


    const image =
        document.getElementById(
            "viewerImage"
        );


    if (viewer) {

        viewer.classList.remove(
            "active"
        );
    }


    if (image) {

        image.src =
            "";
    }
}


/* =========================================
   CERRAR VISOR AL TOCAR FONDO
========================================= */

function cerrarViewerFondo(
    event
) {

    if (
        event.target.id ===
        "viewer"
    ) {

        cerrarViewer();
    }
}


/* =========================================
   FORMATO FECHA
========================================= */

function formatearFecha(
    fecha
) {

    if (!fecha) {
        return "";
    }


    try {

        const fechaObj =
            new Date(
                fecha +
                "T00:00:00"
            );


        return fechaObj.toLocaleDateString(
            "es-AR",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

    } catch {

        return fecha;
    }
}


/* =========================================
   TOAST
========================================= */

function mostrarToast(
    mensaje
) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {
        return;
    }


    toast.textContent =
        mensaje;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toast._timeout
    );


    toast._timeout =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 3000);
}


/* =========================================
   NAVEGACIÓN
========================================= */

document.addEventListener(
    "click",
    event => {

        const navItem =
            event.target.closest(
                ".nav-item"
            );


        if (!navItem) {
            return;
        }


        document
            .querySelectorAll(
                ".nav-item"
            )
            .forEach(item => {

                item.classList.remove(
                    "active"
                );
            });


        navItem.classList.add(
            "active"
        );


        const section =
            navItem.dataset.section;


        console.log(
            "Sección seleccionada:",
            section
        );
    }
);