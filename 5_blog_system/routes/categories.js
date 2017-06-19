var express = require('express');
var router = express.Router();

var mongodb = require('mongodb');
var db =  require('monk')('localhost/nodeblog');

router.get('/show/:category', function (req, res, next) {
	var posts = db.get('posts');
	posts.find({category: req.params.category}, {}, function (err, posts) {
		res.render('index', {
			'posts': posts,
			'title' : req.params.category
		});
	});
});

// Homepage Blog Posts
router.get('/add', function(req, res, next) {
	res.render('addcategory', {
		'title': 'Add Category'
	});
});

router.post('/add', function (req, res, next) {
	// get from values
	var title 		= req.body.title;

	//Validation
	req.checkBody('title', 'Title field is required').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		res.render('addcategory',{
			'errors': errors,
			'title': title
		});
	}
	else {
		var categories = db.get('categories');

		categories.insert({
			'title': title,
		}, function(err, category){
			if(err){
				res.send('There was an issue submitting the category');
			} else {
				req.flash('success', 'Category Submitted');
				res.redirect('/');
			}
		});
	}
});


module.exports = router;
