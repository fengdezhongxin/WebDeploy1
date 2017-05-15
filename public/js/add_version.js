Array.prototype.indexOf = function(val) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] == val) return i;
	}
	return -1;
};
Array.prototype.remove = function(val) {
	var index = this.indexOf(val);
	if (index > -1) {
		this.splice(index, 1);
	}
};
$(function() {
	var publish_branch = [];
	$('.branch-checked li').unbind().click(function(){
		 var isChecked = $(this).find('.checked-btn').data('checked');
		 if(isChecked){
		 	$(this).find('.checked-btn').data('checked',false);
		 	$(this).find('i').removeClass("show").addClass("hide");
		 	publish_branch.remove($(this).find('span').html());
		 }else{
		 	$(this).find('.checked-btn').data('checked',true);
		 	$(this).find('i').removeClass("hide").addClass("show");
		 	publish_branch.push($(this).find('span').html());
		 }
	});
	$('.publish-sure').unbind().click(function(){
		var publish_version = $('.publish-version textarea').val(),
		    publish_name = $('.active span').eq(0).text(),
		    publish_explain = $('.publish-explain textarea').val(),
		    publish_time = $('.publish-time textarea').val();
		console.log(publish_branch);
		if(publish_version == '' ||  publish_explain == '' || publish_time == '' || publish_branch.length == 0){
            alert('必选项哦');
		}else{
			var req = {
	            versionNumber: publish_version,
			    explain: publish_explain,
			    branches: publish_branch,
			    predictDate: publish_time
			}
			$.get("/addNewVersion", req, function(data) {
				window.location.href = "/versionList";
			})
		}
	})
})
