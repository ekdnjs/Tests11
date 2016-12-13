var express = require('express'),
    Post = require('../models/Post'),
    User = require('../models/User'),
    Reserve = require('../models/Reserve');
var router = express.Router();

function needAuth(req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else {
      req.flash('danger', '로그인이 필요합니다.');
      res.redirect('/signin');
    }
}

function validateForm(form) {
    var people = form.people || "";
    var checkin = form.checkin || "";
    var checkout = form.checkout || "";

    if(!people){
        return '숙박인원을 입력해주세요.';
    }
    if (!checkin) {
        return 'Check-In 날짜를 선택해주세요.';
    }
    if(!checkout){
        return 'Check-Out 날짜를 선택해주세요.';
    }

    return null;
}

router.get('/:id/show',function(req,res,next){
    Post.findById(req.params.id,function(err,post){
        if(err){
            return next(err);
        }
        Reserve.findOne({title:post.title},function(err,reserve){
            if(err){
                return next(err);
            }
            res.render('reserves/show',{post:post, reserve:reserve});
        });
    });
});

router.get('/:id/index',needAuth,function(req,res,next){
    User.findById(req.params.id,function(err,user){
        if(err){
            return next(err);
        }
        Reserve.find({useremail:user.email},function(err,reserves){
            if(err){
                return next(err);
            }
            Post.find({title:reserves.title},function(err,posts){
                if(err){
                    return next(err);
                }

                res.render('reserves/index',{reserves:reserves, posts:posts});
            });
        });
    });
});

router.get('/:id/list',needAuth, function (req, res, next) {
    Reserve.find({ hostemail: req.user.email }, function (err, reserves) {
        if (err) {
            return next(err);
        }
        Post.findOne({title:reserves.title},function(err,post){
            if(err){
                return next(err);
            }
            res.render('reserves/list', { reserves: reserves, post:post });
        });
        
    });
});

router.get('/:id/finish',function(req,res,next){
    Reserve.findById(req.params.id,function(err,reserve){
        if(err){
            return next(err);
        }
        Post.findOne({title:reserve.title},function(err,post){
            if(err){
                return next(err);
            }
            if(post.reservation === '예약완료'){
                req.flash('danger','이미 예약완료 하셨습니다.');
                res.redirect('back');
            }
            post.reservation = "예약완료";
            post.save(function(err){
                if(err){
                    return next(err);
                }
                res.redirect('/posts');
            });
        });
    });
});

router.get('/:id', needAuth, function (req, res, next) {
    User.findById(req.user, function (err, user) {
        if (err) {
            return next(err);
        }
        Post.findById(req.params.id, function (err, post) {
            if (err) {
                return next(err);
            }
            if(req.user.email === post.email){
                req.flash('danger','본인의 방은 예약이 불가합니다.');
                res.redirect('back');
            }
            if (post.reservation === '예약중' || post.reservation === '예약완료') {
                req.flash('danger', '예약중.');
                res.redirect('back');
            }
            res.render('reserves/new', { user: user, post: post });
        });
    });
});

router.post('/:id', function (req, res, next) {
    var err = validateForm(req.body);
    if (err) {
        req.flash('danger', err);
        return res.redirect('back');
    }
    Post.findById(req.params.id, function (err, post) {
        if (err) {
            return next(err);
        }
        
        post.reservation="예약중";
        post.save(function(err){
            if(err){
                return next(err);
            }
        });
        
        var NewReserve = new Reserve({
            useremail: req.user.email,
            hostemail: post.email,
            name: req.user.name,
            title: post.title,
            people: req.body.people,
            address: post.address,
            fromDate: req.body.checkin,
            toDate: req.body.checkout,
            content: req.body.content
        });

        NewReserve.save(function (err) {
            if (err) {
                return next(err);
            } else {

                res.redirect('/posts/#{post.id}');
            }
        });

    });
});

router.delete('/:id', needAuth, function (req, res, next) {
    Reserve.findById(req.params.id, function(err,reserve){
        if(err){
            return next(err);
        }
        Post.findOne({title:reserve.title},function(err,post){
            if(err){
                return next(err);
            }
            post.reservation = "예약가능";
            post.save(function(err){
                if(err){
                    return next(err);
                }
            });
        });
        Reserve.findByIdAndRemove(reserve._id, function(err){
            if(err){
                return next(err);
            }
            res.redirect('back');
        });
    });
});
module.exports = router;