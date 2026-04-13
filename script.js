// ==========================================================================
// SCRIPT.JS — Page d'accueil (index.html)
// ==========================================================================
// Ce fichier utilise config.js qui doit être chargé AVANT dans le HTML.
// On utilise les constantes API_OPTIONS, API_BASE, IMG_BASE de config.js
// ==========================================================================

const searchParams = new URLSearchParams(window.location.search);
const recherche = searchParams.get('recherche');

// --- INITIALISATION AU CHARGEMENT DU DOM ---
// POURQUOI addEventListener('DOMContentLoaded') ?
// Garantit que tous les éléments HTML existent avant d'y accéder.
// Sans ça, getElementById() pourrait retourner null → crash silencieux.
document.addEventListener('DOMContentLoaded', () => {
    chargerCategories();

    // Pré-remplir le champ de recherche si une recherche est en cours
    // → Meilleure UX : l'utilisateur voit ce qu'il a cherché
    if (recherche && recherche.trim() !== "") {
        const champRecherche = document.getElementById('recherche');
        if (champRecherche) champRecherche.value = recherche;
        rechercher(recherche);
    } else {
        chargerFilmsAccueil();
    }
});

// --- FONCTIONS PRINCIPALES ---

function chargerFilmsAccueil() {
    // Afficher un spinner pendant le chargement
    const container = document.getElementById("container");
    if (container) {
        container.innerHTML = `
            <div class="d-flex justify-content-center w-100 py-5">
                <div class="spinner-border text-danger" role="status">
                    <span class="visually-hidden">Chargement...</span>
                </div>
            </div>`;
    }

    fetch(`${API_BASE}/movie/now_playing?language=fr-FR&page=1`, API_OPTIONS)
        .then(response => {
            // SÉCURITÉ : toujours vérifier que la réponse est OK (status 200-299)
            if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (data.results && data.results.length > 0) {
                majAffichePrincipale(data.results[0]);
                afficherListeFilms(data.results);
            }
        })
        .catch(erreur => {
            console.error("Erreur lors du chargement de l'accueil :", erreur);
            // Afficher un message d'erreur à l'utilisateur plutôt qu'un écran vide
            if (container) {
                container.innerHTML = `
                    <p class="text-white text-center w-100">
                        Impossible de charger les films. Veuillez réessayer plus tard.
                    </p>`;
            }
        });
}

function rechercher(query) {
    const container = document.getElementById("container");
    if (container) {
        container.innerHTML = `
            <div class="d-flex justify-content-center w-100 py-5">
                <div class="spinner-border text-danger" role="status">
                    <span class="visually-hidden">Recherche...</span>
                </div>
            </div>`;
    }

    // SÉCURITÉ (XSS) : encodeURIComponent empêche l'injection de code dans l'URL.
    // Sans ça, un utilisateur malveillant pourrait taper quelque chose comme :
    // &api_key=xxx dans la barre de recherche et manipuler la requête.
    const encodedQuery = encodeURIComponent(query);

    fetch(`${API_BASE}/search/movie?query=${encodedQuery}&include_adult=false&language=fr-FR&page=1`, API_OPTIONS)
        .then(res => {
            if (!res.ok) throw new Error(`Erreur HTTP : ${res.status}`);
            return res.json();
        })
        .then(data => {
            if (data.results && data.results.length > 0) {
                majAffichePrincipale(data.results[0]);
                afficherListeFilms(data.results);
            } else {
                if (container) {
                    container.innerHTML = "<p class='text-white text-center w-100'>Aucun film trouvé.</p>";
                }
            }
        })
        .catch(erreur => {
            console.error("Erreur de recherche :", erreur);
            if (container) {
                container.innerHTML = "<p class='text-white text-center w-100'>Erreur lors de la recherche.</p>";
            }
        });
}

function chargerCategories() {
    fetch(`${API_BASE}/genre/movie/list?language=fr-FR`, API_OPTIONS)
        .then(res => {
            if (!res.ok) throw new Error(`Erreur HTTP : ${res.status}`);
            return res.json();
        })
        .then(data => {
            const catContainer = document.getElementById("categoriesList");
            if (!catContainer) return;

            // PERFORMANCE : map() + join() crée le HTML en une seule opération
            // Beaucoup plus rapide que des innerHTML += en boucle
            // (chaque += force le navigateur à re-parser tout le HTML)
            const categoriesHtml = data.genres.map(genre => `
                <button class="btn-category" onclick="filtrerParGenre(${genre.id})">
                    ${genre.name}
                </button>
            `).join('');

            catContainer.innerHTML = categoriesHtml;
        })
        .catch(erreur => console.error("Erreur chargement catégories :", erreur));
}

function filtrerParGenre(genreId) {
    const container = document.getElementById("container");
    if (container) {
        container.innerHTML = `
            <div class="d-flex justify-content-center w-100 py-5">
                <div class="spinner-border text-danger" role="status">
                    <span class="visually-hidden">Filtrage...</span>
                </div>
            </div>`;
    }

    fetch(`${API_BASE}/discover/movie?with_genres=${genreId}&language=fr-FR&page=1`, API_OPTIONS)
        .then(res => {
            if (!res.ok) throw new Error(`Erreur HTTP : ${res.status}`);
            return res.json();
        })
        .then(data => {
            if (data.results && data.results.length > 0) {
                majAffichePrincipale(data.results[0]);
                afficherListeFilms(data.results);
            }
        })
        .catch(erreur => console.error("Erreur filtrage :", erreur));
}

// --- FONCTIONS D'AFFICHAGE ---

