const express = require('express');
const router = express.Router();
const usercontroller = require('./../controllers/user');


router.post('/register',usercontroller.register);

router.post('/login',usercontroller.login);

router.post('/logout',usercontroller.logout);

router.post('/emailactivate',usercontroller.activate);

router.post('/forgot',usercontroller.forgotpass);

router.post('/reset',usercontroller.resetpass);


module.exports=router;