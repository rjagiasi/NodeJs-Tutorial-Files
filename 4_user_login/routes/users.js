var express = require('express');
var router = express.Router();

var multer  = require('multer');
var upload = multer({ dest: 'images/uploads/' });

var User = require('../models/user');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
	res.render('register', {title: 'Register'})
});


router.get('/login', function(req, res, next) {
	res.render('login', {title: 'Login'})
});

router.post('/register', upload.single('profileImage'), function(req, res, next){

	//get form values
	var name = req.body.name,
	email = req.body.email,
	username = req.body.username,
	password = req.body.password,
	password2 = req.body.password2 ;

	if(req.file){
		console.log('Uploading Image...');

		//Image details
		var originalName 	= req.file.originalname,
		name 				= req.file.name,
		mimetype 			= req.file.mimetype,
		path 				= req.file.path,
		ext 				= req.file.extension,
		size 				= req.file.size;

		console.log(originalName);
	}
	else {
		// Set a default image

		var profileImageName = 'noImage.png';
	}

	req.checkBody('name', 'Name field is required').notEmpty();
	req.checkBody('email', 'Email field is required').notEmpty();
	req.checkBody('email', 'Not an Email').isEmail();
	req.checkBody('username', 'Username field is required').notEmpty();
	req.checkBody('password', 'Password field is required').notEmpty();
	req.checkBody('password2', 'Passwords didnt match').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors){
		res.render('register', {
			errors: errors,
			name: name,
			email: email,
			username: username,
			password: password,
			password2: password2
		});
	}
	else {
		var newUser = new User({
			name: name,
			email: email,
			username: username,
			password: password,
			profileImage: profileImageName
		});

		//Create User
		User.createUser(newUser, function (err, user) {
			if(err) throw err;
			console.log(user);
		});

		//Flash Message
		req.flash('success', 'You are now in registered and may log in');
		res.redirect('/');
	}
});

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.getUserById(id, function(err, user) {
		done(err, user);
	});
});

passport.use(new LocalStrategy(
	function(username, password, done){
		User.getUserByUsername(username, function(err, user) {
			if(err) throw err;
			if(!user){
				console.log('Unknown User');
				return done(null, false, {message: 'Unknown User'});
			}

			User.comparePassword(password, user.password, function(err, isMatch){
				if(err) throw err;
				if(isMatch){
					return done(null, user);
				} else {
					console.log('Invalid Password');
					return done(null, false, {message: 'Invalid Password'});
				}
			});
		});
	}
	));

router.post('/login', passport.authenticate('local', {failureRedirect: '/users/login', failureFlash: 'Invalid username or password.'}), function(req, res) {
	console.log('Authentication Successful');
	req.flash('Logged In Successfully');
	res.redirect('/');
});

// router.post('/login', function(req, res) {
// 	console.log('data', req.body);
// });

router.get('/logout', function(req, res){
	req.logout();
	req.flash('success', 'You have logged out');
	res.redirect('/users/login');
});

module.exports = router;
