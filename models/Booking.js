const mongoose = require('mongoose')
const { Schema } = require('mongoose')

const bookingSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    title: { type: String },
    description: { type: String }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Booking', bookingSchema)
