const express = require('express')
const mustacheExpress = require('mustache-express')
const pgPromise = require('pg-promise')()
const robotDatabase = pgPromise({ database: 'robots' })
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')

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
app.use(bodyParser.urlencoded({ extended: false }))
app.use(expressValidator())

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
      .then(() => {
          response.redirect("/")
      })
        .catch(error => {
          const displayError = "Oops! Something went wrong!"
          response.render("index", {displayError})
      })
})

app.post('/new', (request, response) => {

  request.checkBody("username", "Invalid Username - Username cannot be blank").notEmpty()
  request.checkBody("name", "Invalid Username - Username cannot be blank").notEmpty()

  const errors = request.validationErrors()

  if (errors) {
    const displayError = "Invalid Username - Username and name cannot be blank"
    response.render("create", {displayError})
    return
  }

  const newRobot = {
    username: request.body.username,
    name: request.body.name,
    avatar: request.body.avatar,
    email: request.body.email,
    university: request.body.university,
    job: request.body.job,
    company: request.body.company,
    phone: request.body.phone,
    street_num: request.body.street_num,
    street_name: request.body.stret_name,
    city: request.body.city,
    state_or_province: request.body.state_or_province,
    postal_code: request.body.postal_code,
    country: request.body.country
  }
  const newSkills = request.body.skills.split(', ')

  robotDatabase.one(`INSERT INTO robots (username, name, avatar, email, university, job, company, phone, street_num,
      street_name, city, state_or_province, postal_code, country)
      VALUES($(username), $(name), $(avatar), $(email), $(university), $(job), $(company), $(phone),
      $(street_num), $(street_name), $(city), $(state_or_province), $(postal_code), $(country)) RETURNING id`,
      newRobot)
      .then(newRobotId => {
        newSkills.forEach(skill => {
          const newSkill = {
            skill: skill,
            robot_id: newRobotId.id
          }
        robotDatabase.none(`INSERT INTO skills (skill, robot_id)
            VALUES($(skill), $(robot_id))`, newSkill)
      })
    })
  response.redirect('/')
})

app.listen(3000, () => {
  console.log('All your requests are belong to me on port 3000')
})
