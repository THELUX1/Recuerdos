let usuarioActual = null;

let toastTimeout = null;


/* =========================================
   SESIÓN
========================================= */

async function comprobarSesion() {

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

            window.location.replace(
                "./index.html"
            );

            return;

        }


        if (
            !data ||
            !data.session
        ) {

            window.location.replace(
                "./index.html"
            );

            return;

        }


        usuarioActual =
            data.session.user;


        const email =
            document.getElementById(
                "emailUsuario"
            );


        if (email) {

            email.textContent =
                usuarioActual.email || "";

        }


        await cargarRecuerdos();


    } catch (error) {

        console.error(
            "Error comprobando sesión:",
            error
        );

        window.location.replace(
            "./index.html"
        );

    }

}


/* =========================================
   MENÚ
========================================= */

function alternarMenu() {

    const abierto =
        document.body.classList.contains(
            "menu-open"
        );


    if (abierto) {

        cerrarMenu();

    } else {

        abrirMenu();

    }

}


function abrirMenu() {

    document.body.classList.add(
        "menu-open"
    );


    const boton =
        document.getElementById(
            "menuToggle"
        );


    if (boton) {

        boton.setAttribute(
            "aria-expanded",
            "true"
        );

        boton.setAttribute(
            "aria-label",
            "Cerrar menú"
        );

    }

}


function cerrarMenu() {

    document.body.classList.remove(
        "menu-open"
    );


    const boton =
        document.getElementById(
            "menuToggle"
        );


    if (boton) {

        boton.setAttribute(
            "aria-expanded",
            "false"
        );

        boton.setAttribute(
            "aria-label",
            "Abrir menú"
        );

    }

}


/* =========================================
   CERRAR SESIÓN
========================================= */

async function cerrarSesion() {

    const boton =
        document.getElementById(
            "logoutButton"
        );


    if (boton) {

        boton.disabled = true;

        boton.innerHTML =
            `
                <span>↪</span>
                <span>
                    Cerrando sesión...
                </span>
            `;

    }


    try {

        const {
            error
        } =
            await supabaseClient.auth.signOut();


        if (error) {

            console.error(
                "Error cerrando sesión:",
                error
            );

        }


        window.location.replace(
            "./index.html"
        );


    } catch (error) {

        console.error(
            "Error inesperado:",
            error
        );


        window.location.replace(
            "./index.html"
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
            data: recuerdos,
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

            throw error;

        }


        if (
            !recuerdos ||
            recuerdos.length === 0
        ) {

            gallery.innerHTML = `

                <div class="empty">

                    <div
                        style="
                            font-size:42px;
                            margin-bottom:15px;
                            opacity:.5;
                        "
                    >
                        ♡
                    </div>

                    <div>
                        Todavía no hay recuerdos.
                    </div>

                    <small
                        style="
                            margin-top:7px;
                            color:#55555e;
                        "
                    >
                        Guardá el primero.
                    </small>

                </div>

            `;

            return;

        }


        gallery.innerHTML = "";


        for (
            const recuerdo
            of recuerdos
        ) {

            const {
                data: signedData,
                error: signedError
            } =
                await supabaseClient
                    .storage
                    .from("Recuerdos")
                    .createSignedUrl(
                        recuerdo.storage_path,
                        3600
                    );


            if (signedError) {

                console.error(
                    "Error creando URL:",
                    signedError
                );

                continue;

            }


            crearTarjeta(
                recuerdo,
                signedData.signedUrl,
                gallery
            );

        }


    } catch (error) {

        console.error(
            "Error cargando recuerdos:",
            error
        );


        gallery.innerHTML = `

            <div class="empty">

                <div
                    style="
                        font-size:40px;
                        margin-bottom:15px;
                    "
                >
                    ⚠
                </div>

                <div>
                    No se pudieron cargar
                    los recuerdos.
                </div>

            </div>

        `;

    }

}


/* =========================================
   CREAR TARJETA
========================================= */

function crearTarjeta(
    recuerdo,
    url,
    gallery
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "card";


    const titulo =
        escaparHTML(
            recuerdo.title ||
            "Sin título"
        );


    const descripcion =
        escaparHTML(
            recuerdo.description ||
            ""
        );


    const fecha =
        recuerdo.date
            ? formatearFecha(
                recuerdo.date
            )
            : "";


    card.innerHTML = `

        <img
            class="card-image"
            src="${url}"
            alt="${titulo}"
            loading="lazy"
        >

        <div class="card-info">

            <div class="card-title">
                ${titulo}
            </div>

            ${
                descripcion
                    ? `
                        <div class="card-description">
                            ${descripcion}
                        </div>
                    `
                    : ""
            }

            ${
                fecha
                    ? `
                        <div class="card-date">
                            ${fecha}
                        </div>
                    `
                    : ""
            }

        </div>

    `;


    const imagen =
        card.querySelector(
            ".card-image"
        );


    imagen.addEventListener(
        "click",
        function () {

            abrirViewer(url);

        }
    );


    gallery.appendChild(
        card
    );

}


/* =========================================
   GUARDAR RECUERDO
========================================= */

