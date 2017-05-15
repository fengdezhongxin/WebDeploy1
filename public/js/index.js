$(function() {
	$.get("/indexData", {}, function(data) {
		console.log(data);
		var roles = data.roles,
			index = 0,
			useRoles = data.user.roles;
		for (var item in roles) {
			if (index <= 3) {
				for (var i = 0, len = useRoles.length; i < len; i++) {
					var _str = roles[item].toString();
					if (_str.indexOf(useRoles[i]) >= 0) {
						$(".version >div").eq(index).css({
							display: "inline-block"
						});
						break;
					}
				}
			}
			index++;
		}
	})
	$(".version >div").click(function() {
		window.location.href = $(this).attr("data-url");
	})

})