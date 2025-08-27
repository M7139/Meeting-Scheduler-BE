const router = require('express').Router()
const controller = require('../controllers/bookingController')
const middleware = require('../middleware')


router.post(
  '/',
  middleware.stripToken,
  middleware.verifyToken,
  controller.createBooking
)

router.get(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  controller.getBookingById
)

router.get(
  '/student/me',
  middleware.stripToken,
  middleware.verifyToken,
  controller.getStudentBookings
)

router.get(
  '/teacher/me',
  middleware.stripToken,
  middleware.verifyToken,
  controller.getTeacherBookings
)

router.put(
  '/:id',
  middleware.stripToken,
  middleware.verifyToken,
  controller.updateBooking
)
