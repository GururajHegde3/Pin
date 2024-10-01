const mongoose = require('mongoose');
const plm=require("passport-local-mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/pin");

const userSchema = mongoose.Schema({
  username:String,
  name:String,
  email:String,
  password:String,
  contact :Number,
  profileImage:String,
  boards:{
    type:Array,
    default:[]
  },
  posts:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Post',
  },
  ],

});
userSchema.plugin(plm);

module.exports = mongoose.model("User",userSchema);