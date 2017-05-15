var versionList =  require('./version_list');

//添加版本(测试使用)
new versionList({
    versionNumber:"1",
    explain:"2",
    predictDate:Date.now(),
    publishDate:Date.now(),
    passed:1,
    promulgator:"1",
    embranchment:"1",
    createDate:Date.now()
}).save();

//修改版本(测试使用)
new versionList({
    conditions:{versionNumber: "1"},
    update:{$set: {explain: "zzzzzzzzzz"}}
}).update();

//版本查询(测试使用)
new versionList({
    options: {versionNumber: "1"}
}).find();

//删除版本(测试使用)
new versionList({
    conditions: {versionNumber: "1"}
}).remove();