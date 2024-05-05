const apiUrl = 'http://localhost:5678/api/'


async function getWorks() {
    try {
        const response = await fetch(apiUrl + 'works')
        const works = await response.json()
        
        const portfolio = document.getElementById('portfolio')
        //Ajout du titre -- si works non récupérés cela masque la section 'Mes projets'
        const title = document.createElement('h2')
        title.innerText = 'Mes Projets'
        portfolio.appendChild(title)
        //Ajout de la div.gallery 
        const gallery = document.createElement('div')
        gallery.setAttribute('class', 'gallery')
        portfolio.appendChild(gallery)
        //Ajout des works à gallery
        works.map((work) => {
            const figure = document.createElement('figure')
            figure.setAttribute('id', work.id)
            const figureImg = document.createElement('img')
            figureImg.setAttribute('src', work.imageUrl)
            figureImg.setAttribute('alt', work.title)
            figure.appendChild(figureImg)
            const figureCaption = document.createElement('figcaption')
            figureCaption.innerText = work.title
            figure.appendChild(figureCaption)
            gallery.appendChild(figure)
        })

    } catch(error) {
        console.log(error)
    }
}

getWorks()