const Teacher = require('../models/Teacher')
const Booking = require('../models/Booking')



//get all teachers for students to browse
const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().select('name email department availableTimes')
    res.send(teachers)
  } catch (error) {
    res.status(500).send({ status: 'Error', msg: 'Failed to fetch teachers' })
  }
}

//get a specific teacher
const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params
    const teacher = await Teacher.findById(id).select('name email department availableTimes')
    if (!teacher) return res.status(404).send({ status: 'Error', msg: 'Teacher not found' })
    res.send(teacher)
  } catch (error) {
    res.status(500).send({ status: 'Error', msg: 'Failed to fetch teacher' })
  }
}


module.exports = {
  getTeachers,
  getTeacherById,
  
}