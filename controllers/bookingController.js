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

// Get the booking by it's id
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('teacher', 'name email department')
      .populate('student', 'name email')
    if (!booking) return res.status(404).send({ status: 'Error', msg: 'Booking not found' })
    res.send(booking)
  } catch (error) {
    res.status(500).send({ status: 'Error', msg: 'Failed to fetch booking' })
  }
}

// get all studnet bookings
const getStudentBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ student: req.user.id })
      .populate('teacher', 'name email department')
    res.send(bookings)
  } catch (error) {
    res.status(500).send({ status: 'Error', msg: 'Failed to fetch student bookings' })
  }
}
// get all teacher bookings
const getTeacherBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ teacher: req.user.id })
      .populate('student', 'name email')
    res.send(bookings)
  } catch (error) {
    res.status(500).send({ status: 'Error', msg: 'Failed to fetch teacher bookings' })
  }
}


// function to update the booking
const updateBooking = async (req, res) => {
  try {
    const { day, startTime, endTime } = req.body
    const booking = await Booking.findById(req.params.id)
    if (!booking) return res.status(404).send({ status: 'Error', msg: 'Booking not found' })

    // Only student who booked it can update
    if (booking.student.toString() !== req.user.id) {
      return res.status(403).send({ status: 'Error', msg: 'Not authorized' })
    }

    // Check teacher still has that slot
    const teacher = await Teacher.findById(booking.teacher)
    const isAvailable = teacher.availability.some(
      slot => slot.day === day && slot.startTime === startTime && slot.endTime === endTime
    )
    if (!isAvailable) {
      return res.status(400).send({ status: 'Error', msg: 'This slot is not available' })
    }

    // Check if already booked
    const existingBooking = await Booking.findOne({
      teacher: booking.teacher,
      day,
      startTime,
      endTime,
      _id: { $ne: booking._id }
    })
    if (existingBooking) {
      return res.status(400).send({ status: 'Error', msg: 'This slot is already booked' })
    }

    booking.day = day
    booking.startTime = startTime
    booking.endTime = endTime
    await booking.save()

    res.send(booking)
  } catch (error) {
    res.status(500).send({ status: 'Error', msg: 'Failed to update booking' })
  }
}




module.exports = {
  createBooking,
  getBookingById,
  getStudentBookings,
  getTeacherBookings,
  updateBooking,

}
