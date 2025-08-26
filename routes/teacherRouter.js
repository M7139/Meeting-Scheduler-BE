const router = require('express').Router()
const controller = require('../controllers/teacherController')
const middleware = require('../middleware')

//these routes can be viewed by anyone
router.get('/', controller.getTeachers)
router.get('/:id', controller.getTeacherById)

//these routes are protected

router.get(
  '/profile/me',
  middleware.stripToken,
  middleware.verifyToken,
  controller.getTeacherProfile
)

router.put(
  '/profile/update',
  middleware.stripToken,
  middleware.verifyToken,
  controller.updateTeacherProfile
)

module.exports = router
