const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyZWZhNTdjNjIyNjA2MjdhNTJlYTJmOTFjZTRjOGVjNSIsIm5iZiI6MTc1MjA3NDMxNC45NDUsInN1YiI6IjY4NmU4ODRhOWIwM2EzNzQ4YjZlOGU5MyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.BKgHRkuba0GKB7AQbX61tAbVcZMwmpEnX53ZwhMO3_8'
    }
};

let urlParams = new URLSearchParams(window.location.search)
let idMovie = urlParams.get('id')


fetch(`https://api.themoviedb.org/3/movie/${idMovie}?language=fr-FR`, options)
    .then(response => response.json())
    .then(data => {
        console.log(data)
        document.getElementById("body").style.backgroundImage = `url(https://image.tmdb.org/t/p/original/${data.backdrop_path})`
        document.getElementById("container1").innerHTML = `
            <div class="description row justify-content-center">
                <h5 class="titre pb-3">${data.title}</h5>
                <p><i class="bi bi-hand-thumbs-up-fill"></i> ${data.vote_count} votes . note ${Math.floor(data.vote_average)}/10</p>
                <p>date de sortie : ${data.release_date}</p>
                <p>${data.overview}</p>
            </div>
            `
    })
