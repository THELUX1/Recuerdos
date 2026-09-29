/* =========================================
   ESTADO
========================================= */

let recuerdos = [];

let seccionActual = "momentos";

let archivoSeleccionado = null;


/* =========================================
   INICIO
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "recuerdos.js cargado correctamente"
        );


        configurarEventos();


        const {
            data: {
                session
            }
        } =
            await supabaseClient.auth.getSession();


        if (!session) {

            window.location.replace(
                "./index.html"
            );

            return;
        }


        const email =
            document.getElementById(
                "emailUsuario"
            );


        if (email) {

            email.textContent =
                session.user.email || "";
        }


        await cargarRecuerdos();

    }
);


/* =========================================
   EVENTOS
========================================= */

function configurarEventos() {

    /* MENU */

    const menuToggle =
        document.getElementById(
            "menuToggle"
        );

    const menuOverlay =
        document.getElementById(
            "menuOverlay"
        );


    if (menuToggle) {

        menuToggle.addEventListener(
            "click",
            alternarMenu
        );

    }


    if (menuOverlay) {

        menuOverlay.addEventListener(
            "click",
            cerrarMenu
        );

    }


    /* NUEVO RECUERDO */

    const addButton =
        document.getElementById(
            "addMemoryButton"
        );


    if (addButton) {

        addButton.addEventListener(
            "click",
            abrirModal
        );

    }


    /* CERRAR MODAL */

    const modalClose =
        document.getElementById(
            "modalClose"
        );


    if (modalClose) {

        modalClose.addEventListener(
            "click",
            cerrarModal
        );

    }


    /* CLICK FUERA DEL MODAL */

    const modal =
        document.getElementById(
            "modal"
        );


    if (modal) {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {

                    cerrarModal();

                }

            }
        );

    }


    /* FORM */

    const form =
        document.getElementById(
            "memoryForm"
        );


    if (form) {

        form.addEventListener(
            "submit",
            guardarRecuerdo
        );

    }


    /* ARCHIVO */

    const archivo =
        document.getElementById(
            "archivo"
        );


    if (archivo) {

        archivo.addEventListener(
            "change",
            manejarArchivo
        );

    }


    /* VIEWER */

    const viewer =
        document.getElementById(
            "viewer"
        );


    const viewerClose =
        document.getElementById(
            "viewerClose"
        );


    if (viewerClose) {

        viewerClose.addEventListener(
            "click",
            cerrarViewer
        );

    }


    if (viewer) {

        viewer.addEventListener(
            "click",
            event => {

                if (
                    event.target === viewer
                ) {

                    cerrarViewer();

                }

            }
        );

    }


    /* DRIVE */

    const driveButton =
        document.getElementById(
            "googleDriveButton"
        );


    if (driveButton) {

        driveButton.addEventListener(
            "click",
            conectarGoogleDrive
        );

    }


    /* LOGOUT */

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            cerrarSesion
        );

    }


    /* NAVEGACIÓN */

    document
        .querySelectorAll(".nav-item")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        cambiarSeccion(
                            button.dataset.section
                        );

                    }
                );

            }
        );


    /* ESC */

    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

                cerrarModal();

                cerrarViewer();

                cerrarMenu();

            }

        }
    );

}


/* =========================================
   MENÚ
========================================= */

function alternarMenu() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    const overlay =
        document.getElementById(
            "menuOverlay"
        );

    const toggle =
        document.getElementById(
            "menuToggle"
        );


    if (!sidebar) {
        return;
    }


    const abierto =
        sidebar.classList.contains(
            "open"
        );


    if (abierto) {

        cerrarMenu();

    } else {

        sidebar.classList.add(
            "open"
        );

        if (overlay) {

            overlay.classList.add(
                "active"
            );

        }

        if (toggle) {

            toggle.setAttribute(
                "aria-expanded",
                "true"
            );

        }

    }

}


function cerrarMenu() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    const overlay =
        document.getElementById(
            "menuOverlay"
        );

    const toggle =
        document.getElementById(
            "menuToggle"
        );


    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );

    }


    if (overlay) {

        overlay.classList.remove(
            "active"
        );

    }


    if (toggle) {

        toggle.setAttribute(
            "aria-expanded",
            "false"
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


    const {
        data,
        error
    } =
        await supabaseClient
            .from("memories")
            .select("*")
            .order(
                "date",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Error cargando recuerdos:",
            error
        );


        gallery.innerHTML = `
            <div class="empty">
                <div class="empty-icon">
                    ⚠
                </div>

                <h2>
                    No se pudieron cargar
                </h2>

                <p>
                    ${escapeHTML(error.message)}
                </p>
            </div>
        `;

        return;
    }


    recuerdos =
        data || [];


    await renderizarRecuerdos();

}


