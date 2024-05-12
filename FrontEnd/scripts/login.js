const apiUrl = 'http://localhost:5678/api/'

const loginForm = document.getElementById('loginForm')
loginForm.addEventListener('submit', (event) => {
    event.preventDefault()

    const email = document.getElementById('loginEmail').value
    const password = document.getElementById('password').value

    performLogin(email, password)
})

async function performLogin(userEmail, userPassword) {
    const message = document.getElementById('errorMessage')
    if (message) {
        loginForm.removeChild(message)
    }
    const data = {
        email: userEmail, 
        password: userPassword,
    }
    try {
        const response = await fetch(apiUrl + 'users/login', {
            method: "POST", 
            headers: {
                "Content-Type": "application/json",
            }, 
            body: JSON.stringify(data)
        })
        if (response.status == '404' || response.status == '401') {
            const errorMessage = document.createElement('p')
            errorMessage.setAttribute('id', 'errorMessage')
            errorMessage.innerText = 'Erreur dans l’identifiant ou le mot de passe'
            loginForm.appendChild(errorMessage)
        } else if (response.status == '200' ) {
            const data = await response.json()
            window.localStorage.setItem('authToken', data.token)
            document.location.href = 'index.html'
            //window.location.reload(true)
        } else {
            console.log(response)
        }
    } catch(error) {
        console.log(error)
    }
}