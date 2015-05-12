var express = require('express');
var router = express.Router();
var users = require('../models/Users');
var Activity = require('../models/Activity');
/* GET users listing. */
router.post('/add', function (req, res, next) {

    /*验证码*/
    if(req.session.code!=req.body.code){
        res.json({msg: '验证码错误', success: false});
        return;
    }
    /*手机号验证*/
    var tel = RegExp(/^((13[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8}$/).test(req.body.tel);
    if (!tel) {
        res.json({msg: "手机号码不正确！", success: false});
        return;
    }

    req.body.ip = req._remoteAddress;//存放ip
    users.statics.save(req.body, function (err, doc) {
        if (err) {
            res.json({msg: '添加失败'})
        } else {
            delete req.session.code;
            res.json({msg: '添加成功'});
        }
    });
});
router.get('/', function (req, res, next) {
    res.render('users_index', {});
});
router.get('/data', function (req, res, next) {
    var page = {limit: req.query.limit || 5, offset: req.query.offset || 0};
    var queryObj = new Object();

    if (req.query.name) {
        queryObj.name = new RegExp(req.query.name);
    }
    if (req.query.address) {
        queryObj.name = new RegExp(req.query.address);
    }
    if (req.query.tel) {
        queryObj.name = new RegExp(req.query.tel);
    }


    var model = {
        search: queryObj,
        columns: 'name state addTime tel ip address',
        page: page
    };
    users.findPagination(model, function (err, total, docs) {
        res.json({total: total, rows: docs});
    })
});
router.get("/edit", function (req, res, next) {
    users.statics.findUserId(req.query._id, function (err, doc) {
        res.json(doc);
    })
});
router.post('/edit', function (req, res, next) {
    delete req.body.activity;

    users.statics.update(req.body, function (err, numberAffected) {

        if (err)
            res.json({msg: '修改失败', success: false});
        else {
            if (numberAffected.nModified) {
                res.json({msg: "修改成功！", success: true})
            } else
                res.json({msg: "您什么也没有改动！", success: true})
        }
    })
});
router.post('/del', function (req, res, next) {
    var arr=[];
    typeof(req.body["_id[]"])=='string'?arr.push(req.body["_id[]"]):arr=req.body["_id[]"];
    console.log(arr)
    users.statics.remove(arr, function (err) {
        if (err)
            res.json({msg: '删除失败', success: false});
        else {
            res.json({msg: "删除成功！", success: true})
        }
    })
});
router.post('/getCode', function (req, res, next) {
    /*手机号验证*/
    var tel = RegExp(/^((13[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8}$/).test(req.body.tel);
    if (!tel) {
        res.json({msg: "手机号码不正确！", success: false});
        return;
    }
    Activity.findById(req.body._id,function(err,doc){
        if(err){
            res.json({msg:"对不起，您提交的参数错误。",success:false})
            return;
        }else{
            if(!doc){
                // 未查询到活动
                res.json({msg:"对不起，未查询到活动。",success:false})
                return;
            }else{
                // 活动已关闭
                if(!doc.state) {
                    res.json({msg: "对不起，活动已关闭。", success: false});
                    return;
                }
                // 活动还未开始
                if(doc.startDate>new Date()) {
                    res.json({msg: "对不起，活动还未开始。", success: false});
                    return;
                }
                // 活动已经结束
                if(doc.endDate<new Date()) {
                    res.json({msg: "对不起，活动已经结束。", success: false});
                    return;
                }
                /*活动报名人数已满*/
                users.statics.count({activity:req.body._id},function(err,count){
                    if(count>=doc.limitForm){
                        res.json({msg:"对不起，活动报名人数已满。",success:false});
                        return;
                    }else{
                        /*手机号码重复*/
                        users.statics.count({activity:req.body._id,tel:req.body.tel},function(err,count){
                            if(count>0){
                                res.json({msg:"对不起，手机号码已报名！",success:false});
                                return;
                            }else{
                                var code=(new Date().getTime()+"").slice(-4);
                                req.session.code=code;
                                //成功
                                res.json({msg:code,success:true});
                            }
                        });
                    }
                });
            }
        }
    });

});
router.get("/list",function(req,res,next){
    users.statics.findAll(req.query,function(err,docs){
        res.json(docs);
    });
});
module.exports = router;
