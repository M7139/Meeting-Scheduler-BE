const router = require('express').Router()
const controller = require('../controllers/teacherController')
const middleware = require('../middleware')

//these routes can be viewed by anyone
router.get('/', controller.getTeachers)
router.get('/:id', controller.getTeacherById)
router.get('/:id/availability', controller.getTeacherAvailability)

//these routes are protected

router.get(
  '/profile/me',
  middleware.stripToken,
  middleware.verifyToken,
  controller.getTeacherProfile
)

router.put(
  '/profile/me',
  middleware.stripToken,
  middleware.verifyToken,
  controller.updateTeacherProfile
)

router.delete(
  '/profile/me',
  middleware.stripToken,
  middleware.verifyToken,
  controller.deleteTeacher
)

router.post(
  '/availability',
  middleware.stripToken,
  middleware.verifyToken,
  controller.addAvailability
)

router.put(
  '/availability',
  middleware.stripToken,
  middleware.verifyToken,
  controller.updateAvailability
)

router.delete(
  '/availability',
  middleware.stripToken,
  middleware.verifyToken,
  controller.deleteAvailability
)

module.exports = router
