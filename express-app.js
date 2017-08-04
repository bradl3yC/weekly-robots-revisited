const express = require('express')
const mustacheExpress = require('mustache-express')
const data = require('./data.js')
const pgPromise = require('pg-promise')()
const robotDatabase = pgPromise({ database: 'robots' })
const skillsDatabase = pgPromise({database: 'skills'})
// create table robots (
// .......................... id serial primary key,
// .......................... username varchar(30) not null,
// .......................... "name" varchar(50),
// .......................... avatar varchar(100),
// .......................... email varchar(50),
// .......................... university varchar(100),
// .......................... job varchar(100),
// .......................... company varchar(100),
// .......................... phone varchar(30),
// .......................... street_num varchar(50),
// .......................... street_name varchar(50),
// .......................... city varchar(30),
// .......................... state_or_province varchar(50),
// .......................... postal_code varchar(15),
// .......................... country varchar(50));
//
// create table skills (
// .......................... id serial primary key,
// .......................... skill varchar(30),
// .......................... robot_id integer not null);

const app = express()

app.use(express.static('public'))

app.engine('mst', mustacheExpress())
app.set('views', './templates')
app.set('view engine', 'mst')

app.get('/', (request, response) => {

  robotDatabase.any(`SELECT * from "robots"`).then(robot => {
    const robots = {
      username: robot.username,
      name: robot.name,
      avatar: robot.avatar,
      email: robot.email,
      university: robot.university,
      job: robot.job,
      company: robot.company,
      phone: robot.phone,
      street_num: robot.street_num,
      street_name: robot.stret_name,
      city: robot.city,
      state_or_province: robot.state_or_province,
      postal_code: robot.postal_code,
      country: robot.country
    }
    console.log(robot.robot.avatar)
    // skillsDatabase.any('SELECT * from "skills" WHERE robot_id = $(robot.id)')

  })

  response.render('index', data)
})

app.use(express.static('public'))
app.get('/users/:id', (request, response) => {
  const userData = data.users[request.params.id - 1]
  response.render('user', userData)
})


app.listen(3000, () => {
  console.log('All your requests are belong to me on port 3000')
})