const Student = require('../models/Student')
const Teacher = require('../models/Teacher')
const middleware = require('../middleware')

// Student Registration
const RegisterStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body

    const validation = middleware.validatePassword(password)
    if (!validation.valid) {
      return res.status(400).send({ status: 'Error', msg: validation.msg })
    }

    let passwordDigest = await middleware.hashPassword(password)

    let existingStudent = await Student.findOne({ email })
    if (existingStudent) {
      return res
        .status(400)
        .send('A student with that email has already been registered!')
    } else {
      const student = await Student.create({
        name,
        email,
        passwordDigest
      })
      res.send(student)
    }
  } catch (error) {
    throw error
  }
}

// Teacher Registration
const RegisterTeacher = async (req, res) => {
  try {
    const { name, email, password, department, office } = req.body

    const validation = middleware.validatePassword(password)
    if (!validation.valid) {
      return res.status(400).send({ status: 'Error', msg: validation.msg })
    }

    let passwordDigest = await middleware.hashPassword(password)

    let existingTeacher = await Teacher.findOne({ email })
    if (existingTeacher) {
      return res
        .status(400)
        .send('A teacher with that email has already been registered!')
    } else {
      const teacher = await Teacher.create({
        name,
        email,
        passwordDigest,
        department,
        office
      })
      res.send(teacher)
    }
  } catch (error) {
    throw error
  }
}

// Combined Login
const Login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Try Student collection first
    let user = await Student.findOne({ email })
    let type = 'student'

    // If not found in Student, try Teacher
    if (!user) {
      user = await Teacher.findOne({ email })
      type = 'teacher'
    }

    if (!user) {
      return res.status(401).send({ status: 'Error', msg: 'Account not found' })
    }

    let matched = await middleware.comparePassword(
      password,
      user.passwordDigest
    )

    if (matched) {
      let payload = {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: type
      }
      let token = middleware.createToken(payload)
      return res.send({ user: payload, token })
    }
    res.status(401).send({ status: 'Error', msg: 'Unauthorized' })
  } catch (error) {
    res
      .status(401)
      .send({ status: 'Error', msg: 'An error has occurred when logging in!' })
  }
}

const CheckSession = async (req, res) => {
  const { payload } = res.locals
  res.status(200).send(payload)
}

module.exports = {
  RegisterStudent,
  RegisterTeacher,
  Login,
  CheckSession
}
