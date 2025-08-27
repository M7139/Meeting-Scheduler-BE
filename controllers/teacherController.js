const Teacher = require('../models/Teacher')
const middleware = require('../middleware')

//Get all teachers (for students to browse)

const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().select(
      'name email department availability'
    )
    res.send(teachers)
  } catch (error) {
    console.error(error)
    res.status(500).send({ status: 'Error', msg: 'Failed to fetch teachers' })
  }
}

// Get a specific teacher by ID

const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params
    const teacher = await Teacher.findById(id).select(
      'name email department availability'
    )
    if (!teacher)
      return res.status(404).send({ status: 'Error', msg: 'Teacher not found' })
    res.send(teacher)
  } catch (error) {
    console.error(error)
    res.status(500).send({ status: 'Error', msg: 'Failed to fetch teacher' })
  }
}

// Get only a teacher's availability
const getTeacherAvailability = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).select(
      'name availability'
    )
    if (!teacher)
      return res.status(404).send({ status: 'Error', msg: 'Teacher not found' })
    res.send(teacher.availability)
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .send({ status: 'Error', msg: 'Failed to fetch availability' })
  }
}

// Get the logged-in teacher's own profile
const getTeacherProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id).select(
      '-passwordDigest'
    )
    if (!teacher)
      return res.status(404).send({ status: 'Error', msg: 'Teacher not found' })
    res.send(teacher)
  } catch (error) {
    console.error(error)
    res.status(500).send({ status: 'Error', msg: 'Failed to fetch profile' })
  }
}

//Update the logged-in teacher's own profile
const updateTeacherProfile = async (req, res) => {
  try {
    const { name, email, department, office, password } = req.body
    const updateFields = { name, email, department, office }

    if (password) {
      const hashed = await middleware.hashPassword(password)
      updateFields.passwordDigest = hashed
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true }
    ).select('-passwordDigest')

    if (!updatedTeacher) {
      return res.status(404).send({ status: 'Error', msg: 'Teacher not found' })
    }

    res.send(updatedTeacher)
  } catch (error) {
    console.error(error)
    res.status(500).send({ status: 'Error', msg: 'Failed to update profile' })
  }
}

// Delete the logged-in teacher's account
const deleteTeacher = async (req, res) => {
  try {
    const deleted = await Teacher.findByIdAndDelete(req.user.id)
    if (!deleted)
      return res.status(404).send({ status: 'Error', msg: 'Teacher not found' })
    res.send({ status: 'Ok', msg: 'Teacher account deleted' })
  } catch (error) {
    console.error(error)
    res.status(500).send({ status: 'Error', msg: 'Failed to delete account' })
  }
}

// Add availability slots

const addAvailability = async (req, res) => {
  try {
    const { availability } = req.body
    const teacher = await Teacher.findById(req.user.id)

    if (!teacher) {
      return res.status(404).send({ status: 'Error', msg: 'Teacher not found' })
    }

    teacher.availability.push(...availability)
    await teacher.save()

    res.send(teacher)
  } catch (error) {
    console.error(error)
    res.status(500).send({ status: 'Error', msg: 'Failed to add availability' })
  }
}

//Update an availability slot by index
const updateAvailability = async (req, res) => {
  try {
    const { index, day, startTime, endTime } = req.body
    const teacher = await Teacher.findById(req.user.id)

    if (!teacher) {
      return res.status(404).send({ status: 'Error', msg: 'Teacher not found' })
    }

    if (teacher.availability[index]) {
      teacher.availability[index] = { day, startTime, endTime }
      await teacher.save()
      res.send(teacher)
    } else {
      res.status(400).send({ status: 'Error', msg: 'Invalid index' })
    }
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .send({ status: 'Error', msg: 'Failed to update availability' })
  }
}

// Delete an availability slot by index
const deleteAvailability = async (req, res) => {
  try {
    const { index } = req.body
    const teacher = await Teacher.findById(req.user.id)

    if (!teacher) {
      return res.status(404).send({ status: 'Error', msg: 'Teacher not found' })
    }

    if (teacher.availability[index]) {
      teacher.availability.splice(index, 1)
      await teacher.save()
      res.send(teacher)
    } else {
      res.status(400).send({ status: 'Error', msg: 'Invalid index' })
    }
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .send({ status: 'Error', msg: 'Failed to delete availability' })
  }
}

module.exports = {
  getTeachers,
  getTeacherById,
  getTeacherAvailability,
  getTeacherProfile,
  updateTeacherProfile,
  deleteTeacher,
  addAvailability,
  updateAvailability,
  deleteAvailability
}