async function guardarRecuerdo(
    event
) {

    event.preventDefault();


    if (!usuarioActual) {

        mostrarToast(
            "No hay una sesión activa."
        );

        return;

    }


    const archivo =
        document.getElementById(
            "archivo"
        ).files[0];


    const titulo =
        document.getElementById(
            "titulo"
        ).value.trim();


    const descripcion =
        document.getElementById(
            "descripcion"
        ).value.trim();


    const fecha =
        document.getElementById(
            "fecha"
        ).value;


    if (!archivo) {

        mostrarToast(
            "Seleccioná una imagen."
        );

        return;

    }


    /* VALIDAR IMAGEN */

    if (
        !archivo.type.startsWith(
            "image/"
        )
    ) {

        mostrarToast(
            "El archivo debe ser una imagen."
        );

        return;

    }


    /* MÁXIMO 20 MB */

    const maxSize =
        20 * 1024 * 1024;


    if (
        archivo.size >
        maxSize
    ) {

        mostrarToast(
            "La imagen no puede superar los 20 MB."
        );

        return;

    }


    const boton =
        document.getElementById(
            "saveButton"
        );


    boton.disabled = true;

    boton.innerHTML =
        "Subiendo imagen...";


    try {

        /* EXTENSIÓN */

        const extension =
            archivo.name
                .split(".")
                .pop()
                .toLowerCase();


        /* NOMBRE ÚNICO */

        const nombreUnico =
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2,10) +
            "." +
            extension;


        /* RUTA */

        const rutaArchivo =
            "fotos/" +
            usuarioActual.id +
            "/" +
            nombreUnico;


        console.log(
            "Subiendo:",
            rutaArchivo
        );


        /* =================================
           STORAGE
        ================================= */

        const {
            error: uploadError
        } =
            await supabaseClient
                .storage
                .from("Recuerdos")
                .upload(
                    rutaArchivo,
                    archivo,
                    {
                        cacheControl:
                            "3600",

                        upsert:
                            false,

                        contentType:
                            archivo.type
                    }
                );


        if (uploadError) {

            console.error(
                "Error subiendo imagen:",
                uploadError
            );


            alert(
                "ERROR DE SUPABASE\n\n" +
                "Mensaje: " +
                (
                    uploadError.message ||
                    "desconocido"
                ) +
                "\n\nCódigo: " +
                (
                    uploadError.statusCode ||
                    "sin código"
                )
            );


            throw uploadError;

        }


        boton.innerHTML =
            "Guardando recuerdo...";


        /* =================================
           DATABASE
        ================================= */

        const {
            error: dbError
        } =
            await supabaseClient
                .from("memories")
                .insert({

                    title:
                        titulo ||
                        "Sin título",

                    description:
                        descripcion ||
                        "",

                    date:
                        fecha ||
                        new Date()
                            .toISOString()
                            .split("T")[0],

                    media_type:
                        "photo",

                    storage_path:
                        rutaArchivo,

                    created_by:
                        usuarioActual.id

                });


        if (dbError) {

            console.error(
                "Error guardando metadata:",
                dbError
            );


            /* BORRAR FOTO SI FALLA DATABASE */

            await supabaseClient
                .storage
                .from("Recuerdos")
                .remove([
                    rutaArchivo
                ]);


            throw dbError;

        }


        /* LIMPIAR FORMULARIO */

        const form =
            document.getElementById(
                "memoryForm"
            );


        if (form) {

            form.reset();

        }


        cerrarModal();


        mostrarToast(
            "Recuerdo guardado ❤️"
        );


        await cargarRecuerdos();


    } catch (error) {

        console.error(
            "Error completo:",
            error
        );


        if (
            error &&
            error.message &&
            !error.message.includes(
                "Bucket not found"
            )
        ) {

            mostrarToast(
                "No se pudo guardar el recuerdo."
            );

        }

    } finally {

        boton.disabled = false;

        boton.innerHTML =
            `
                Guardar recuerdo
                <span>♡</span>
            `;

    }

}


/* =========================================
   MODAL
========================================= */

function abrirModal() {

    const modal =
        document.getElementById(
            "modal"
        );


    if (modal) {

        modal.classList.add(
            "show"
        );

    }

}


function cerrarModal() {

    const modal =
        document.getElementById(
            "modal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}


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
   VISOR
========================================= */

function abrirViewer(
    url
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


    image.src =
        url;


    viewer.classList.add(
        "show"
    );

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


    if (viewer) {

        viewer.classList.remove(
            "show"
        );

    }


    if (image) {

        image.src = "";

    }

}


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
        toastTimeout
    );


    toastTimeout =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

}


/* =========================================
   FECHAS
========================================= */

function formatearFecha(
    fecha
) {

    try {

        const partes =
            fecha.split("-");


        if (
            partes.length !== 3
        ) {

            return fecha;

        }


        return (
            partes[2] +
            "/" +
            partes[1] +
            "/" +
            partes[0]
        );


    } catch {

        return fecha;

    }

}


/* =========================================
   SEGURIDAD HTML
========================================= */

function escaparHTML(
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


/* =========================================
   TECLA ESC
========================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            cerrarModal();

            cerrarViewer();

            cerrarMenu();

        }

    }
);


/* =========================================
   INICIO
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    comprobarSesion
);