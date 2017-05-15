var ismore = false;
$(function() {
	var id = getUrlParams('id') ? getUrlParams('id') : '-1';
	init();
	function init(){
		bindEvent();
		if(id != '-1'){
	       publishDetailFind(id);
		}
		publishVersionFind();
	}
	//查询详情 根据版本号
	function publishDetailFind(id){
		console.log('==download=='+id);
		$.get("/publishDetailFind",{versionId:id},function(data){
			var html_detail = '';
			if(data.length == 0){
                 $('.commit-list').html('该版本暂未有提交');
			}else{
				var len = data.length;
				for(var i = 0; i<len;i++){
					var html_file_list = '';
		            for(var j=0;j<data[i].listFile.length;j++){
	                    html_file_list += '<p>'+data[i].listFile[j]+'</p>';
		            }
	                 html_detail += '<li>'+
						            '<div class="commit-tit">'+
						            '<span>'+(i+1)+' 提交人: '+data[i].author+'</span>'+
	                                '<span>'+data[i].branches+'</span>'+
						            '</div>'+
						            '<div class="commit-filelist">'+
						            '<p>'+data[i].explain+'</p>'
	                                 +html_file_list
						            '</div>'+
						            '</li>';
				}
				$('.commit-list').html(html_detail);
			}
		})
	}
	//获取url参数
	function getUrlParams(paramName){
		var reg = new RegExp("(^|&)" + paramName + "=([^&]*)(&|$)", "i"),
            arr = window.location.search.substr(1).match(reg);
        if (arr) {
            return arr[2];
        }
        return null;
	}
	//查询所有版本号 id
	function publishVersionFind(){
		$.get("/getVersionModel",{},function(data){
	        var html_version = '';
	        if(data.length == 0){
	        	$('.list').hide();
                $('.more').unbind('click').hide();
                $('.nodata').show();
	        }else{
		        for (var i = 0; i < data.length; i++) {
                    if(id != '-1' && data[i]._id == id){
                        $('.version.select').html(data[i].versionNumber);
                    }
					html_version += '<li data-id="' + data[i]._id +'" data-released="'+data[i].released+'">'+data[i].versionNumber+'</li>';
				}
				$('.list').html(html_version);
				$('.download-box').css('display','-webkit-box').show();
				$(".list li").click(function(){
					id = $(this).data('id');					
					$('.more').toggleClass('down');
				    $(this).parent().hide().siblings('.select').text($(this).text());
				    publishDetailFind(id);
				});
			}
        })
	}
	//绑定事件
	function bindEvent(){
		//下拉框
        $(".select").on("click", function() {
		    if ($(this).hasClass("version")) {
		        $(".branch").siblings('.list').hide();
		    } else {
		        $(".version").siblings('.list').hide();
		    }
		    $(this).siblings('ul').toggle();
		    $(this).siblings('.more').toggleClass('down');
		});
	}

});
