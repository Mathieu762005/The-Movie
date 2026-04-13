// ==========================================================================
// SCRIPTDESCRIPTION.JS — Page détail d'un film (pageFilm.html)
// ==========================================================================
// Ce fichier utilise config.js qui doit être chargé AVANT dans le HTML.
// On utilise les constantes API_OPTIONS, API_BASE, IMG_BASE de config.js
// ==========================================================================

// 1. Récupération sécurisée de l'ID depuis l'URL
const urlParams = new URLSearchParams(window.location.search);
const idMovie = urlParams.get('id');

// 2. Lancement au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    if (idMovie) {
        chargerDetailsFilm();
    } else {
        afficherErreur("Aucun film sélectionné.");
    }
});

// --- FONCTIONS ---

function chargerDetailsFilm() {
    // 1. Détails du film en français
    const detailsPromise = fetch(`${API_BASE}/movie/${idMovie}?language=fr-FR`, API_OPTIONS)
        .then(response => {
            if (!response.ok) throw new Error("Film introuvable");
            return response.json();
        });

    // 2. Vidéos : on cherche d'abord en français, puis fallback en anglais
    const videosPromise = fetch(`${API_BASE}/movie/${idMovie}/videos?language=fr-FR`, API_OPTIONS)
        .then(res => res.ok ? res.json() : { results: [] })
        .then(frData => {
            // Si on a un trailer YouTube en français, on le garde
            const frTrailer = frData.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer');
            if (frTrailer) return frData;

            // Sinon, on récupère les vidéos en anglais et on fusionne
            return fetch(`${API_BASE}/movie/${idMovie}/videos?language=en-US`, API_OPTIONS)
                .then(res => res.ok ? res.json() : { results: [] })
                .then(enData => {
                    // Vidéos FR en premier, puis les EN en complément
                    return { results: [...frData.results, ...enData.results] };
                });
        });

    Promise.all([detailsPromise, videosPromise])
        .then(([data, videosData]) => {
            data.videos = videosData;
            majDesignPage(data);
            injecterContenu(data);
        })
        .catch(err => {
            console.error("Erreur API:", err);
            afficherErreur("Impossible de charger les détails du film.");
        });
}

// Séparer le style du contenu est une bonne pratique (SoC: Separation of Concerns)
function majDesignPage(data) {
    const body = document.getElementById("body");
    if (data.backdrop_path) {
        // PERFORMANCE : w1280 au lieu de "original" — suffisant pour un fond
        body.style.backgroundImage = `url(${IMG_BASE}/w1280/${data.backdrop_path})`;
    }
}

function injecterContenu(data) {
    const container = document.getElementById("container1");

    // OPTIMISATION : optional chaining (?.) évite les crashs si videos est undefined
    // On cherche d'abord un Trailer, sinon on prend la première vidéo dispo
    const video = data.videos?.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer')
        || data.videos?.results?.[0];
    const videoKey = video ? video.key : null;

    // Données formatées
    const genresHtml = data.genres
        .map(g => `<span class="badge rounded-pill bg-secondary me-2">${g.name}</span>`)
        .join('');
    const annee = data.release_date ? new Date(data.release_date).getFullYear() : "N/A";
    const note = data.vote_average ? data.vote_average.toFixed(1) : "0";

    // SÉCURITÉ : fallback si poster_path est null (certains films n'ont pas d'affiche)
    const posterSrc = data.poster_path
        ? `${IMG_BASE}/w500${data.poster_path}`
        : 'img/logo.png';

    container.innerHTML = `
    <div class="container">
        <div class="row align-items-center">
            <div class="col-md-5 text-center mb-4 mb-md-0">
                <img src="${posterSrc}" 
                     alt="Affiche de ${data.title}" 
                     class="img-fluid rounded-4 shadow-lg border border-secondary">
            </div>

            <div class="col-md-7">
                <h1 class="titre-film display-2 mb-2 fw-bold text-white">${data.title}</h1>
                <div class="mb-3">${genresHtml}</div>
                
                <p class="fs-4 mb-4">
                    <i class="bi bi-star-fill text-warning"></i> <strong>${note}/10</strong> 
                    <span class="text-secondary ms-4"><i class="bi bi-calendar"></i> ${annee}</span>
                </p>
                
                <div class="description-scroll pe-2" style="max-height: 200px; overflow-y: auto;">
                    <p class="fs-5 text-light opacity-75">
                        ${data.overview || "Aucun résumé disponible pour ce film."}
                    </p>
                </div>

                <div class="mt-4">
                    ${videoKey ? `
                        <button class="btn btn-danger btn px-5 py-3 fw-bold shadow" onclick="ouvrirTrailer('${videoKey}')">
                            <i class="bi bi-play-fill"></i> BANDE ANNONCE
                        </button>
                    ` : `
                        <button class="btn btn-outline-secondary btn-lg" disabled>Bande-annonce indisponible</button>
                    `}
                </div>
            </div>
        </div>
    </div>`;
}

// Fonction pour la popup trailer
function ouvrirTrailer(key) {
    const videoContainer = document.getElementById("videoContainer");
    const modalElement = document.getElementById('trailerModal');

    // On injecte l'iframe YouTube
    videoContainer.innerHTML = `
        <iframe src="https://www.youtube.com/embed/${key}?autoplay=1" 
                title="Bande-annonce YouTube" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
        </iframe>`;

    const maModal = new bootstrap.Modal(modalElement);
    maModal.show();

    // OPTIMISATION : Nettoyage automatique à la fermeture de la modal
    // { once: true } → l'écouteur s'autodétruit après la première exécution
    // Sans ça, on accumulerait des écouteurs à chaque ouverture (fuite mémoire)
    modalElement.addEventListener('hidden.bs.modal', () => {
        videoContainer.innerHTML = "";
    }, { once: true });
}

// Fonction utilitaire pour les erreurs
function afficherErreur(message) {
    document.getElementById("container1").innerHTML = `
        <div class="text-center w-100 mt-5">
            <h2 class="text-white">${message}</h2>
            <a href="index.html" class="btn btn-outline-light mt-3">Retour à l'accueil</a>
        </div>`;
}