//imports
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()
//
const authRouter = require('./routes/authRouter')
const teacherRouter = require('./routes/teacherRouter')
const studentRouter = require('./routes/studentRouter')

// Initialize app
const app = express()

// Database Configuration
const db = require('./db')

// set Port Configuration
const port = process.env.PORT ? process.env.PORT : 3000

// Middlewares
app.use(express.json())
app.use(cors())
app.use(morgan('dev'))

// Root Route
app.get('/', (req, res) => {
  res.send('Your app is connected . . . ')
})

// Use Routers
app.use('/auth', authRouter)
app.use('/teachers', teacherRouter)
app.use('/students', studentRouter)

// Listener
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
