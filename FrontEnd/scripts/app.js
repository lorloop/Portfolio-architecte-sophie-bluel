const apiUrl = 'http://localhost:5678/api/'
const portfolio = document.getElementById('portfolio')
const authToken = window.localStorage.getItem('authToken')

const loginLink = document.getElementById('loginLink')
loginLink.addEventListener('click', () => {
    if (authToken) {
        window.localStorage.removeItem('authToken')
        window.location.href = '/'
        window.location.reload(true)
    }
})

if (authToken) {
    loginLink.innerHTML = '<a href="#">logout</a>'
    const editBar = document.getElementsByClassName('editBar')
    editBar[0].style.display = 'flex'
}


async function getWorks() {
    try {
        const response = await fetch(apiUrl + 'works')
        const works = await response.json()
        
        
        //Ajout du titre -- si works non récupérés cela masque la section 'Mes projets'
        const title = document.createElement('h2')
        title.innerText = 'Mes Projets'
        portfolio.appendChild(title)

        //Ajout du menu de categories
        const categories = [... new Set(works.map(work => work.category.name))]
        const filter = document.createElement('div')
        filter.setAttribute('class', 'filters')
        categories.forEach(category => {
            const button = document.createElement('button')
            button.textContent = category
            button.setAttribute('class', 'filterButton')
            button.addEventListener('click', (event) => {
                const selectedCategory = event.target.textContent
                const currentFilter = document.getElementsByClassName('activeButton')
                currentFilter[0].setAttribute('class', 'filterButton')
                event.target.setAttribute('class', 'filterButton activeButton')
                const filteredWorks = works.filter(work => work.category.name === selectedCategory)
                displayWorks(filteredWorks)
            })
            filter.appendChild(button)
        })

        const allButton = document.createElement('button')
        allButton.textContent = 'Tous'
        allButton.setAttribute('class', 'filterButton activeButton')
        allButton.addEventListener('click', (event) => {
            const currentFilter = document.getElementsByClassName('activeButton')
            currentFilter[0].setAttribute('class', 'filterButton')
            event.target.setAttribute('class', 'filterButton activeButton')
            displayWorks(works)
        })
        filter.prepend(allButton)

        portfolio.appendChild(filter)

        //Ajout de la div.gallery 
        const gallery = document.createElement('div')
        gallery.setAttribute('class', 'gallery')
        gallery.setAttribute('id', 'gallery')
        portfolio.appendChild(gallery)
        //Ajout des works à gallery
        displayWorks(works)

    } catch(error) {
        console.log(error)
    }
}

function displayWorks(works) {
    const gallery = document.getElementById('gallery')
    if (gallery.hasChildNodes()) {
        while (gallery.firstChild) {
            gallery.removeChild(gallery.firstChild);
        }
    }
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
}

getWorks()