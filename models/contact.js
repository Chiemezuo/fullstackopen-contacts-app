const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.connect(url)

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: function (v) {
        return /^[\d]{2}-\d{6,}$/g.test(v) || /^[\d]{3}-\d{5,}$/g.test(v)
      },
      message: props => `${props.value} is not a valid phone number`
    },
    required: [true, 'User phone number required']
  }
})

contactSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Contact = mongoose.model('Contact', contactSchema)

module.exports = Contact