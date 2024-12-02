const mongoose = require('mongoose');
const plm=require("passport-local-mongoose");
const dotenv = require("dotenv");
dotenv.config();
mongoose.connect(process.env.MONGO_URL);

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