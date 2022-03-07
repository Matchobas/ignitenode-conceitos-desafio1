const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

// Middleware para checar se o usuário existe
function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => 
    user.username === username
  );

  if (!user) {
    return response.status(404).json({error: 'The account doesn\'t exist!'});
  }

  request.user = user;

  return next();
}

// Criar um novo usuário
app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userTaken = users.some((user) => 
    user.username === username
  );

  if (userTaken) {
    return response.status(400).json({error: 'This username is already taken'});
  }

  const newUser = {
    name,
    username,
    id: uuidv4(),
    todos: []
  }

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todoObject = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todoObject);

  return response.status(201).json(todoObject);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { deadline, title } = request.body;
  const { user } = request;
  
  const changedTodo = user.todos.find((todo) => {
    if (todo.id === id) {
      todo.deadline = new Date(deadline);
      todo.title = title;

      return todo
    }
  });

  if (!changedTodo) {
    return response.status(404).json({error: 'Theres is no TODO with this ID'});
  }

  return response.json(changedTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  
  const changedTodo = user.todos.find((todo) => {
    if (todo.id === id) {
      todo.done = true

      return todo
    }
  });

  if (!changedTodo) {
    return response.status(404).json({error: 'Theres is no TODO with this ID'});
  }

  return response.json(changedTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  
  const changedTodo = user.todos.find((todo) => 
    todo.id === id
  );

  if (!changedTodo) {
    return response.status(404).json({error: 'Theres is no TODO with this ID'});
  }

  user.todos.splice(changedTodo, 1);

  return response.status(204).send();
});

module.exports = app;