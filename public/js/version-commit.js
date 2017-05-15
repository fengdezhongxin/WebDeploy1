$(function() {
    var statePk = false,
        isClick = false,
        time = null,
        packageTime = 0,
        index = 0;

    function getData(packageName, textareaStr, inputStr) {
        console.log(packageName);
        console.log(textareaStr);
        console.log(inputStr);
        progress();

        $.get("/pack", {
            packageName: packageName,
            packagePath: arrayStr(packageName, textareaStr),
            pagckageInfo: inputStr
        }, function(data) {
            console.log(data);
            if (data.flag === 0 || data.flag == 1) {
                $(".developer .progin ul").append("<li>" + data.mes + "</li>");
                if (data.flag == 0) {
                    $(".downPackage").show();
                }

            } else if (data.flag === -1) {
                window.location.href = "/login"
            } else if (data.flag == 2) {
                $(".developer .progin ul").html("<li>打包开始</li><li>正在排队，前面有" + data.mes + "人在打包</li>");
                var t3 = setTimeout(function() {
                    getData();
                    clearTimeout(t3);
                    t3 = null;
                }, 1000)
            }
            clearInterval(time)
            time = null;
            index = 0;
            if (data.flag !== 2) {
                isClick = false;
            }

        });
    }
    //打包进程
    function progress() {
        $(".developer .progin ul").html("<li>打包开始</li>");
        if (isClick) {
            $(".developer .progin ul").append("<li>更新svn</li>");
        }
        time = setInterval(function() {
            $.get("/progress", {}, function(data) {
                var str = $(".developer .progin ul")
                if (index !== data.progress && data.progress !== 0 && isClick) {
                    index = data.progress;
                    if (data.count) {
                        $(".developer .progin ul").append("<li>" + data.count + "</li>")
                    }
                    if (index == 4 && !$(".developer .progin ul").hasClass("currt")) {
                        $(".developer .progin ul").append("<li class='currt'>svn更新成功</li>")
                        $(".developer .progin ul").append("<li>开始加密</li>")
                    }

                }
                if (data.progress === 4 || data.progress === -1) {
                    clearInterval(time);
                    time = null;
                    index = 0;
                }
            })
        }, 200);
    }

    function arrayStr(packageName, textareaStr) {
        var list = textareaStr.replace(/\\/g, "/").split("\n");
        for (var i = 0, len = list.length; i < len; i++) {
            if (packageName === "branches") {
                list[i] = "/" + packageName + "/zlcft-main" + list[i];
            } else {
                list[i] = "/trunk/" + packageName + "" + list[i]
            }

        }
        return list;
    };
    var versionCommit = {
        init: function() {
            this.el = {
                body: $("body"),
                branchList: $(".branchList"), //分支容器
                versionList: $(".versionList"), //版本容器
                button: $(".button"), //提交按钮
                version: $(".version"), //显示版本
                branch: $(".branch"), //显示分支
                content: $(".content"), //简介 
                code: $(".code"), //提交代码
                list: $(".list") //版本和分支列表
            }

            this.bindEvent(); //绑定事件
        },
        bindEvent: function() {
            var _this = this;
            //版本内容选择
            this.el.version.on("click", function(e) {
                _this.el.versionList.toggle();
                _this.el.branchList.hide();
                e.stopPropagation();
            });
            //分支内容选择
            this.el.branch.on("click", function(e) {
                if ($.trim(_this.el.version.text()) == "--请选择版本--") { //如果没有选择分支就不操作
                    return;
                } else {
                    _this.el.branchList.toggle();
                    _this.el.versionList.hide();
                }
                e.stopPropagation();
            });
            //版本分支列表选择
            this.el.list.on("click", "li", function() {
                var _self = $(this);
                var branch = _self.attr("data-branch");
                if (branch) { //如果是版本
                    //提交版本显示内容以及版本id保存
                    _this.el.version.text(_self.text()).attr("data-id", _self.attr("data-id"));
                    var strHtml = "";
                    //生成分支列表
                    branch.split(',').forEach(function(i) {
                        strHtml += '<li>' + i + '</li>'
                    });
                    //分支加入页面
                    _this.el.branchList.html(strHtml);
                    _this.el.branch.text("--请选择分支--");
                } else { //如果是分支列表
                    _this.el.branch.text(_self.text());

                }
                _self.parent().hide();
            });
            //清空弹出列表
            this.el.body.on("click", function() {
                _this.el.branchList.hide();
                _this.el.versionList.hide();
            });
            //提交按钮
            this.el.button.on("click", function() {
                var _self = $(this);
                if (_self.hasClass('disabled')) {
                    return;
                }
                if ($.trim(_this.el.version.text()) == "--请选择版本--") {
                    alert("请选择版本号");
                    return;
                }
                if ($.trim(_this.el.branch.text()) == "--请选择分支--") {
                    alert("请选择分支");
                    return;
                }
                if (!_this.el.content.val()) {
                    _this.el.content.focus();
                    alert("请输入提交说明");
                    return;
                }
                if (!_this.el.code.val()) {
                    _this.el.code.focus();
                    alert("请输入提交代码列表");
                    return;
                }
                var obj = {
                    versionId: _this.el.version.attr("data-id"),
                    branch: _this.el.branch.text(),
                    content: _this.el.content.val(),
                    code: _this.el.code.val(),
                    type: _self.attr("data-type")
                }
                _self.addClass("disabled");

                if (obj.type == "test") {
                    $(".pack-progress").removeClass("hide");
                    $(".apply").addClass("disabled");
                    if (isClick) {
                        alert("正在打包...");
                        return;
                    }
                    getData(obj.branch, obj.code, obj.content);
                    isClick = true;
                } else {
                    $.post("/version/commit", obj, function(suc) {
                        if (suc.success) {
                            alert(suc.msg)
                            window.location.href = "/";
                        } else {
                            alert(suc.msg);
                        }
                    });
                }

            });
        }
    }
    versionCommit.init();
})
