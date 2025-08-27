const Booking = require('../models/Booking')
const Teacher = require('../models/Teacher')
const Student = require('../models/Student')

//Create a booking
const createBooking = async (req, res) => {
  try {
    const { teacherId, day, startTime, endTime } = req.body
    const studentId = req.user.id

    //Find teacher
    const teacher = await Teacher.findById(teacherId)
    if (!teacher)
      return res.status(404).send({ status: 'Error', msg: 'Teacher not found' })

    // Check if time slot is available
    const isAvailable = teacher.availability.some(
      (slot) =>
        slot.day === day &&
        slot.startTime === startTime &&
        slot.endTime === endTime
    )
    if (!isAvailable) {
      return res
        .status(400)
        .send({ status: 'Error', msg: 'This slot is not available' })
    }

    // Check if it's already booked
    const existingBooking = await Booking.findOne({
      teacher: teacherId,
      day,
      startTime,
      endTime
    })
    if (existingBooking) {
      return res
        .status(400)
        .send({ status: 'Error', msg: 'This slot is already booked' })
    }

    //Book it
    const booking = await Booking.create({
      teacher: teacherId,
      student: studentId,
      day,
      startTime,
      endTime
    })

    res.status(201).send(booking)
  } catch (error) {
    console.error(error)
    res.status(500).send({ status: 'Error', msg: 'Failed to create booking' })
  }
}

module.exports = {
  createBooking
}
