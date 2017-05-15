var statePk = false,
	isClick = false,
	time = null,
	packageTime = 0,
	index = 0;
var socket = io('ws://localhost:3002');
socket.on("message", function(obj) {
	$(".developer .progin ul").append("<li class='currt'>" + obj + "</li>")
	if () {}
});
$(function() {
	//下拉框效果
	$(".click").click(function() {
		var ul = $(".select ul"),
			en = $(this).find('div');
		if (en.hasClass("active")) {
			en.removeClass("active");
			ul.hide();
		} else {
			en.addClass("active");
			ul.show();
		}
	});
	$(".select ul").on("click", "li", function() {
		if (!$(this).hasClass("active")) {
			$(this).addClass("active").siblings().removeClass("active");
			$(".select ul").hide();
			$(".click div").removeClass("active")
		}
		$(".dropdown .select p").html($(".select ul .active").html());
	});
	//页面配置数据
	$.get("/developerData", {}, function(data) {
			console.log(data);
			var str = "";
			for (var item in data) {
				str += "<li>" + data[item].name + "</li>";
			}
			$(".dropdown .select p").html(data[0].name);
			$(".dropdown .select ul").html(str);
		})
		//打包流程
	$(".btn").click(function() {
		//验证
		var inputStr = $(".info input").val(),
			textareaStr = $(".pathStr textarea").val().trim(),
			packageName = $(".dropdown .select p").html().trim();
		if (isClick) {
			alert("正在打包。。。。");
			return;
		}
		isClick = true;
		if (!inputStr) {
			alert("请输入说明");
			return;
		} else if (!textareaStr) {
			alert("请输入文件路径");
			return;
		}
		$(".developer .progin").show();
		$(".developer .progin ul").html("<li class='currt'>开始打包</li>")
		getData(packageName, textareaStr, inputStr);
	})
});
//请求数据
function getData(packageName, textareaStr, inputStr) {
	/*	progress();*/
	var p = [];
	p.push(packageName);
	$.get("/pack", {
		packageName: p,
		packagePath: arrayStr(packageName, textareaStr),
		pagckageInfo: inputStr,
		plan: "normal"
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

function arrayStr(packageName, textareaStr) {
	var list = textareaStr.replace(/\\/g, "/").split("\n");
	for (var i = 0, len = list.length; i < len; i++) {
		if (packageName === "branches") {
			list[i] = "/" + packageName + "" + list[i];
		} else {
			list[i] = "/" + packageName + "" + list[i]
		}

	}
	return list;
}