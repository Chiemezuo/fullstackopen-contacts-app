const mongoose = require('mongoose')

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url =
  `mongodb+srv://Chiemezuo:${password}@cluster0.39zgztb.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.connect(url)

const contactSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Contact = mongoose.model('Contact', contactSchema)

if (name && number) {
  const newContact = new Contact({
    name,
    number
  })

  newContact.save().then(result => {
    console.log('contact saved', result)
    mongoose.connection.close()
  })

} else {
  Contact.find({}).then(result => {
    result.forEach(entry => console.log(entry))
    mongoose.connection.close()
  })
}