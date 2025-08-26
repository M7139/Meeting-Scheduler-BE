const router = require('express').Router()
const controller = require('../controllers/teacherController')
const middleware = require('../middleware')


router.get('/', teacherController.getTeachers) 
router.get('/:id', teacherController.getTeacherById)

module.exports = router
