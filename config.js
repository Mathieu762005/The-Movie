// ==========================================================================
// CONFIG.JS — Source unique de vérité pour la configuration API
// ==========================================================================
// POURQUOI CE FICHIER ?
// Avant, l'objet "options" était copié-collé dans script.js ET scriptDescription.js.
// Problème : si la clé API change, il faut modifier 2 fichiers (risque d'oubli).
// Maintenant, tout est centralisé ici → principe DRY (Don't Repeat Yourself).
// ==========================================================================

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyZWZhNTdjNjIyNjA2MjdhNTJlYTJmOTFjZTRjOGVjNSIsIm5iZiI6MTc1MjA3NDMxNC45NDUsInN1YiI6IjY4NmU4ODRhOWIwM2EzNzQ4YjZlOGU5MyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.BKgHRkuba0GKB7AQbX61tAbVcZMwmpEnX53ZwhMO3_8'
    }
};

// Constantes d'URL — évite de retaper les mêmes URLs partout
// Si TMDB change son domaine un jour, on modifie une seule ligne
const API_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';
