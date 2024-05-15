// Définition des constantes

const apiUrl = 'http://localhost:5678/api/'
const portfolio = document.getElementById('portfolio')
const authToken = window.localStorage.getItem('authToken')
const addPhotoForm = document.getElementById('addPhotoForm')
const submitButton = document.getElementById('addPhotoFormSubmit')
const loginLink = document.getElementById('loginLink')

// Définition des variables

let works = {}
let modal = null
let view = null

// Gestion du bouton login / logout 

if (authToken) {
    loginLink.innerHTML = '<a href="#">logout</a>'
    const editBar = document.getElementsByClassName('editBar')
    editBar[0].style.display = 'flex'
}

loginLink.addEventListener('click', () => {
    if (authToken) {
        window.localStorage.removeItem('authToken')
        window.location.href = '/'
        window.location.reload(true)
    }
})

// Modale & gestion des vues de la modale

function openModal(e) {
    e.preventDefault()
    if (view === 'form') {
        changeModalView()
    }
    modal = document.querySelector(e.target.getAttribute('href'))
    modal.style.display = null
    modal.removeAttribute('aria-hidden')
    modal.setAttribute('aria-modal', true)
    modal.addEventListener('click', closeModal)
    modal.querySelector('.js-modal-close').addEventListener('click', closeModal)
    modal.querySelector('.js-modal-stop').addEventListener('click', stopPropagation)
    view = 'gallery'
    document.getElementById('modalAddPhotoBtn').addEventListener('click', changeModalView)
    populateModalGallery()
}

function changeModalView(e) {
    if (e) {
        e.preventDefault()
    }
    const modalGallery = document.getElementById('modalGallery')
    const modalTitle = document.getElementById('modalTitle')
    const modalBackBtn = document.getElementById('modalBackBtn')
    const modalForm = document.getElementById('modalForm')
    const formPhotoInput = document.querySelector('.js-form-photo-input')
    const addPhotoForm = document.getElementById('addPhotoForm')

    if (view === 'gallery') {
        modalGallery.style.display = 'none'
        modalTitle.innerText = 'Ajout photo'
        modalBackBtn.style.display = null
        modalBackBtn.addEventListener('click', changeModalView)
        modalForm.style.display = null

        const formPhotoPreview = document.querySelector('.js-form-photo-preview')
        while (formPhotoPreview.firstChild) {
            formPhotoPreview.removeChild(formPhotoPreview.firstChild);
        }
        
        formPhotoInput.style.display = null

        formPhotoInput.addEventListener('change', showSelectedImage)

        addPhotoForm.reset()
        view = 'form'
    } else {
        modalTitle.innerText = 'Galerie photo'
        modalBackBtn.removeEventListener('click', changeModalView)
        formPhotoInput.removeEventListener('change', showSelectedImage)
        modalForm.style.display = 'none'
        modalBackBtn.style.display = 'none'
        modalGallery.style.display = null
        view = 'gallery'
    }
    
}

function closeModal(e) {
    if (modal === null) return
    if (e) e.preventDefault()
    modal.style.display = 'none'
    const modalGalleryItems = document.getElementById('modalGalleryItems')
    if (modalGalleryItems.hasChildNodes()) {
        while (modalGalleryItems.firstChild) {
            modalGalleryItems.removeChild(modalGalleryItems.firstChild);
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

// Gestion du formulaire d'ajout de work

addPhotoForm.addEventListener('submit', (event) => {
            event.preventDefault()
            const formData = new FormData(addPhotoForm)
            sendNewWork(formData)
})

addPhotoForm.addEventListener('change', (event) => {
    const fileInput = document.getElementById('addPhotoFormPhoto')
    const titleInput = document.getElementById('addPhotoFormTitle')
    const categoryInput = document.getElementById('addPhotoFormCategory')
    if (fileInput.value && titleInput.value && categoryInput.value) {
        submitButton.removeAttribute('disabled')
        submitButton.style.backgroundColor = '#1D6154'
    }
})

function showSelectedImage() {
    const formPhotoInput = document.querySelector('.js-form-photo-input')
    const input = document.getElementById('addPhotoFormPhoto')
    const formPhotoPreview = document.querySelector('.js-form-photo-preview')
    const files = input.files
    formPhotoInput.removeEventListener('change', showSelectedImage)
    formPhotoInput.style.display = 'none'
    for (const file of files) {
        const image = document.createElement('img')
        image.src = URL.createObjectURL(file)
        image.alt = image.title = file.name
        formPhotoPreview.appendChild(image)
    }
    
}

async function populateCategorieSelect() {
    try {
        const response = await fetch(apiUrl + 'categories')
        const categories = await response.json()

        const categorieSelect = document.getElementById('addPhotoFormCategory')
        categories.map((categorie) => {
            const option = document.createElement('option')
            option.setAttribute('value', categorie.id)
            option.innerText = categorie.name
            categorieSelect.appendChild(option)
        })
        const defaultSelectCategory = document.createElement('option')
        defaultSelectCategory.setAttribute('value', '')
        defaultSelectCategory.innerText = ''
        categorieSelect.prepend(defaultSelectCategory)
    } catch(error) {
        console.log(error)
    }
}

// Requêtes pour les works

async function getWorks() {
    try {
        const response = await fetch(apiUrl + 'works')
        works = await response.json()
    } catch(error) {
        console.log(error)
    }
}

async function deleteWork(e, workId) {
    e.preventDefault()
    try {
        const response = await fetch(apiUrl + `works/${workId}`, { method: 'DELETE', headers: {'Authorization': `Bearer ${authToken}`}} )
        if (response.status == '200' || response.status == '204') {
            await getWorks()
            closeModal()
            displayWorks(works)
        }
    } catch(error) {
        console.log(error)
    }
}

async function sendNewWork(formData) {
    const response = await fetch(apiUrl + 'works', { method: 'POST', headers: {'Authorization': `Bearer ${authToken}`}, body: formData})
    if (response.status == '201') {
        const newWork = await response.json()
        works.push(newWork)
        closeModal()
        submitButton.setAttribute('disabled', true)
        submitButton.style.backgroundColor = '#A7A7A7'
        displayWorks(works)
    }
}

// Gestion de l'affichage des works 

function populateModalGallery() {
    const modalGalleryItems = document.getElementById('modalGalleryItems')
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
    modalGalleryItems.appendChild(gallery)
}

async function populatePortfolioGallery() {
        await getWorks()
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

// Appel des fonctions d'affichage des works

populatePortfolioGallery()
populateCategorieSelect()