const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyZWZhNTdjNjIyNjA2MjdhNTJlYTJmOTFjZTRjOGVjNSIsIm5iZiI6MTc1MjA3NDMxNC45NDUsInN1YiI6IjY4NmU4ODRhOWIwM2EzNzQ4YjZlOGU5MyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.BKgHRkuba0GKB7AQbX61tAbVcZMwmpEnX53ZwhMO3_8'
    }
};

fetch('https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1', options)
    .then(response => response.json())
    .then(data => {
        console.log(data)
        document.getElementById("header").style.backgroundImage = `url(https://image.tmdb.org/t/p/original/${data.results[0].backdrop_path})`;
        for (i = 0; i < 20; i++) {
            document.getElementById("container").innerHTML += `
            <div class="card border-0 px-2" style="width: 15rem;">
                <a href="pageFilm.html?id=${data.results[i].id}">
                    <img src="https://image.tmdb.org/t/p/w500/${data.results[i].poster_path}"
                        class="card-img-top rounded-4" id="c" alt="">
                </a>
                <div class="card-body p-1">
                    <a href="pageFilm.html">
                      <h5 class="card-title text-white" id="titre">${data.results[i].title}</h5>
                    </a>
                    <p class="date">date de sortie ${data.results[i].release_date}</p>
                    <p class="text-white"><i class="bi bi-star-fill"></i> avis :
                        ${Math.floor(data.results[i].vote_average)}/10</p>
                </div>
            </div>
            `
        }
    })