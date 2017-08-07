const express = require('express')
const mustacheExpress = require('mustache-express')
const pgPromise = require('pg-promise')()
const robotDatabase = pgPromise({ database: 'robots' })

// create table robots (
// id serial primary key,
// username varchar(30) not null,
// "name" varchar(50),
// avatar varchar(100),
// email varchar(50),
// university varchar(100),
// job varchar(100),
// company varchar(100),
// phone varchar(30),
// street_num varchar(50),
// street_name varchar(50),
// city varchar(30),
// state_or_province varchar(50),
// postal_code varchar(15),
// country varchar(50));
//
// create table skills (
// id serial primary key,
// skill varchar(30),
// robot_id integer not null);

const app = express()

app.use(express.static('public'))

app.engine('mst', mustacheExpress())
app.set('views', './templates')
app.set('view engine', 'mst')

app.get('/', (request, response) => {

robotDatabase.any(`SELECT * from robots`).then(robots => {
    response.render('index', { robots })
  })
})

app.get('/create', (request, response) => {
  response.render('create')
})

app.use(express.static('public'))

app.get('/users/:id', (request, response) => {
  const id = parseInt(request.params.id)

  robotDatabase.task('get-robot-skills', task => {
        return task.batch([
            task.one('SELECT * FROM robots WHERE id = $(id)', { id: id }),
            task.any(`SELECT * from skills WHERE robot_id = $(id)`, {id: id})
        ])
      })
      .then(data => {
          const robot = data[0]
          const skills = data[1]
          response.render("user", {robot, skills})
      })
        .catch(error => {
          const displayError = "Sorry that user does not exist!"
          response.render("user", { displayError })
      })
})

app.post('/delete/:id', (request, response) => {
  const id = parseInt(request.params.id)

  robotDatabase.task('delete-robot-and-skills', task => {
        return task.batch([
            task.none('DELETE FROM robots WHERE id = $(id)', { id: id }),
            task.none(`DELETE FROM skills WHERE robot_id = $(id)`, {id: id})
        ])
      })
      .then(data => {
          const robot = data[0]
          const skills = data[1]
          response.redirect("/")
      })
        .catch(error => {
          const displayError = "Oops! Something wen't wrong!"
          response.render("index", {displayError})
      })
})

app.listen(3000, () => {
  console.log('All your requests are belong to me on port 3000')
})