/* =========================================
   RENDER
========================================= */

async function renderizarRecuerdos() {

    const gallery =
        document.getElementById(
            "gallery"
        );


    if (!gallery) {
        return;
    }


    let lista =
        [...recuerdos];


    if (
        seccionActual ===
        "favoritos"
    ) {

        lista =
            lista.filter(
                recuerdo =>
                    recuerdo.is_favorite === true
            );

    }


    if (
        seccionActual ===
        "timeline"
    ) {

        lista.sort(
            (a, b) =>
                new Date(
                    a.date || 0
                ) -
                new Date(
                    b.date || 0
                )
        );

    }


    if (lista.length === 0) {

        let mensaje =
            "Todavía no hay recuerdos.";

        let icono = "♡";


        if (
            seccionActual ===
            "favoritos"
        ) {

            mensaje =
                "Todavía no tenés favoritos.";

            icono = "♡";

        }


        gallery.innerHTML = `

            <div class="empty">

                <div class="empty-icon">
                    ${icono}
                </div>

                <h2>
                    ${mensaje}
                </h2>

                <p>
                    Los momentos importantes
                    merecen un lugar.
                </p>

            </div>

        `;

        return;
    }


    gallery.innerHTML = "";


    for (
        const recuerdo of lista
    ) {

        const card =
            await crearTarjeta(
                recuerdo
            );


        gallery.appendChild(card);

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


    const media =
        document.createElement(
            "img"
        );


    media.className =
        "memory-media";


    media.alt =
        recuerdo.title ||
        "Recuerdo";


    media.loading =
        "lazy";


    /* URL */

    try {

        if (
            recuerdo.drive_file_id
        ) {

            const blob =
                await obtenerArchivoDrive(
                    recuerdo.drive_file_id
                );


            media.src =
                URL.createObjectURL(
                    blob
                );

        }

        else if (
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
                !error &&
                data
            ) {

                media.src =
                    data.signedUrl;

            }

        }

    } catch (error) {

        console.error(
            "No se pudo cargar la imagen:",
            error
        );

        media.src =
            crearImagenPlaceholder();

    }


    /* GRADIENT */

    const gradient =
        document.createElement(
            "div"
        );

    gradient.className =
        "memory-gradient";


    /* INFO */

    const info =
        document.createElement(
            "div"
        );

    info.className =
        "memory-info";


    const title =
        document.createElement(
            "h3"
        );


    title.textContent =
        recuerdo.title ||
        "Sin título";


    const description =
        document.createElement(
            "p"
        );


    description.textContent =
        recuerdo.description ||
        formatearFecha(
            recuerdo.date
        );


    info.appendChild(
        title
    );

    info.appendChild(
        description
    );


    /* FAVORITO */

    const favorite =
        document.createElement(
            "button"
        );


    favorite.type =
        "button";


    favorite.className =
        "favorite-button";


    favorite.innerHTML =
        recuerdo.is_favorite
            ? "♥"
            : "♡";


    if (
        recuerdo.is_favorite
    ) {

        favorite.classList.add(
            "active"
        );

    }


    favorite.addEventListener(
        "click",
        async event => {

            event.stopPropagation();

            await alternarFavorito(
                recuerdo,
                favorite
            );

        }
    );


    /* DELETE */

    const deleteButton =
        document.createElement(
            "button"
        );


    deleteButton.type =
        "button";


    deleteButton.className =
        "delete-button";


    deleteButton.textContent =
        "×";


    deleteButton.addEventListener(
        "click",
        async event => {

            event.stopPropagation();

            await eliminarRecuerdo(
                recuerdo
            );

        }
    );


    /* CLICK CARD */

    card.addEventListener(
        "click",
        () => {

            abrirViewer(
                recuerdo,
                media.src
            );

        }
    );


    card.appendChild(
        media
    );

    card.appendChild(
        gradient
    );

    card.appendChild(
        info
    );

    card.appendChild(
        favorite
    );

    card.appendChild(
        deleteButton
    );


    return card;
}


/* =========================================
   MODAL
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


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";


    const fecha =
        document.getElementById(
            "fecha"
        );


    if (
        fecha &&
        !fecha.value
    ) {

        fecha.value =
            new Date()
                .toISOString()
                .split("T")[0];

    }

}


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


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";


    archivoSeleccionado =
        null;


    const form =
        document.getElementById(
            "memoryForm"
        );


    if (form) {

        form.reset();

    }


    const fileName =
        document.getElementById(
            "fileName"
        );


    if (fileName) {

        fileName.textContent =
            "Elegí una foto";

    }

}


/* =========================================
   ARCHIVO
========================================= */

