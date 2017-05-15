$(function() {
	$(".btn-primary").click(function() {
		var name = $(".password>div input").eq(0).val(),
			password = $(".password>div input").eq(1).val(),
			new1 = $(".password>div input").eq(2).val(),
			new2 = $(".password>div input").eq(3).val();
		if (!name) {
			alert("输入用户名");
			return;
		} else if (!password) {
			alert("输入密码");
			return;
		} else if (!new1) {
			alert("输入新密码");
			return;
		} else if (!new2) {
			alert("再次输入新密码");
			return;
		} else if (new1 !== new2) {
			alert("两次输入不一样");
			return;
		}

		$.get("/updataPasswordData", {
			name: name,
			password: password,
			new2: new2,
		}, function(data) {
			if (data.flag == 0) {
				window.location.href = "/login";
			}
		})
	})
})