const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

// Lista onde serão armazenados os usuários
const users = [];

// Função de pesquisa e validação do usuário
function checksExistsUserAccount(request, response, next) {
  // Captura o Username da requisição headers
  const { username } = request.headers;

  // Pesquisa na lista e retorna o usuário correspondente
  const user = users.find((user) => user.username === username);

  // Verifica se o usuário existe e retorna erro caso não seja encontrado
  if (!user) {
    return response.status(404).json({ error: "User not found!" });
  }

  // Disponibiliza o objeto usuário no metodo Request
  request.user = user;

  // Dá seguimento ao código
  return next();
}

app.post("/users", (request, response) => {
  // Busca as informações do Body
  const { name, username } = request.body;

  // Verifica se o usuário já existe
  const userAlreadyExists = users.find((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "Usarname already exists!" });
  }

  // Cria um usuário com as informações buscadas
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  // Adiciona o usuário a lista de usuários
  users.push(user);

  // Confirmação de sucesso
  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  // Busca o usuário na lista através de seu username e valida sua existência
  const { user } = request;

  //Retorna a lista todo do usuário
  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  // Busca o usuário na lista através de seu username e valida sua existência
  const { user } = request;
  // Recebe o title e o deadline do body
  const { title, deadline } = request.body;

  // Cria um novo objeto To Do
  // Obs: Deadline deve estar no formato ANO MES DIA
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  // Adiciona o objeto à lista do usuário
  user.todos.push(todo);

  // Retorna o objeto adicionado conforme orientado pelo desafio
  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  // Busca o usuário na lista através de seu username e valida sua existência
  const { user } = request;
  // Captura o id como parametro da rota
  const { id } = request.params;
  // Captura dados do body
  const { title, deadline } = request.body;

  // Encontra o To Do correspondente
  const todo = user.todos.find((todo) => todo.id === id);

  // Não permite atualizar o todo nao existente
  if (!todo) {
    return response.status(404).json({ error: "To Do not found!" });
  }

  // Faz as alterações
  todo.title = title;
  todo.deadline = new Date(deadline);

  // Confirma a ação
  return response.json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  // Busca o usuário na lista através de seu username e valida sua existência
  const { user } = request;
  // Captura o id como parametro da rota
  const { id } = request.params;

  // Encontra o To Do correspondente
  const todo = user.todos.find((todo) => todo.id === id);

  // Não permite atualizar o todo nao existente
  if (!todo) {
    return response.status(404).json({ error: "To Do Doesn't exist!" });
  }

  // Faz as alterações
  todo.done = true;

  // Confirma a ação
  return response.json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  // Busca o usuário na lista através de seu username e valida sua existência
  const { user } = request;
  // Captura o id como parametro da rota
  const { id } = request.params;

  // Localiza o To Do
  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  // Validação do To DO
  if (todoIndex === -1) {
    return response.status(404).json({ error: "To Do Doesn't exist!" });
  }

  // Encontra o To Do correspondente
  user.todos.splice(todoIndex, 1);

  // Confirma a ação
  return response.status(204).send();
});

module.exports = app;
