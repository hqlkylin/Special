/**
 * Created by Administrator on 2015/4/27.
 */
var mongoose=require('mongoose');
mongoose.connect('mongodb://kylin:123123@localhost:27017/special');

module.exports=mongoose;