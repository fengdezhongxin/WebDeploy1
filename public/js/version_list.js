$(function() {
	var released = 1;
	getVersionList();

	$(".current_version").click(function(){
		released = 1;
		$(".current_version").css("background", 'url("../images/cur_version.png")');
		$(".historic_version").css("background", 'url("../images/un_his_version.png")');
		getVersionList();
	});

	$(".historic_version").click(function(){
		released = 0;
		$(".current_version").css("background", 'url("../images/un_cur_version.png")');
		$(".historic_version").css("background", 'url("../images/his_version.png")');
		getVersionList();
	});

	function FormatDate (strTime) {
	    var date = new Date(strTime);
	    return date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
	}

	function getVersionList(){
		$.get("/getVersionList", {
			released: released
		}, function(data) {
			console.log(data);
			var html = '<tr>' +
		                '<td class="td1">序号</td>' +
		                '<td class="td2">版本号</td>' +
		                '<td class="td3">版本说明</td>' +
		                '<td class="td4">发布时间</td>' +
		                '<td class="td5">编辑</td>' +
		              '</tr>';
			for (var i = 0; i < data.length; i++) {
				html += '<tr>' +
		                '<td class="td1">' + (i + 1) + '</td>' +
		                '<td class="td2">' + data[i].versionNumber + '</td>' +
		                '<td class="td3">' + data[i].explain + '</td>' +
		                '<td class="td4">' + FormatDate(data[i].predictDate) + '</td>' +
		                '<td class="td5"><a href="/modifyVersion/' + data[i]._id + '"><img class="edit" src="../images/edit.png"></a></td>' +
		              '</tr>';
			}
			$(".ta_list").html(html);
		});
	}
	
})