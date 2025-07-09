const apiKey = '2efa57c62260627a52ea2f91ce4c8ec5'
const url = `https://api.themoviedb.org/3/movie/popular?api_key=2efa57c62260627a52ea2f91ce4c8ec5&language=fr-FR&page=1`

fetch(url)
    .then(response => response.json())
    .then(data => {
        console.log(data)
    })