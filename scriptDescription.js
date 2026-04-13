const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyZWZhNTdjNjIyNjA2MjdhNTJlYTJmOTFjZTRjOGVjNSIsIm5iZiI6MTc1MjA3NDMxNC45NDUsInN1YiI6IjY4NmU4ODRhOWIwM2EzNzQ4YjZlOGU5MyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.BKgHRkuba0GKB7AQbX61tAbVcZMwmpEnX53ZwhMO3_8'
    }
};

// 1. Récupération sécurisée de l'ID
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
    fetch(`https://api.themoviedb.org/3/movie/${idMovie}?language=fr-FR&append_to_response=videos`, options)
        .then(response => {
            if (!response.ok) throw new Error("Film introuvable"); // Sécurité : gestion du 404
            return response.json();
        })
        .then(data => {
            majDesignPage(data);
            injecterContenu(data);
        })
        .catch(err => {
            console.error("Erreur API:", err);
            afficherErreur("Impossible de charger les détails du film.");
        });
}

// Séparer le style du contenu pur est une bonne pratique
function majDesignPage(data) {
    const body = document.getElementById("body");
    if (data.backdrop_path) {
        // On injecte l'image SEULE. Le CSS s'occupe de l'assombrir.
        body.style.backgroundImage = `url(https://image.tmdb.org/t/p/original/${data.backdrop_path})`;
    }
}

function injecterContenu(data) {
    const container = document.getElementById("container1");

    // Check des vidéos (Optimisation : on cherche le trailer en priorité)
    const video = data.videos?.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer') || data.videos?.results?.[0];
    const videoKey = video ? video.key : null;

    // Données formatées
    const genresHtml = data.genres.map(g => `<span class="badge rounded-pill bg-secondary me-2">${g.name}</span>`).join('');
    const annee = data.release_date ? new Date(data.release_date).getFullYear() : "N/A";
    const note = data.vote_average ? data.vote_average.toFixed(1) : "0";

    container.innerHTML = `
    <div class="container">
        <div class="row align-items-center">
            <div class="col-md-5 text-center mb-4 mb-md-0">
                <img src="https://image.tmdb.org/t/p/w500${data.poster_path}" 
                     alt="${data.title}" 
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

// Fonction pour la popup
function ouvrirTrailer(key) {
    const videoContainer = document.getElementById("videoContainer");
    const modalElement = document.getElementById('trailerModal');

    // On injecte l'iframe
    videoContainer.innerHTML = `
        <iframe src="https://www.youtube.com/embed/${key}?autoplay=1" 
                title="YouTube video player" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
        </iframe>`;

    const maModal = new bootstrap.Modal(modalElement);
    maModal.show();

    // OPTIMISATION : Nettoyage automatique à la fermeture
    // On utilise { once: true } pour que l'écouteur s'autodétruise
    modalElement.addEventListener('hidden.bs.modal', () => {
        videoContainer.innerHTML = "";
    }, { once: true });
}

// Petite fonction utilitaire pour les erreurs
function afficherErreur(message) {
    document.getElementById("container1").innerHTML = `
        <div class="text-center w-100 mt-5">
            <h2 class="text-white">${message}</h2>
            <a href="index.html" class="btn btn-outline-light mt-3">Retour à l'accueil</a>
        </div>`;
}