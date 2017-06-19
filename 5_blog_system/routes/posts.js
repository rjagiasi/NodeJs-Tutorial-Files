var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var db = require('monk')('localhost/nodeblog');
var path = require('path');

var multer  = require('multer');

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/images/uploads/');
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + path.extname(file.originalname));
	}
});

var upload = multer({ storage: storage });

router.get('/show/:id', function (req, res, next) {
	var posts = db.get('posts');
	posts.findOne({_id: req.params.id}, {}, function (err, post) {
		res.render('show', {
			'post': post,
			'title': post.title
		});	
	});
});

router.get('/add', function (req, res, next) {
	var categories = db.get('categories');
	categories.find({}, {}, function(err, categories) {
		res.render('addpost', {
			title: 'Add Post',
			categories: categories
		});	
	});

	
});

router.post('/add', upload.single('mainimage'), function (req, res, next) {
	// get from values
	var title 		= req.body.title;
	var category 	= req.body.category;
	var body 		= req.body.body;
	var author 		= req.body.author;
	var date 		= new Date();

	if(req.file){
		console.log('Uploading Image...');

		//Image details
		var originalName 	= req.file.originalname,
		name 				= req.file.filename,
		mimetype 			= req.file.mimetype,
		path 				= req.file.path,
		ext 				= req.file.extension,
		size 				= req.file.size;

		console.log(originalName);
		console.log(name);

	}
	else {
		var name = 'noImage.png';
	}

	//Validation
	req.checkBody('title', 'Title field is required').notEmpty();
	req.checkBody('body', 'Body field is required').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		res.render('addposts',{
			'errors': errors,
			'title': title,
			'body': body
		});
	}
	else {
		var posts = db.get('posts');

		posts.insert({
			'title': title,
			'body': body,
			'category': category,
			'date': date,
			'author': author,
			'mainimage': name
		}, function(err, post){
			if(err){
				res.send('There was an issue submitting the post');
			} else {
				req.flash('success', 'Post Submitted');
				res.redirect('/');
			}
		});
	}
});

router.post('/addcomment', upload.single('mainimage'), function (req, res, next) {
	// get from values
	var email 		= req.body.email;
	var body 		= req.body.body;
	var name 		= req.body.name;
	var postid		= req.body.postid;
	var commentdate	= new Date();

	//Validation
	req.checkBody('name', 'Name field is required').notEmpty();
	req.checkBody('email', 'Email field is required').notEmpty();
	req.checkBody('email', 'Email is not formatted correctly').isEmail();
	req.checkBody('body', 'Body field is required').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		var posts = db.get('posts');
		posts.findOne({_id: postid}, {}, function (err, post) {
			res.render('show',{
				'errors': errors,
				'post': post,
				'title': post.title
			});
		});
	}
	else {
		
		var comment = {
			"name": name,
			"email": email,
			"body": body,
			"commentdate": commentdate 
		};

		var posts = db.get('posts');

		posts.update(
			{
				"_id": postid
			},
			{
				$push: {
					"comments": comment,
				}
			},
			function (err, doc) {
				if(err)
					throw err;
				else {
					req.flash('success', 'Comment Added');
					res.redirect('/posts/show/'+postid);
				}
			}
		);
	}
});

module.exports = router;
