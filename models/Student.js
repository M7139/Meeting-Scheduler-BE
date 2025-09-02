const mongoose = require("mongoose")
const { Schema } = require("mongoose")

const studentSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordDigest: { type: String, required: true },
    profileImage: { type: String }
  },
  
  { timestamps: true }
)

module.exports = mongoose.model("Student", studentSchema)