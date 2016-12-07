var express = require('express'),
    Post = require('../models/Post');
    Comment = require('../models/comment');
var router = express.Router();

// Index
router.get("/", function(req, res){
 Post.find({}, function(err, posts){
  if(err) return res.json(err);
  res.render("posts/index", {posts:posts});
 });
});

// New -정보를 서버에 전달 
// get으로 new값이 들어올때 edit.jade로 'post' parameter를 매개변수로 전달 
router.get("/new", function(req, res, next){
 res.render("posts/edit",{post:'new'});
});

// create -db에 정보생성
router.post("/", function(req, res){
 Post.create(req.body, function(err, post){
  if(err) return res.json(err);
  res.redirect("/posts");
 });
});

// show
router.get("/:id", function(req, res){
 Post.findOne({_id:req.params.id}, function(err, post){
  if(err) return res.json(err);

  Comment.find({post: post.id}, function(err, comments) {
      if (err) {
        return next(err);
      }

  res.render("posts/show", {post:post, comments: comments});
 });
});
});

// edit
router.get("/:id/edit", function(req, res){
 Post.findOne({_id:req.params.id}, function(err, post){
  if(err) return res.json(err);
  res.render("posts/edit", {post:post});
 });
});

// update
router.put("/:id", function(req, res){
 req.body.updatedAt = Date.now();
 Post.findOneAndUpdate({_id:req.params.id}, req.body, function(err, post){
  if(err) return res.json(err);
  res.redirect("/posts/"+req.params.id);
 });
});

// delete
router.delete("/:id", function(req, res){
 Post.remove({_id:req.params.id}, function(err){
  if(err) return res.json(err);
  res.redirect("/posts");
 });
});

//comment
router.post('/:id/comments', function(req, res, next) {
  var comment = new Comment({
    post: req.params.id,
    email: req.body.email,
    content: req.body.content
  });

  comment.save(function(err) {
    if (err) {
      return next(err);
    }
    Post.findOneAndUpdate(req.params.id, {$inc: {numComment: 1}}, function(err) {
      if (err) {
        return next(err);
      }
      res.redirect('/posts/' + req.params.id);
    });
  });
});

router.post('/', function(req, res, next) { 
  
    var newPost = new Post({
    email: req.body.email,
    title: req.body.title,
    content:req.body.content,
    });
    newPost.password = req.body.password;

    newPost.save(function(err) { //몽고디비로 보낸다
      if (err) {
        return next(err);
      } else {
        req.flash('success', ' 완료되었습니다.');
        res.redirect('/'); // 완료되면 제일 첫페이지로 돌아간다
      }
    });
  });




module.exports = router;

