const router = require('express').Router()
const controller = require('../controllers/studentController')
const middleware = require('../middleware')


router.get(
  "/profile/me",
  middleware.stripToken,
  middleware.verifyToken,
  controller.getStudentProfile
)

router.put(
  "/profile/me",
  middleware.stripToken,
  middleware.verifyToken,
  controller.updateStudentProfile
)

router.delete(
  "/profile/me",
  middleware.stripToken,
  middleware.verifyToken,
  controller.deleteStudent
)

module.exports = router