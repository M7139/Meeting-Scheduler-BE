const Teacher = require('../models/Teacher')
const middleware = require('../middleware')
const Booking = require('../models/Booking')
const { sendEmail } = require('../middleware/mailer')

//Get all teachers (for students to browse)

const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().select(
      'name email department availability profileImage'
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

    const bookings = await Booking.find({ teacher: teacher._id })

    const freeSlots = teacher.availability.filter((slot) => {
      return !bookings.some(
        (booking) =>
          booking.day === slot.day &&
          booking.startTime === slot.startTime &&
          booking.endTime === slot.endTime
      )
    })

    res.send(freeSlots)
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .send({ status: 'Error', msg: 'Failed to fetch availability' })
  }
}

// Get logged-in teacher profile
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

// Update logged-in teacher profile
const updateTeacherProfile = async (req, res) => {
  try {
    const { name, email, department, office, password } = req.body
    const updateFields = { name, email, department, office }

    // Handle password change
    if (password) {
      const hashed = await middleware.hashPassword(password)
      updateFields.passwordDigest = hashed
    }

    // Handle profile image upload
    if (req.file) {
      updateFields.profileImage = req.file.filename
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true }
    ).select('-passwordDigest')

    if (!updatedTeacher)
      return res.status(404).send({ status: 'Error', msg: 'Teacher not found' })

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

// Update availability by slotId
const updateAvailability = async (req, res) => {
  const { slotId, day, startTime, endTime } = req.body

  try {
    // Find teacher
    const teacher = await Teacher.findById(req.user.id)
    if (!teacher)
      return res.status(404).send({ status: 'Error', msg: 'Teacher not found' })

    // Find the slot
    const slot = teacher.availability.id(slotId)
    if (!slot)
      return res.status(404).send({ status: 'Error', msg: 'Slot not found' })

    // Save old slot info
    const oldDay = slot.day
    const oldStartTime = slot.startTime
    const oldEndTime = slot.endTime

    // Update slot
    slot.day = day
    slot.startTime = startTime
    slot.endTime = endTime
    await teacher.save()

    // Update bookings that match old slot
    const bookings = await Booking.find({
      teacher: req.user.id,
      day: oldDay,
      startTime: oldStartTime,
      endTime: oldEndTime
    }).populate('student', 'name email')

    for (const booking of bookings) {
      booking.day = day
      booking.startTime = startTime
      booking.endTime = endTime
      await booking.save()

      // Send email to student about updated slot
      await sendEmail({
        to: booking.student.email,
        subject: 'Meeting Updated',
        text: `Hi ${booking.student.name}, your meeting with ${teacher.name} has been updated to ${day} from ${startTime} to ${endTime}.`,
        html: `<p>Hi ${booking.student.name},</p><p>Your meeting with <strong>${teacher.name}</strong> has been updated to <strong>${day}</strong> from <strong>${startTime} to ${endTime}</strong>.</p>`
      })
    }

    res.send(teacher)
  } catch (error) {
    console.error('Error updating availability slot:', error)
    res
      .status(500)
      .send({ status: 'Error', msg: 'Failed to update availability' })
  }
}

// delete availability by slotId
const deleteAvailability = async (req, res) => {
  try {
    const { slotId } = req.params

    // Find teacher
    const teacher = await Teacher.findById(req.user.id)
    if (!teacher)
      return res.status(404).send({ status: 'Error', msg: 'Teacher not found' })

    // Find the slot index
    const slotIndex = teacher.availability.findIndex(
      (slot) => slot._id.toString() === slotId
    )
    if (slotIndex === -1)
      return res.status(404).send({ status: 'Error', msg: 'Slot not found' })

    // Save slot info to notify students
    const { day, startTime, endTime } = teacher.availability[slotIndex]

    // Remove slot
    teacher.availability.splice(slotIndex, 1)
    await teacher.save()

    // Find bookings for this slot
    const bookings = await Booking.find({
      teacher: req.user.id,
      day,
      startTime,
      endTime
    }).populate('student', 'name email')

    // Notify students and delete bookings
    for (const booking of bookings) {
      await sendEmail({
        to: booking.student.email,
        subject: 'Meeting Cancelled',
        text: `Hi ${booking.student.name}, your meeting with ${teacher.name} on ${day} from ${startTime} to ${endTime} has been cancelled.`,
        html: `<p>Hi ${booking.student.name},</p><p>Your meeting with <strong>${teacher.name}</strong> on <strong>${day}</strong> from <strong>${startTime} to ${endTime}</strong> has been cancelled.</p>`
      })

      await booking.deleteOne()
    }

    res.send(teacher)
  } catch (error) {
    console.error('Error deleting availability slot:', error)
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
