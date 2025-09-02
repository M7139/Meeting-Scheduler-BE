const router = require('express').Router()
const controller = require('../controllers/authController')
const middleware = require('../middleware')

// Student Registration
router.post('/register/student', middleware.upload.single("profileImage"), controller.RegisterStudent)

// Teacher Registration
router.post('/register/teacher', middleware.upload.single("profileImage") , controller.RegisterTeacher)

// Login (works for both student + teacher)
router.post('/login', controller.Login)

// Check Session (requires valid token)
router.get(
  '/session',
  middleware.stripToken,
  middleware.verifyToken,
  controller.CheckSession
)

module.exports = router