function majAffichePrincipale(movie) {
    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A";
    const vote = movie.vote_average ? Math.floor(movie.vote_average) : "NR";

    // Protection contre overview null ou vide
    const overviewText = movie.overview
        ? movie.overview.substring(0, 200) + '...'
        : "Aucun résumé disponible pour ce film.";

    const afficheDiv = document.getElementById("affiche");
    const descContainer = document.getElementById("descriptionContainer");

    if (afficheDiv && descContainer) {
        // PERFORMANCE : "original" est la plus grande image (souvent 3000px+).
        // Pour le backdrop, w1280 est suffisant pour la plupart des écrans.
        const backdropPath = movie.backdrop_path || movie.poster_path;
        afficheDiv.style.backgroundImage = `url(${IMG_BASE}/w1280/${backdropPath})`;

        descContainer.innerHTML = `
            <div class="afficheDescription">
                <h1 class="nomFilm">${movie.title}</h1>
                <p>
                    <span class="badge"><i class="bi bi-star-fill text-warning"></i> ${vote}/10</span> 
                    <span class="badge text-secondary"><i class="bi bi-calendar"></i> ${year}</span>
                </p>
                <p class="description-text text-secondary">${overviewText}</p>
                <div class="mt-3">
                    <a href="pageFilm.html?id=${movie.id}" class="btn btn-danger px-4 py-2 me-2">Voir la description</a>
                    <button onclick="voirBandeAnnonce(${movie.id})" class="btn text-white border-secondary px-4 py-2" style="background-color: rgba(0, 0, 0, 0.5);">
                        <i class="bi bi-play-fill"></i> Bande annonce
                    </button>
                </div>
            </div>`;
    }
}

function afficherListeFilms(movies) {
    const container = document.getElementById("container");
    if (!container) return;

    // PERFORMANCE : map() et join() assemblent tout le HTML d'un coup
    const filmsHtml = movies.map(movie => {
        if (!movie.poster_path) return ""; // On saute les films sans image

        const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A";
        const vote = movie.vote_average ? Math.floor(movie.vote_average) : "NR";

        // PERFORMANCE : 
        // - w342 au lieu de w500 → images ~40% plus légères, qualité suffisante pour 15rem
        // - loading="lazy" → le navigateur ne charge l'image que quand elle est visible
        //   (économie massive sur mobile avec connexion lente)
        return `
            <div class="card border-0 px-2 mb-4" style="width: 15rem; background:transparent;">
                <a href="pageFilm.html?id=${movie.id}">
                    <img src="${IMG_BASE}/w342/${movie.poster_path}"
                        loading="lazy"
                        class="card-img-top rounded-4" alt="${movie.title}">
                </a>
                <div class="card-body p-1">
                    <h5 class="card-title text-white mt-2" style="font-size:0.9rem;">${movie.title}</h5>
                    <p class="text-secondary small mb-1">Sortie : ${year}</p>
                    <p class="text-white small"><i class="bi bi-star-fill text-warning"></i> ${vote}/10</p>
                </div>
            </div>`;
    }).join('');

    container.innerHTML = filmsHtml;
}

// --- BANDE ANNONCE (page d'accueil) ---

function voirBandeAnnonce(movieId) {
    // On cherche d'abord les vidéos en français
    fetch(`${API_BASE}/movie/${movieId}/videos?language=fr-FR`, API_OPTIONS)
        .then(res => {
            if (!res.ok) throw new Error(`Erreur HTTP : ${res.status}`);
            return res.json();
        })
        .then(frData => {
            // Chercher un trailer YouTube en français
            const frVideo = frData.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer');
            if (frVideo) {
                ouvrirTrailerAccueil(frVideo.key);
                return;
            }

            // Pas de trailer FR → fallback en anglais
            return fetch(`${API_BASE}/movie/${movieId}/videos?language=en-US`, API_OPTIONS)
                .then(res => res.json())
                .then(enData => {
                    const allVideos = [...frData.results, ...enData.results];
                    const video = allVideos.find(v => v.site === 'YouTube' && v.type === 'Trailer')
                        || allVideos.find(v => v.site === 'YouTube')
                        || allVideos[0];

                    if (!video) {
                        alert("Aucune bande-annonce disponible pour ce film.");
                        return;
                    }
                    ouvrirTrailerAccueil(video.key);
                });
        })
        .catch(err => {
            console.error("Erreur chargement bande-annonce :", err);
            alert("Impossible de charger la bande-annonce.");
        });
}

function ouvrirTrailerAccueil(key) {
    // Créer la modal si elle n'existe pas encore
    let modalElement = document.getElementById('trailerModalAccueil');
    if (!modalElement) {
        modalElement = document.createElement('div');
        modalElement.id = 'trailerModalAccueil';
        modalElement.className = 'modal fade';
        modalElement.tabIndex = -1;
        modalElement.setAttribute('aria-hidden', 'true');
        modalElement.innerHTML = `
            <div class="modal-dialog modal-xl modal-dialog-centered">
                <div class="modal-content" style="background: #000; border: 1px solid #333;">
                    <div class="modal-header border-0">
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fermer"></button>
                    </div>
                    <div class="modal-body p-0">
                        <div class="ratio ratio-16x9" id="videoContainerAccueil"></div>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(modalElement);
    }

    const videoContainer = document.getElementById('videoContainerAccueil');
    videoContainer.innerHTML = `
        <iframe src="https://www.youtube.com/embed/${key}?autoplay=1" 
                title="Bande-annonce YouTube" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
        </iframe>`;

    const modal = new bootstrap.Modal(modalElement);
    modal.show();

    // Nettoyage à la fermeture
    modalElement.addEventListener('hidden.bs.modal', () => {
        videoContainer.innerHTML = "";
    }, { once: true });
}