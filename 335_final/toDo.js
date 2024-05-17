const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Could not connect to MongoDB...', err));

// Define Schema and Model
const todoSchema = new mongoose.Schema({
  task: String,
});

const Todo = mongoose.model('Todo', todoSchema);

// Routes
app.get('/', async (req, res) => {
  const todos = await Todo.find();
  res.render('index', { todos });
});

app.post('/add', async (req, res) => {
  const { task } = req.body;
  const newTodo = new Todo({
    task,
  });
  await newTodo.save();
  res.redirect('/');
});

app.post('/suggest', async (req, res) => {
  try {
    const response = await axios.get('https://www.boredapi.com/api/activity');
    const suggestedActivity = response.data.activity;
    const newTodo = new Todo({
      task: suggestedActivity,
    });
    await newTodo.save();
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.redirect('/');
  }
});

app.post('/delete/:id', async (req, res) => {
    const { id } = req.params;
    await Todo.findByIdAndDelete(id);
    res.redirect('/');
  });
  

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
