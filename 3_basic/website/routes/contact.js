var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('contact', { title: 'Contact' });
});

router.post('/send', function(req, res, next){
	var transporter = nodemailer.createTransport({
		service: 'Gmail',
		auth: {
			user: 'johndoe@gmail.com',
			pass: '******'
		}
	});

	var mailOptions = {
		form:  'John Doe <johndoe@gmail.com>',
		to: 'Jane Doe <janedoe@gmail.com>',
		subject: 'Hello',
		text: 'You have a new message with following details. Name: '  + req.body.name + ' Email: ' + req.body.email + ' Message: ' + req.body.message,
		
	} 

	transporter.sendMail(mailOptions, function(error, info){
		if(error){
			console.log(error);
			res.redirect('/');
		}
		else{
			console.log('Message Sent' + info.response);
			res.redirect('/');	
		}
	});

});

module.exports = router;
