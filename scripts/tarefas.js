// URL base da API
const apiBaseUrl = 'https://todo-api.ctd.academy/v1';

// Obter o token JWT armazenado no localStorage
const jwt = localStorage.getItem('jwt');

// Cabeçalhos de requisição com autenticação
const requestHeadersAuth = {
  "Accept": "application/json",
  "Content-Type": "application/json",
  "Authorization": jwt
};

// Função para fazer logout, limpar o localStorage e redirecionar para a página de login
function logOut() {
  localStorage.clear();
  window.location.href = 'index.html';
}

// Função para formatar uma data no formato DD/MM/AA
function formatDate(date) {
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

// Função para criar um elemento de tarefa e adicionar ao DOM
function createTask(taskName, timestamp, taskId) {
  if (!taskName.trim()) return;

  // Criar elemento <li> para a tarefa
  const taskElement = document.createElement('li');
  taskElement.classList.add('tarefa');
  taskElement.id = taskId;

  // Criar elemento <div> para a descrição da tarefa
  const descricaoElement = document.createElement('div');
  descricaoElement.classList.add('descricao');
  taskElement.appendChild(descricaoElement);

  // Preencher a descrição da tarefa no elemento
  descricaoElement.innerHTML = `
    <div class="not-done"></div>
    <p class="nome">${taskName}</p>
    <p class="timestamp">Criada em: ${formatDate(timestamp)}</p>
    <button class="delete-button">x</button>
    <button class="edit-button">Editar</button>
    <button class="done-button">Concluir</button>
  `;

  // Adicionar a tarefa à lista de tarefas pendentes
  const openTasksList = document.getElementById('openTasksList');
  openTasksList.appendChild(taskElement);

  // Adicionar event listeners aos botões de exclusão, edição e conclusão
  const deleteButton = descricaoElement.querySelector('.delete-button');
  const editButton = descricaoElement.querySelector('.edit-button');
  const doneButton = descricaoElement.querySelector('.done-button');

  deleteButton.addEventListener('click', () => deleteTask(taskId));

  editButton.addEventListener('click', () => {
    const newTaskName = prompt('Digite o novo nome da tarefa:');
    if (newTaskName) updateTask(taskId, newTaskName);
  });

  doneButton.addEventListener('click', () => markTaskAsDone(taskId));
}

// Função para obter as tarefas do servidor
function getTasks() {
  fetch(`${apiBaseUrl}/tasks`, { headers: requestHeadersAuth })
    .then(response => {
      if (response.ok) return response.json();
      if (response.status === 401) logOut();
      throw new Error('Erro ao obter as tarefas.');
    })
    .then(tasks => tasks.forEach(task => createTask(task.description, task.createdAt, task.id)))
    .catch(error => console.log(error.message));
}

// Função para criar uma nova tarefa
function createNewTask(taskName) {
  if (!taskName.trim()) return;

  fetch(`${apiBaseUrl}/tasks`, {
    method: 'POST',
    headers: requestHeadersAuth,
    body: JSON.stringify({ description: taskName })
  })
    .then(response => {
      if (response.ok) return response.json();
      if (response.status === 401) logOut();
      throw new Error('Erro ao criar a tarefa.');
    })
    .then(task => createTask(task.description, task.createdAt, task.id))
    .catch(error => console.log(error.message));
}

// Função para verificar se o usuário está autenticado e obter as tarefas
function checkAuthUser() {
  if (!jwt) logOut();
  getTasks();
}

// Verificar autenticação do usuário ao carregar a página
checkAuthUser();

// Adicionar event listener ao formulário de criação de tarefas
const form = document.querySelector('.nova-tarefa');
const taskNameInput = document.getElementById('novaTarefa');

form.addEventListener('submit', event => {
  event.preventDefault();
  const taskName = taskNameInput.value;
  createNewTask(taskName);
  taskNameInput.value = '';
});

// Adicionar event listener ao botão de logout
document.getElementById('closeApp').addEventListener('click', logOut);

// Função para excluir uma tarefa
function deleteTask(taskId) {
  fetch(`${apiBaseUrl}/tasks/${taskId}`, { method: 'DELETE', headers: requestHeadersAuth })
    .then(response => {
      if (response.ok) {
        const taskElement = document.getElementById(taskId);
        taskElement.remove();
      } else {
        if (response.status === 401) logOut();
        throw new Error('Erro ao excluir a tarefa.');
      }
    })
    .catch(error => console.log(error.message));
}

// Função para atualizar o nome de uma tarefa
function updateTask(taskId, newTaskName) {
  fetch(`${apiBaseUrl}/tasks/${taskId}`, {
    method: 'PUT',
    headers: requestHeadersAuth,
    body: JSON.stringify({ description: newTaskName })
  })
    .then(response => {
      if (response.ok) {
        const taskElement = document.getElementById(taskId);
        taskElement.querySelector('.nome').textContent = newTaskName;
      } else {
        if (response.status === 401) logOut();
        throw new Error('Erro ao atualizar a tarefa.');
      }
    })
    .catch(error => console.log(error.message));
}

// Função para marcar uma tarefa como concluída
function markTaskAsDone(taskId) {
  fetch(`${apiBaseUrl}/tasks/${taskId}`, {
    method: 'PUT',
    headers: requestHeadersAuth,
    body: JSON.stringify({ completed:true })
  })
    .then(response => {
      if (response.ok) {
        const taskElement = document.getElementById(taskId);
        taskElement.querySelector('.not-done').classList.add('done');
        document.getElementById('doneTasksList').appendChild(taskElement);
        taskElement.querySelector('.done-button').remove();
      } else {
        if (response.status === 401) logOut();
        throw new Error('Erro ao marcar a tarefa como concluída.');
      }
    })
    .catch(error => console.log(error.message));
}
