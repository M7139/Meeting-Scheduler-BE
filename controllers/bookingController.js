const Booking = require('../models/Booking')
const Teacher = require('../models/Teacher')
const Student = require('../models/Student')
const { sendEmail } = require('../middleware/mailer')

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

    // Populate teacher & student for emails
    await booking.populate('teacher', 'name email')
    await booking.populate('student', 'name email')

    // Send emails
    const studentEmail = booking.student.email
    const teacherEmail = booking.teacher.email

    // Email to student
    sendEmail({
      to: studentEmail,
      subject: 'Booking Confirmed',
      text: `You have successfully booked a meeting with ${booking.teacher.name} on ${day} from ${startTime} to ${endTime}.`,
      html: `<p>You have successfully booked a meeting with <b>${booking.teacher.name}</b> on <b>${day}</b> from <b>${startTime}</b> to <b>${endTime}</b>.</p>`
    })

    // Email to teacher
    sendEmail({
      to: teacherEmail,
      subject: 'New Booking Scheduled',
      text: `${booking.student.name} booked a meeting with you on ${day} from ${startTime} to ${endTime}.`,
      html: `<p><b>${booking.student.name}</b> booked a meeting with you on <b>${day}</b> from <b>${startTime}</b> to <b>${endTime}</b>.</p>`
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
      .populate('teacher', 'name email')
      .populate('student', 'name email')
    if (!booking)
      return res.status(404).send({ status: 'Error', msg: 'Booking not found' })

    if (booking.student.toString() !== req.user.id) {
      return res.status(403).send({ status: 'Error', msg: 'Not authorized' })
    }

    const { day, startTime, endTime, title, description } = req.body

    if (day || startTime || endTime) {
      const teacher = await Teacher.findById(booking.teacher._id)

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

    // Send update emails
    sendEmail({
      to: booking.student.email,
      subject: 'Booking Updated',
      text: `Your booking with ${booking.teacher.name} has been updated to ${booking.day} from ${booking.startTime} to ${booking.endTime}.`,
      html: `<p>Your booking with <b>${booking.teacher.name}</b> has been updated to <b>${booking.day}</b> from <b>${booking.startTime}</b> to <b>${booking.endTime}</b>.</p>`
    })

    sendEmail({
      to: booking.teacher.email,
      subject: 'Booking Updated',
      text: `${booking.student.name} updated their booking with you to ${booking.day} from ${booking.startTime} to ${booking.endTime}.`,
      html: `<p><b>${booking.student.name}</b> updated their booking with you to <b>${booking.day}</b> from <b>${booking.startTime}</b> to <b>${booking.endTime}</b>.</p>`
    })

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
      .populate('teacher', 'name email')
      .populate('student', 'name email');

    if (!booking) {
      return res.status(404).send({ status: 'Error', msg: 'Booking not found' });
    }

    // Only student or teacher can cancel
    const userId = res.locals.payload.id;
    if (booking.student._id.toString() !== userId && booking.teacher._id.toString() !== userId) {
      return res.status(403).send({ status: 'Error', msg: 'Not authorized' });
    }

    // Store emails before deletion
    const teacherEmail = booking.teacher.email;
    const studentEmail = booking.student.email;

    // Delete booking
    await booking.deleteOne();

    // Send cancellation emails (example)
    await sendEmail({
      to: teacherEmail,
      subject: 'Booking Cancelled',
      text: `Your meeting with ${booking.student.name} on ${booking.day} from ${booking.startTime} to ${booking.endTime} has been cancelled.`,
    });

    await sendEmail({
      to: studentEmail,
      subject: 'Booking Cancelled',
      text: `Your meeting with ${booking.teacher.name} on ${booking.day} from ${booking.startTime} to ${booking.endTime} has been cancelled.`,
    });

    // Respond with a simple message
    res.send({ status: 'Ok', msg: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).send({ status: 'Error', msg: 'Failed to cancel booking' });
  }
};


module.exports = {
  createBooking,
  getBookingById,
  getStudentBookings,
  getTeacherBookings,
  updateBooking,
  deleteBooking
}
