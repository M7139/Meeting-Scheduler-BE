const Booking = require('../models/Booking')
const Teacher = require('../models/Teacher')

// Create a booking
const createBooking = async (req, res) => {
  try {
    const { teacherId, day, startTime, endTime } = req.body
    const studentId = res.locals.payload.id

    // Find teacher
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

    // Book it
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

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('teacher', 'name email department')
      .populate('student', 'name email')
    if (!booking)
      return res.status(404).send({ status: 'Error', msg: 'Booking not found' })
    res.send(booking)
  } catch (error) {
    res.status(500).send({ status: 'Error', msg: 'Failed to fetch booking' })
  }
}

// Get all student bookings
const getStudentBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      student: res.locals.payload.id
    }).populate('teacher', 'name email department')
    res.send(bookings)
  } catch (error) {
    res
      .status(500)
      .send({ status: 'Error', msg: 'Failed to fetch student bookings' })
  }
}

// Get all teacher bookings
const getTeacherBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      teacher: res.locals.payload.id
    }).populate('student', 'name email')
    res.send(bookings)
  } catch (error) {
    res
      .status(500)
      .send({ status: 'Error', msg: 'Failed to fetch teacher bookings' })
  }
}

// Update booking

const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)

    if (!booking) {
      return res.status(404).send({ status: 'Error', msg: 'Booking not found' })
    }

    // Ensure the logged-in student owns this booking
    if (booking.student.toString() !== req.user.id) {
      return res.status(403).send({ status: 'Error', msg: 'Not authorized' })
    }

    const { day, startTime, endTime, title, description } = req.body

    // If user is updating time/day, validate availability
    if (day || startTime || endTime) {
      const teacher = await Teacher.findById(booking.teacher)

      const isAvailable = teacher.availability.some((slot) => {
        return (
          slot.day === (day || booking.day) &&
          slot.startTime <= (startTime || booking.startTime) &&
          slot.endTime >= (endTime || booking.endTime)
        )
      })

      if (!isAvailable) {
        return res
          .status(400)
          .send({ status: 'Error', msg: 'This slot is not available' })
      }

      booking.day = day || booking.day
      booking.startTime = startTime || booking.startTime
      booking.endTime = endTime || booking.endTime
    }

    if (title !== undefined) booking.title = title
    if (description !== undefined) booking.description = description

    await booking.save()
    res.send(booking)
  } catch (error) {
    console.error(error)
    res.status(500).send({ status: 'Error', msg: 'Failed to update booking' })
  }
}

// Delete booking
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
    if (!booking)
      return res.status(404).send({ status: 'Error', msg: 'Booking not found' })

    // Only student or teacher can cancel
    if (
      booking.student.toString() !== res.locals.payload.id &&
      booking.teacher.toString() !== res.locals.payload.id
    ) {
      return res.status(403).send({ status: 'Error', msg: 'Not authorized' })
    }

    await booking.deleteOne()
    res.send({ status: 'Ok', msg: 'Booking cancelled' })
  } catch (error) {
    res.status(500).send({ status: 'Error', msg: 'Failed to delete booking' })
  }
}

module.exports = {
  createBooking,
  getBookingById,
  getStudentBookings,
  getTeacherBookings,
  updateBooking,
  deleteBooking
}
