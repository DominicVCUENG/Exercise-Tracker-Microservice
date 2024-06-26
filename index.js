const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
const shortid = require('shortid');
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let users = [];
let exercises = [];

app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const _id = shortid.generate();

  const newUser = { username, _id };
  users.push(newUser);

  res.json(newUser);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = req.params._id;
  const { description, duration, date } = req.body;

  const user = users.find(u => u._id === userId);
  if (!user) {
      return res.status(404).json({ error: 'User not found' });
  }

  let exerciseDate = date ? new Date(date) : new Date();
  exerciseDate.setDate(exerciseDate.getDate() + 1);
  const newExercise = {
      userId,
      description,
      duration: parseInt(duration),
      date: exerciseDate.toDateString(),
      _id: shortid.generate(),
  };

  exercises.push(newExercise);

  res.json({
      _id: userId,
      username: user.username,
      date: newExercise.date,
      duration: newExercise.duration,
      description: newExercise.description,
  });
});

app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;

  const user = users.find(u => u._id === userId);
  if (!user) {
      return res.status(404).json({ error: 'User not found' });
  }

  let userExercises = exercises.filter(e => e.userId === userId);

  if (from) userExercises = userExercises.filter(e => new Date(e.date) >= new Date(from));
  if (to) userExercises = userExercises.filter(e => new Date(e.date) <= new Date(to));
  if (limit) userExercises = userExercises.slice(0, parseInt(limit));

  res.json({
      _id: userId,
      username: user.username,
      count: userExercises.length,
      log: userExercises.map(e => ({
          description: e.description,
          duration: e.duration,
          date: new Date(e.date).toDateString()
      }))
  });
});

app.get('/api/users', (req, res) => {
  res.json(users)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
