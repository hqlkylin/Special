var express = require('express');
var router = express.Router();
var nodeExcel = require('excel-export');

var Activity = require('../models/Activity');
var Users = require('../models/Users');
var time = require('../public/javascripts/kylin');
//var ccap = require('ccap')();//Instantiated ccap class

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.render('activity_index', {});
});
router.get('/edit', function (req, res, next) {
    Activity.findById(req.query._id, function (err, doc) {
        res.json(doc);
    })
});
router.post('/edit', function (req, res, next) {
    var model = {
        name: req.body.name,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        state: req.body.state,
        //addTime: new Date(),
        market: req.body.market,
        keywords: req.body.keywords,
        description: req.body.description,
        script: req.body.script,
        messageTemplate: req.body.messageTemplate,
        clickCount: req.body.clickCount,
        limitForm: req.body.limitForm,
        _id: req.body._id
    };
    Activity.update(model, function (err, numberAffected) {

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
router.post('/add', function (req, res, next) {

    var model = new Activity({
        name: req.body.name,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        state: req.body.state,
        addTime: new Date(),
        market: req.body.market,
        keywords: req.body.keywords,
        description: req.body.description,
        script: req.body.script,
        messageTemplate: req.body.messageTemplate,
        clickCount: req.body.clickCount,
        limitForm: req.body.limitForm
    });
    model.save(function (errMsg) {
        if (errMsg)
            res.json({msg: '添加失败', success: false});
        else{
            res.json({msg: '添加成功', success: true});
        }
    });
});
router.post('/del', function (req, res, next) {

    Activity.remove(req.body._id, function (err) {
        if (err)
            res.json({msg: '删除失败'+err.message, success: false});
        else {
            res.json({msg: "删除成功！", success: true})
        }
    })
});
router.get('/data', function (req, res, next) {
    var page = {limit: req.query.limit || 5, offset: req.query.offset || 0};
    var queryObj = new Object();

    if (req.query.name) {
        queryObj.name = new RegExp(req.query.name);
    }
    if (req.query.market) {
        queryObj.market = req.query.market;
    }

    var model = {
        search: queryObj,
        columns: 'name market clickCount startDate endDate',
        page: page
    };
    Activity.findPagination(model, function (err, total, docs) {
        res.json({total: total, rows: docs});
    })
});

//图片验证码 ---测试
/*router.get('/code', function (req, res, next) {
    var ary = ccap.get();
    var txt = ary[0];
    var buf = ary[1];
    res.end(buf);
    console.log(txt);
});*/



router.get('/excel', function (req, res, next) {
    var conf ={};
    // uncomment it for style example
    // conf.stylesXmlFile = "styles.xml";
    conf.cols = [
        {
        caption:'姓名',
        captionStyleIndex: 1,
        type:'string'
        , width:15
    },
        {
        caption:'报名日期',
        type:'string',
        beforeCellWrite:function(){
            var originDate = new Date(Date.UTC(1899,11,30));
            return function(row, cellData, eOpt){
                if (cellData === null){
                    eOpt.cellType = 'string';
                    return 'N/A';
                } else
                   // return (cellData - originDate) / (24 * 60 * 60 * 1000);
                 return   new Date(cellData).format("yyyy-MM-dd hh:mm:ss");
            }
        }()
        , width:20.85
    },
        {
        caption:'电话',
        type:'string',
        width:30
    },
        {
            caption:'地址',
            type:'string',
            width:30
        }
        ,{
            caption:'金额',
            type:'number',
            width:30
        }
        ,{
            caption:'状态',
            type:'bool'
        }
        ,{
            caption:'ip',
            type:'string'
        }];

    var model = {
        activity: req.query._id,
        columns: 'name addTime tel address money state ip'
    };
    Users.statics.findAll(model,function(err,docs){

        var rows=[];
        for(var i in docs){
            var template=[];
            template.push(docs[i].name);
            template.push(docs[i].addTime);
            template.push(docs[i].tel);
            template.push(docs[i].address);
            template.push(docs[i].money);
            template.push(docs[i].state);
            template.push(docs[i].ip);
            rows.push(template);
        }
        conf.rows = rows;
        var result = nodeExcel.execute(conf);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");
        res.end(result, 'binary');


    })

});
module.exports = router;
