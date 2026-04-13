const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyZWZhNTdjNjIyNjA2MjdhNTJlYTJmOTFjZTRjOGVjNSIsIm5iZiI6MTc1MjA3NDMxNC45NDUsInN1YiI6IjY4NmU4ODRhOWIwM2EzNzQ4YjZlOGU5MyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.BKgHRkuba0GKB7AQbX61tAbVcZMwmpEnX53ZwhMO3_8'
    }
};

const searchParams = new URLSearchParams(window.location.search);
const recherche = searchParams.get('recherche'); // Utilisation de const car on ne modifie pas cette variable

// --- OPTIMISATION 4 : On attend que le HTML soit chargé ---
document.addEventListener('DOMContentLoaded', () => {
    chargerCategories();

    if (recherche && recherche.trim() !== "") {
        rechercher(recherche); // On passe la recherche en paramètre, c'est plus propre
    } else {
        chargerFilmsAccueil();
    }
});

// --- FONCTIONS PRINCIPALES ---

function chargerFilmsAccueil() {
    fetch('https://api.themoviedb.org/3/movie/now_playing?language=fr-FR&page=1', options)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                majAffichePrincipale(data.results[0]);
                afficherListeFilms(data.results);
            }
        })
        .catch(erreur => console.error("Erreur lors du chargement de l'accueil :", erreur)); // OPTIMISATION 2
}

function rechercher(query) {
    fetch(`https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=false&language=fr-FR&page=1`, options)
        .then(res => res.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                majAffichePrincipale(data.results[0]);
                afficherListeFilms(data.results);
            } else {
                document.getElementById("container").innerHTML = "<p class='text-white text-center'>Aucun film trouvé.</p>";
            }
        })
        .catch(erreur => console.error("Erreur de recherche :", erreur));
}

function chargerCategories() {
    fetch('https://api.themoviedb.org/3/genre/movie/list?language=fr-FR', options)
        .then(res => res.json())
        .then(data => {
            const catContainer = document.getElementById("categoriesList");
            if (!catContainer) return; // Sécurité si la div n'existe pas

            // OPTIMISATION 1 : On crée un tableau de HTML qu'on fusionne à la fin avec .join('')
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
    document.getElementById("container").innerHTML = "<div class='text-center w-100'><div class='spinner-border text-danger'></div></div>";

    fetch(`https://api.themoviedb.org/3/discover/movie?with_genres=${genreId}&language=fr-FR&page=1`, options)
        .then(res => res.json())
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

    // OPTIMISATION 3 : On protège le cas où overview est null ou vide
    const overviewText = movie.overview ? movie.overview.substring(0, 200) + '...' : "Aucun résumé disponible pour ce film.";

    const afficheDiv = document.getElementById("affiche");
    const descContainer = document.getElementById("descriptionContainer");

    if (afficheDiv && descContainer) {
        afficheDiv.style.backgroundImage = `url(https://image.tmdb.org/t/p/original/${movie.backdrop_path || movie.poster_path})`;

        descContainer.innerHTML = `
            <div class="afficheDescription">
                <h1 class="nomFilm">${movie.title}</h1>
                <p>
                    <span class="badge"><i class="bi bi-star-fill text-warning"></i> ${vote}/10</span> 
                    <span class="badge text-secondary"><i class="bi bi-calendar"></i> ${year}</span>
                </p>
                <p class="description-text text-secondary">${overviewText}</p>
                <div class="mt-3">
                    <a href="pageFilm.html?id=${movie.id}" class="btn btn-danger me-2">Voir la description</a>
                    <a href="#" class="btn text-white border-secondary" style="background-color: rgba(0, 0, 0, 0.5);">
                        <i class="bi bi-play-fill"></i> Bande annonce
                    </a>
                </div>
            </div>`;
    }
}

function afficherListeFilms(movies) {
    const container = document.getElementById("container");
    if (!container) return;

    // OPTIMISATION 1 : map() et join() remplacent le innerHTML +=
    const filmsHtml = movies.map(movie => {
        if (!movie.poster_path) return ""; // On saute les films sans image

        const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A";
        const vote = movie.vote_average ? Math.floor(movie.vote_average) : "NR";

        return `
            <div class="card border-0 px-2 mb-4" style="width: 15rem; background:transparent;">
                <a href="pageFilm.html?id=${movie.id}">
                    <img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}"
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