function manejarArchivo(
    event
) {

    const file =
        event.target.files[0];


    archivoSeleccionado =
        file || null;


    const fileName =
        document.getElementById(
            "fileName"
        );


    if (!fileName) {
        return;
    }


    if (file) {

        fileName.textContent =
            file.name;

    } else {

        fileName.textContent =
            "Elegí una foto";

    }

}


/* =========================================
   GUARDAR
========================================= */

async function guardarRecuerdo(
    event
) {

    event.preventDefault();


    const file =
        archivoSeleccionado;


    if (!file) {

        mostrarToast(
            "Elegí una imagen primero."
        );

        return;
    }


    if (
        file.size >
        20 * 1024 * 1024
    ) {

        mostrarToast(
            "La imagen supera los 20 MB."
        );

        return;
    }


    const saveButton =
        document.getElementById(
            "saveButton"
        );


    const saveText =
        document.getElementById(
            "saveButtonText"
        );


    saveButton.disabled =
        true;


    saveText.textContent =
        "Conectando con Drive...";


    try {

        /* DRIVE */

        const archivoDrive =
            await subirArchivoADrive(
                file
            );


        saveText.textContent =
            "Guardando recuerdo...";


        /* DATOS */

        const titulo =
            document
                .getElementById(
                    "titulo"
                )
                .value
                .trim();


        const descripcion =
            document
                .getElementById(
                    "descripcion"
                )
                .value
                .trim();


        const fecha =
            document
                .getElementById(
                    "fecha"
                )
                .value;


        /* USUARIO */

        const {
            data: {
                user
            }
        } =
            await supabaseClient.auth.getUser();


        if (!user) {

            throw new Error(
                "La sesión de usuario no está disponible."
            );

        }


        /* INSERT */

        const {
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
                        fecha ||
                        null,

                    media_type:
                        file.type.startsWith(
                            "video/"
                        )
                            ? "video"
                            : "image",

                    drive_file_id:
                        archivoDrive.id,

                    drive_file_name:
                        archivoDrive.name,

                    drive_mime_type:
                        archivoDrive.mimeType,

                    created_by:
                        user.id

                });


        if (error) {

            /*
             * Si Supabase falla después de subir
             * el archivo, eliminamos el archivo
             * de Drive para no dejar basura.
             */

            try {

                await eliminarArchivoDrive(
                    archivoDrive.id
                );

            } catch (cleanupError) {

                console.error(
                    cleanupError
                );

            }


            throw error;
        }


        mostrarToast(
            "Recuerdo guardado ❤️"
        );


        cerrarModal();


        await cargarRecuerdos();


    } catch (error) {

        console.error(
            "Error guardando recuerdo:",
            error
        );


        mostrarToast(
            error.message ||
            "No se pudo guardar el recuerdo."
        );


    } finally {

        saveButton.disabled =
            false;


        saveText.textContent =
            "Guardar recuerdo";

    }

}


/* =========================================
   FAVORITOS
========================================= */

async function alternarFavorito(
    recuerdo,
    button
) {

    const nuevoValor =
        !recuerdo.is_favorite;


    const {
        error
    } =
        await supabaseClient
            .from("memories")
            .update({

                is_favorite:
                    nuevoValor

            })
            .eq(
                "id",
                recuerdo.id
            );


    if (error) {

        console.error(
            error
        );


        mostrarToast(
            "No se pudo actualizar el favorito."
        );

        return;
    }


    recuerdo.is_favorite =
        nuevoValor;


    button.innerHTML =
        nuevoValor
            ? "♥"
            : "♡";


    button.classList.toggle(
        "active",
        nuevoValor
    );


    if (
        seccionActual ===
        "favoritos"
    ) {

        await renderizarRecuerdos();

    }

}


/* =========================================
   ELIMINAR
========================================= */

async function eliminarRecuerdo(
    recuerdo
) {

    const confirmar =
        window.confirm(
            "¿Querés eliminar este recuerdo?"
        );


    if (!confirmar) {
        return;
    }


    try {

        if (
            recuerdo.drive_file_id
        ) {

            await eliminarArchivoDrive(
                recuerdo.drive_file_id
            );

        }


        const {
            error
        } =
            await supabaseClient
                .from("memories")
                .delete()
                .eq(
                    "id",
                    recuerdo.id
                );


        if (error) {

            throw error;
        }


        mostrarToast(
            "Recuerdo eliminado."
        );


        await cargarRecuerdos();


    } catch (error) {

        console.error(
            error
        );


        mostrarToast(
            "No se pudo eliminar."
        );

    }

}


