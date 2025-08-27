const Teacher = require('../models/Teacher')
const Booking = require('../models/Booking')
const middleware = require('../middleware')

//get all teachers for students to browse
const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().select(
      'name email department availableTimes'
    )
    res.send(teachers)
  } catch (error) {
    res.status(500).send({ status: 'Error', msg: 'Failed to fetch teachers' })
  }
}

//get a specific teacher
const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params
    const teacher = await Teacher.findById(id).select(
      'name email department availableTimes'
    )
    if (!teacher)
      return res.status(404).send({ status: 'Error', msg: 'Teacher not found' })
    res.send(teacher)
  } catch (error) {
    res.status(500).send({ status: 'Error', msg: 'Failed to fetch teacher' })
  }
}

// get all teachers available times
const getTeacherAvailability = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).select("name availability")
    if (!teacher) return res.status(404).send({ status: "Error", msg: "Teacher not found" })
    res.send(teacher.availability)
  } catch (error) {
    res.status(500).send({ status: "Error", msg: "Failed to fetch availability" })
  }
}

//function to view the teachers profile
const getTeacherProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id).select(
      '-passwordDigest'
    )
    if (!teacher)
      return res.status(404).send({ status: 'Error', msg: 'Teacher not found' })
    res.send(teacher)
  } catch (error) {
    res.status(500).send({ status: 'Error', msg: 'Failed to fetch profile' })
  }
}


// profile update function
const updateTeacherProfile = async (req, res) => {
  try {
    const { name, email, department, office, password } = req.body
    const updateFields = { name, email, department, office }

    // Handle password update if provided
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


//delete account function

const deleteTeacher = async (req, res) => {
  try {
    const deleted = await Teacher.findByIdAndDelete(req.user.id)
    if (!deleted) return res.status(404).send({ status: 'Error', msg: 'Teacher not found' })
    res.send({ status: 'Ok', msg: 'Teacher account deleted' })
  } catch (error) {
    res.status(500).send({ status: 'Error', msg: 'Failed to delete account' })
  }
}


// add available times
const addAvailability = async (req, res) => {
  try {
    const { availability } = req.body // array of {day, startTime, endTime}
    const teacher = await Teacher.findById(req.user.id)

    if (!teacher) {
      return res.status(404).send({ status: "Error", msg: "Teacher not found" })
    }

    teacher.availability.push(...availability) 
    await teacher.save()

    res.send(teacher)
  } catch (error) {
    console.error(error)
    res.status(500).send({ status: "Error", msg: "Failed to add availability" })
  }
}

// update times
const updateAvailability = async (req, res) => {
  try {
    const { index, day, startTime, endTime } = req.body
    const teacher = await Teacher.findById(req.user.id)

    if (!teacher) {
      return res.status(404).send({ status: "Error", msg: "Teacher not found" })
    }

    if (teacher.availability[index]) {
      teacher.availability[index] = { day, startTime, endTime }
      await teacher.save()
      res.send(teacher)
    } else {
      res.status(400).send({ status: "Error", msg: "Invalid index" })
    }
  } catch (error) {
    console.error(error)
    res.status(500).send({ status: "Error", msg: "Failed to update availability" })
  }
}

// delete times
const deleteAvailability = async (req, res) => {
  try {
    const { index } = req.body
    const teacher = await Teacher.findById(req.user.id)

    if (!teacher) {
      return res.status(404).send({ status: "Error", msg: "Teacher not found" })
    }

    if (teacher.availability[index]) {
      teacher.availability.splice(index, 1) // remove slot
      await teacher.save()
      res.send(teacher)
    } else {
      res.status(400).send({ status: "Error", msg: "Invalid index" })
    }
  } catch (error) {
    console.error(error)
    res.status(500).send({ status: "Error", msg: "Failed to delete availability" })
  }
}



module.exports = {
  getTeachers,
  getTeacherById,
  getTeacherProfile,
  updateTeacherProfile,
  deleteTeacher,
  addAvailability,
  updateAvailability,
  deleteAvailability,
  getTeacherAvailability,
}
