const mongoose = require("mongoose")
const { Schema } = require("mongoose")

const teacherSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordDigest: { type: String, required: true },

    department: { type: String, required: true },
    office: { type: String },

    availability: [
      {
        day: { type: String },       
        startTime: { type: String }, 
        endTime: { type: String }    
      }
    ]
  },
  { timestamps: true }
)

module.exports = mongoose.model("Teacher", teacherSchema)
