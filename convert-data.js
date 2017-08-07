const data = require('./data.js')
const pgPromise = require('pg-promise')()
const database = pgPromise({ database: 'robots' })

//delete all table data
database.task('delete-table-data', task => {
      return task.batch([
          task.none(`DROP TABLE robots`),
          task.none(`DROP TABLE skills`)
      ])
    })
    .then(data => {
      console.log('Tables Dropped')
    })
    .catch(error => {
      console.log(error)
    })
//create tables
database.task('create-tables', task => {
      return task.batch([
          task.none(`CREATE TABLE robots (id serial primary key,
            username varchar(30) not null, "name" varchar(50),
            avatar varchar(100), email varchar(50), university varchar(100),
            job varchar(100), company varchar(100), phone varchar(30),
            street_num varchar(50), street_name varchar(50), city varchar(30),
            state_or_province varchar(50), postal_code varchar(15),
            country varchar(50));`),
          task.none(`CREATE TABLE skills (
            id serial primary key,
            skill varchar(30),
            robot_id integer not null);`)
      ])
    })
    .then(() => {
  //seed tables
      data.users.forEach(user => {
        const newRobot = {
          username: user.username,
          name: user.name,
          avatar: user.avatar,
          email: user.email,
          university: user.university,
          job: user.job,
          company: user.company,
          phone: user.phone,
          street_num: user.address.street_num,
          street_name: user.address.stret_name,
          city: user.address.city,
          state_or_province: user.address.state_or_province,
          postal_code: user.address.postal_code,
          country: user.address.country
        }
        console.log(`Creating DB record for ${newRobot.username}`)
      database
        .one(`INSERT INTO robots (username, name, avatar, email, university, job, company, phone, street_num,
          street_name, city, state_or_province, postal_code, country)
          VALUES($(username), $(name), $(avatar), $(email), $(university), $(job), $(company), $(phone),
          $(street_num), $(street_name), $(city), $(state_or_province), $(postal_code), $(country)) RETURNING id`,
          newRobot)
          .then(newRobot => {
            user.skills.forEach(skill => {
              const newSkill = {
                skill: skill,
                robot_id: newRobot.id
              }
              database
                .one(`INSERT INTO skills (skill, robot_id)
                  VALUES($(skill), $(robot_id)) RETURNING id`, newSkill)
            })
          })
        })
        console.log('Tables Seeded!')
     })
