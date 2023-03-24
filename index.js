const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
let contacts = require('./db.json')

const app = express()
const port = process.env.port || 3001

app.use(cors())
app.use(express.static('build'))

const generateId = () => {
  return Math.floor(Math.random() * 100001);
}

morgan.token('body', function (req, res) {
  return JSON.stringify(req.body)
})

app.use(express.json())
app.use(morgan(`:method :url :status :res[content-length] - :response-time ms :body`))

app.get('/api/persons', (req, res) => {
  res.json(contacts)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const contact = contacts.find(person => person.id === id)

  if (contact) {
    res.json(contact)
  } else {
    res.status(404).json({
      error: 'id not found'
    })
  }

})

app.get('/info', (req, res) => {
  const contactsCount = contacts.length
  const date = new Date()

  const str = `Phonebook has info for ${contactsCount}`

  res.send(`
    <div>
      <p>${str}</p>
      <p>${date}</p>
    </div>`
  )
})

app.post('/api/persons', (req, res) => {
  const payload = req.body

  if (!payload.name || !payload.number) {
    return res.status(400).json({
      error: "Name or number missing"
    })
  }

  const foundSameName = contacts.find(contact => contact.name.toLowerCase() === payload.name.toLowerCase())

  if (foundSameName) {
    return res.status(400).json({
      error: "name must be unique"
    })
  }

  const contact = {
    ...payload,
    id: generateId()
  }

  contacts = contacts.concat(contact)

  res.json(contact)
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  contacts = contacts.filter(contact => contact.id !== id)

  res.status(204).send()
})

const unknownEndpoint = (req, res, next) => {
  res.status(404).send({
    error: "unknown endpoint"
  })
}

app.use(unknownEndpoint)

app.listen(port, () => console.log('app is running on port', port))