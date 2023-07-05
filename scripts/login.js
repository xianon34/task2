const apiBaseUrl = 'https://todo-api.ctd.academy/v1';
const buttonLoginSubmitRef = document.querySelector('#buttonLoginSubmit');
const inputEmail = document.getElementById('inputEmail');
const inputPassword = document.getElementById('inputPassword');

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  return password.length >= 4;
}

function authUser(event) {
  event.preventDefault();

  const email = inputEmail.value.trim();
  const password = inputPassword.value.trim();

  const emailErrorMessage = document.getElementById('emailErrorMessage');
  const passwordErrorMessage = document.getElementById('passwordErrorMessage');

  emailErrorMessage.textContent = ''; // Limpa a mensagem de erro anterior
  passwordErrorMessage.textContent = ''; // Limpa a mensagem de erro anterior

  let isValid = true;

  if (!validateEmail(email)) {
    emailErrorMessage.textContent = 'Por favor, insira um email válido.';
    emailErrorMessage.style.color = 'red';
    isValid = false;
  }

  if (!validatePassword(password)) {
    passwordErrorMessage.textContent = 'A senha deve conter pelo menos 4 caracteres.';
    passwordErrorMessage.style.color = 'red';
    isValid = false;
  }

  if (!isValid) {
    return;
  }

  const requestHeaders = {
    "Accept": "application/json",
    "Content-Type": "application/json"
  };

  const user = {
    email: email,
    password: password,
  };

  const requestSettings = {
    method: 'POST',
    body: JSON.stringify(user),
    headers: requestHeaders
  };

  fetch(`${apiBaseUrl}/users/login`, requestSettings)
    .then(response => {
      if (response.ok) {
        response.json().then(data => {
          localStorage.setItem('jwt', data.jwt);
          window.location.href = 'tarefas.html';
        });
      } else {
        alert('Credenciais inválidas. Por favor, verifique seu email e senha.');
      }
    });
}

buttonLoginSubmitRef.addEventListener('click', event => authUser(event));
