const Student = require('../models/Student')
const Booking = require('../models/Booking')
const middleware = require('../middleware')

//function to view the student profile
const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(res.locals.payload.id).select('-passwordDigest')
    if (!student) return res.status(404).send({ message: 'Student not found' })
    res.send(student)
  } catch (error) {
    res.status(500).send({ message: 'Error fetching student profile', error })
  }
}

// profile update function
const updateStudentProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body
    const updateFields = { name, email }

    // Handle password update if provided
    if (password) {
      const hashed = await middleware.hashPassword(password)
      updateFields.passwordDigest = hashed
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.user.id, 
      updateFields,
      { new: true }
    ).select('-passwordDigest')

    if (!updatedStudent) {
      return res.status(404).send({ status: 'Error', msg: 'Student not found' })
    }

    res.send(updatedStudent)
  } catch (error) {
    console.error(error)
    res.status(500).send({ status: 'Error', msg: 'Failed to update profile' })
  }
}


// delete student profile
const deleteStudent = async (req, res) => {
  try {
    const studentId = res.locals.payload.id
    const deleted = await Student.findByIdAndDelete(studentId)
    if (!deleted) return res.status(404).send({ message: 'Student not found' })
    res.send({ status: 'Ok', msg: 'Student account deleted' })
  } catch (error) {
    res.status(500).send({ message: 'Error deleting account', error })
  }
}


module.exports = {
  getStudentProfile,
  updateStudentProfile,
  deleteStudent,
  
}
