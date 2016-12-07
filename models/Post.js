var mongoose = require('mongoose'),
    moment = require('moment'),
    Schema = mongoose.Schema;

//post의 schema 설정
var schema = new Schema({
  email: {type: String, required: true, index: true, unique: true, trim: true},
  password: {type: String},
  title: {type: String},
  content: {type: String},
  numComment: {type: Number, default: 0},
  createdAt: {type: Date, default: Date.now},
  updatedAt:{type:Date},
  read : {type: Number, default: 0},
}, 
  {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});


//postSchema.virtual 함수를 이용해 각각의 가상항목들을 설정
//data 타입에 formatting 기능을 따로 설정하기 위해서 이용
schema.virtual("createdDate")
.get(function(){
 return getDate(this.createdAt);
});

schema.virtual("createdTime")
.get(function(){
 return getTime(this.createdAt);
});

schema.virtual("updatedDate")
.get(function(){
 return getDate(this.updatedAt);
});

schema.virtual("updatedTime")
.get(function(){
 return getTime(this.updatedAt);
});


var Post = mongoose.model('Post', schema);
module.exports = Post;

function getDate(dateObj){
 if(dateObj instanceof Date)
  return dateObj.getFullYear() + "-" + get2digits(dateObj.getMonth()+1)+ "-" + get2digits(dateObj.getDate());
}

function getTime(dateObj){
 if(dateObj instanceof Date)
  return get2digits(dateObj.getHours()) + ":" + get2digits(dateObj.getMinutes())+ ":" + get2digits(dateObj.getSeconds());
}

function get2digits(num){
 return ("0" + num).slice(-2);
}