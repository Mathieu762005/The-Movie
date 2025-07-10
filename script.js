const apiKey = '2efa57c62260627a52ea2f91ce4c8ec5'
const url = `https://api.themoviedb.org/3/movie/popular?api_key=2efa57c62260627a52ea2f91ce4c8ec5&language=fr-FR&page=1`

fetch(url)
    .then(response => response.json())
    .then(data => {
        console.log(data)
        document.getElementById("container").innerHTML += `
            <div class="card border-0" style="width: 15rem;">
                <img src="https://image.tmdb.org/t/p/w500/${data.results[0].poster_path}" class="card-img-top rounded-0" id="c" alt="...">
                <div class="card-body p-1">
                    <h5 class="card-title text-white" id="titre">${data.results[0].title}</h5>
                    <p class="date">date de sortie ${data.results[0].release_date}</p>
                    <p class="text-white"><i class="bi bi-star-fill"></i> avis : ${Math.floor(data.results[0].vote_average)}</p>
                </div>
            </div>
            `
    }) 