const Student = require('../models/Student')
const Teacher = require('../models/Teacher')
const middleware = require('../middleware')

const RegisterStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body
    const profileImage = req.file ? req.file.filename : null

    const validation = middleware.validatePassword(password)
    if (!validation.valid) {
      return res.status(400).send({ status: 'Error', msg: validation.msg })
    }

    const passwordDigest = await middleware.hashPassword(password)

    const existingStudent = await Student.findOne({ email })
    if (existingStudent) {
      return res.status(400).send({
        status: 'Error',
        msg: 'A student with that email already exists'
      })
    }

    const student = await Student.create({
      name,
      email,
      passwordDigest,
      profileImage
    })

    res.send(student)
  } catch (error) {
    res.status(500).send({ status: 'Error', msg: error.message })
  }
}

const RegisterTeacher = async (req, res) => {
  try {
    const { name, email, password, department, office } = req.body
    const profileImage = req.file ? req.file.filename : null

    const validation = middleware.validatePassword(password)
    if (!validation.valid) {
      return res.status(400).send({ status: 'Error', msg: validation.msg })
    }

    const passwordDigest = await middleware.hashPassword(password)

    const existingTeacher = await Teacher.findOne({ email })
    if (existingTeacher) {
      return res.status(400).send({
        status: 'Error',
        msg: 'A teacher with that email already exists'
      })
    }

    const teacher = await Teacher.create({
      name,
      email,
      passwordDigest,
      department,
      office,
      profileImage
    })

    res.send(teacher)
  } catch (error) {
    res.status(500).send({ status: 'Error', msg: error.message })
  }
}

const Login = async (req, res) => {
  try {
    const { email, password } = req.body

    let user = await Student.findOne({ email })
    let type = 'student'

    if (!user) {
      user = await Teacher.findOne({ email })
      type = 'teacher'
    }

    if (!user) {
      return res.status(401).send({ status: 'Error', msg: 'Account not found' })
    }

    const matched = await middleware.comparePassword(
      password,
      user.passwordDigest
    )

    if (matched) {
      let payload = {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: type,
        profileImage: user.profileImage || null,
        department: type === 'teacher' ? user.department || '' : undefined,
        office: type === 'teacher' ? user.office || '' : undefined
      }
      let token = middleware.createToken(payload)
      return res.send({ user: payload, token })
    }
    res.status(401).send({ status: 'Error', msg: 'Unauthorized' })
  } catch (error) {
    res
      .status(500)
      .send({ status: 'Error', msg: 'An error has occurred when logging in!' })
  }
}

const CheckSession = async (req, res) => {
  const { payload } = res.locals

  if (payload.userType === 'teacher') {
    const teacher = await Teacher.findById(payload.id)
    payload.office = teacher.office || ''
    payload.department = teacher.department || ''
  }

  res.status(200).send(payload)
}

module.exports = {
  RegisterStudent,
  RegisterTeacher,
  Login,
  CheckSession
}
