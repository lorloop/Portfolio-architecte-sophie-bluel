const apiUrl = 'http://localhost:5678/api/'
const portfolio = document.getElementById('portfolio')
const authToken = window.localStorage.getItem('authToken')
let works = {}
let modal = null

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

function openModal(e) {
    e.preventDefault()
    modal = document.querySelector(e.target.getAttribute('href'))
    modal.style.display = null
    modal.removeAttribute('aria-hidden')
    modal.setAttribute('aria-modal', true)
    modal.addEventListener('click', closeModal)
    modal.querySelector('.js-modal-close').addEventListener('click', closeModal)
    modal.querySelector('.js-modal-stop').addEventListener('click', stopPropagation)
    const modalGallery = document.getElementById('modalGallery')
    const gallery = document.createElement('div')
    gallery.setAttribute('class', 'modal-gallery')
    works.map((work) => {
            const figure = document.createElement('figure')
            figure.setAttribute('id', work.id)
            const figureImg = document.createElement('img')
            figureImg.setAttribute('src', work.imageUrl)
            figureImg.setAttribute('alt', work.title)
            figure.appendChild(figureImg)
            const deleteBtn = document.createElement('button')
            deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>'
            deleteBtn.setAttribute('class', 'modal-trash-btn')
            deleteBtn.addEventListener('click', (event) => deleteWork(event, work.id))
            figure.appendChild(deleteBtn)
            gallery.appendChild(figure)
        })
    modalGallery.appendChild(gallery)
}

function closeModal(e) {
    if (modal === null) return
    if (e) e.preventDefault()
    modal.style.display = 'none'
    const modalGallery = document.getElementById('modalGallery')
    if (modalGallery.hasChildNodes()) {
        while (modalGallery.firstChild) {
            modalGallery.removeChild(modalGallery.firstChild);
        }
    }
    modal.setAttribute('aria-hidden', true)
    modal.removeAttribute('aria-modal')
    modal.removeEventListener('click', closeModal)
    modal.querySelector('.js-modal-close').removeEventListener('click', closeModal)
    modal.querySelector('.js-modal-stop').removeEventListener('click', stopPropagation)
    modal = null
}

function stopPropagation(e) {
    e.stopPropagation()
}

async function deleteWork(e, workId) {
    e.preventDefault()
    try {
        const response = await fetch(apiUrl + `works/${workId}`, { method: 'DELETE', headers: {'Authorization': `Bearer ${authToken}`}} )
        if (response.status == '200' || response.status == '204') {
            const newWorks = await fetch(apiUrl + 'works')
            works = await newWorks.json()
            closeModal()
            displayWorks(works)
        }
    } catch(error) {
        console.log(error)
    }
}

async function getWorks() {
    try {
        const response = await fetch(apiUrl + 'works')
        works = await response.json()
        
        
        //Ajout du titre -- si works non récupérés cela masque la section 'Mes projets'
        const titleDiv = document.createElement('div')
        titleDiv.setAttribute('class', 'portfolio-title')
        const title = document.createElement('h2')
        title.innerText = 'Mes Projets'
        titleDiv.appendChild(title)
        if (authToken) {
            const editLink = document.createElement('a')
            editLink.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> modifier'
            editLink.setAttribute('class', 'edit-link')
            editLink.setAttribute('href', '#modal')
            editLink.addEventListener('click', openModal)
            titleDiv.appendChild(editLink)
        }

        portfolio.appendChild(titleDiv)

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

        if (authToken) {
            filter.style.visibility = 'hidden'
        }

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