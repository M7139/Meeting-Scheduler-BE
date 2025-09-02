const Student = require('../models/Student')
const { upload } = require('../middleware')

// Get student profile
const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(res.locals.payload.id).select('-passwordDigest')
    if (!student)
      return res.status(404).send({ status: 'Error', msg: 'Student not found' })
    res.send(student)
  } catch (error) {
    res.status(500).send({ status: 'Error', msg: 'Failed to fetch student profile' })
  }
}
// Update profile
const updateStudentProfile = async (req, res) => {
  try {
    const updateData = { ...req.body }

    if (req.file) {
      updateData.profileImage = req.file.filename
    }

    const student = await Student.findByIdAndUpdate(
      res.locals.payload.id,
      updateData,
      { new: true }
    ).select('-passwordDigest')

    if (!student)
      return res.status(404).send({ status: 'Error', msg: 'Student not found' })

    res.send(student)
  } catch (error) {
    res.status(500).send({ status: 'Error', msg: 'Failed to update student profile' })
  }
}

// Delete student
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(res.locals.payload.id)
    if (!student)
      return res.status(404).send({ status: 'Error', msg: 'Student not found' })
    res.send({ status: 'Ok', msg: 'Student deleted' })
  } catch (error) {
    res.status(500).send({ status: 'Error', msg: 'Failed to delete student' })
  }
}

module.exports = {
  getStudentProfile,
  updateStudentProfile,
  deleteStudent
}
