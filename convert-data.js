const data = require('./data.js')
const pgPromise = require('pg-promise')()

const database = pgPromise({ database: 'robots' })

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

  database
    .one(`INSERT INTO "robots" (username, name, avatar, email, university, job, company, phone, street_num,
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
          .one(`INSERT INTO "skills" (skill, robot_id)
          VALUES($(skill), $(robot_id)) RETURNING id`, newSkill)
      })
    })
})