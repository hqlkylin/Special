var express = require('express');
var router = express.Router();
var users = require('../models/Users');
/* GET users listing. */
router.post('/add', function (req, res, next) {

    req.body.ip = req._remoteAddress;//存放ip
    users.statics.save(req.body, function (err, doc) {
        if (err) {
            res.json({str: '添加失败'})
        } else {
            res.json({str: '添加成功'});
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
module.exports = router;
