require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Contact = require('./models/contact')
let contacts = require('./db.json')

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.static('build'))

morgan.token('body', function (req, res) {
  return JSON.stringify(req.body)
})

app.use(express.json())
app.use(morgan(`:method :url :status :res[content-length] - :response-time ms :body`))

app.get('/api/persons', (req, res) => {
  Contact.find({}).then(
    contact => {
      console.log('getting contact...')
      res.json(contact)
    }
  )
})

app.get('/api/persons/:id', (req, res) => {
  Contact.findById(req.params.id).then(contact => {
    if (contact) {
      res.json(contact)
    } else {
      res.status(404).json({
        error: 'id not found'
      })
    }
  })
})

app.put('/api/persons/:id', (req, res, next) => {
  Contact.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true })
    .then(updatedContact => {
      res.json(updatedContact)
      return updatedContact
    })
    .catch(error => next(error))
})

app.get('/info', (req, res) => {
  Contact.find({}).estimatedDocumentCount().then(num => {
    const contactsCount = num
    const date = new Date()

    const str = `Phonebook has info for ${contactsCount}`

    res.send(`
    <div>
      <p>${str}</p>
      <p>${date}</p>
    </div>`
    )
  })
})

app.post('/api/persons', (req, res) => {
  const payload = req.body

  const contact = new Contact({ ...payload })
  contact.save()
    .then(response => {
      res.json(contact)
    })
    .catch(error => {
      if (error.code === 11000) {
        res.status(400).json({ error: "User already exists" })
      } else if (error.errors.name) {
        res.status(400).json({ error: error.errors.name.message })
      } else if (error.errors.number) {
        res.status(400).json({ error: error.errors.number.message })
      }
    })
})

app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id
  Contact.findByIdAndRemove(id)
    .then(deleted => {
      res.status(204).send()
      console.log(deleted)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (req, res, next) => {
  res.status(404).send({
    error: "unknown endpoint"
  })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.log(error.message)

  next(error)
}

app.use(errorHandler)

app.listen(port, () => console.log('app is running on port', port))