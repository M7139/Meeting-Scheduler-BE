require('dotenv').config()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS)
const APP_SECRET = process.env.APP_SECRET

const hashPassword = async (password) => {
  // Accepts a password from the request body
  let hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
  // Creates a hashed password and encrypts it 12 times
  return hashedPassword
}

const comparePassword = async (password, storedPassword) => {
  // Accepts the password provided in the login request and the currently stored password
  // Compares the two passwords for a match
  let passwordMatch = await bcrypt.compare(password, storedPassword)
  // Returns true if the passwords match
  // Returns false if the passwords are not a match
  return passwordMatch
}

const createToken = (payload) => {
  // Accepts a payload with which to create the token
  let token = jwt.sign(payload, APP_SECRET)
  // Generates the token and encrypts it, returns the token when the process finishes
  return token
}

const stripToken = (req, res, next) => {
  try {
    const token = req.headers['authorization'].split(' ')[1]
    // Gets the token from the request headers {authorization: Bearer Some-Token}
    // Splits the value of the authorization header
    if (token) {
      res.locals.token = token
      // If the token exists we add it to the request lifecycle state
      return next()
    }
    res.status(401).send({ status: 'Error', msg: 'Unauthorized' })
  } catch (error) {
    res.status(401).send({ status: 'Error', msg: 'Strip Token Error!' })
  }
}

const verifyToken = (req, res, next) => {
  const { token } = res.locals
  // Gets the token stored in the request lifecycle state
  try {
    let payload = jwt.verify(token, APP_SECRET)

    // Verifies the token is legit
    if (payload) {
      res.locals.payload = payload // Passes the decoded payload to the next function
      req.user = {
        id: payload.id,
        email: payload.email,
        userType: payload.userType
      }
      return next()
    }
    res.status(401).send({ status: 'Error', msg: 'Unauthorized' })
  } catch (error) {
    res.status(401).send({ status: 'Error', msg: 'Verify Token Error!' })
  }
}
// I looked up this to figure out how to use .test https://stackoverflow.com/questions/12090077/javascript-regular-expression-password-validation-having-special-characters
const validatePassword = (password) => {
  console.log(password)
  try {
    const pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/
    if (!pattern.test(password)) {
      return {
        valid: false,
        msg: 'Password must be at least 8 characters long and include uppercase letters, lowercase letters, and numbers.'
      }
    }
    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      msg: 'Password validation error!'
    }
  }
}

module.exports = {
  hashPassword,
  comparePassword,
  createToken,
  stripToken,
  verifyToken,
  validatePassword
}