/* =========================================
   VIEWER
========================================= */

function abrirViewer(
    recuerdo,
    imageSrc
) {

    const viewer =
        document.getElementById(
            "viewer"
        );


    const image =
        document.getElementById(
            "viewerImage"
        );


    const title =
        document.getElementById(
            "viewerTitle"
        );


    const description =
        document.getElementById(
            "viewerDescription"
        );


    const date =
        document.getElementById(
            "viewerDate"
        );


    if (!viewer || !image) {
        return;
    }


    image.src =
        imageSrc;


    if (title) {

        title.textContent =
            recuerdo.title ||
            "Sin título";

    }


    if (description) {

        description.textContent =
            recuerdo.description ||
            "";

    }


    if (date) {

        date.textContent =
            formatearFecha(
                recuerdo.date
            );

    }


    viewer.classList.add(
        "active"
    );


    viewer.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


function cerrarViewer() {

    const viewer =
        document.getElementById(
            "viewer"
        );


    const image =
        document.getElementById(
            "viewerImage"
        );


    if (!viewer) {
        return;
    }


    viewer.classList.remove(
        "active"
    );


    viewer.setAttribute(
        "aria-hidden",
        "true"
    );


    if (image) {

        image.src = "";

    }


    document.body.style.overflow =
        "";

}


/* =========================================
   SECCIONES
========================================= */

async function cambiarSeccion(
    seccion
) {

    seccionActual =
        seccion;


    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.section ===
                    seccion
                );

            }
        );


    const title =
        document.getElementById(
            "sectionTitle"
        );


    const description =
        document.getElementById(
            "sectionDescription"
        );


    if (seccion === "momentos") {

        title.textContent =
            "Momentos";

        description.textContent =
            "Un pequeño lugar para guardar todo lo que no queremos olvidar.";

    }


    if (seccion === "favoritos") {

        title.textContent =
            "Favoritos";

        description.textContent =
            "Los recuerdos que tienen un lugar especial.";

    }


    if (seccion === "timeline") {

        title.textContent =
            "Línea de tiempo";

        description.textContent =
            "Nuestra historia, momento a momento.";

    }


    cerrarMenu();


    await renderizarRecuerdos();

}


/* =========================================
   GOOGLE DRIVE
========================================= */

async function conectarGoogleDrive() {

    const button =
        document.getElementById(
            "googleDriveButton"
        );


    mostrarEstadoDrive(
        "Conectando..."
    );


    if (button) {

        button.disabled =
            true;

    }


    try {

        const conectado =
            await asegurarGoogleDrive();


        if (!conectado) {

            throw new Error(
                "No se pudo conectar Google Drive."
            );

        }


        mostrarEstadoDrive(
            "✓ Conectado"
        );


        mostrarToast(
            "Google Drive conectado ☁️"
        );


    } catch (error) {

        console.error(
            error
        );


        mostrarEstadoDrive(
            "Conectar almacenamiento"
        );


        mostrarToast(
            error.message ||
            "No se pudo conectar Google Drive."
        );


    } finally {

        if (button) {

            button.disabled =
                false;

        }

    }

}


/* =========================================
   LOGOUT
========================================= */

async function cerrarSesion() {

    const {
        error
    } =
        await supabaseClient.auth.signOut();


    if (error) {

        console.error(
            error
        );

        mostrarToast(
            "No se pudo cerrar la sesión."
        );

        return;
    }


    window.location.replace(
        "./index.html"
    );

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
        mostrarToast.timeout
    );


    mostrarToast.timeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

}


/* =========================================
   FECHA
========================================= */

function formatearFecha(
    fecha
) {

    if (!fecha) {

        return "";
    }


    const date =
        new Date(
            fecha +
            "T12:00:00"
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return fecha;
    }


    return date.toLocaleDateString(
        "es-AR",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


/* =========================================
   PLACEHOLDER
========================================= */

function crearImagenPlaceholder() {

    const svg = `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="600"
            height="600"
            viewBox="0 0 600 600"
        >
            <rect
                width="600"
                height="600"
                fill="#18181c"
            />

            <text
                x="300"
                y="300"
                text-anchor="middle"
                dominant-baseline="middle"
                fill="#777"
                font-size="70"
            >
                ♡
            </text>
        </svg>
    `;


    return (
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(svg)
    );

}


/* =========================================
   SEGURIDAD HTML
========================================= */

function escapeHTML(
    texto
) {

    return String(texto)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}