const mongoose = require("mongoose")
const { Schema } = require("mongoose")

const bookingSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    teacher: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
    date: { type: Date, required: true },
    title: { type: String, required: true },
    description: { type: String }
  },
  { timestamps: true }
)

module.exports = mongoose.model("Booking", bookingSchema)
