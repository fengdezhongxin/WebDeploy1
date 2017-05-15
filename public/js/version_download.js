var isClick = false,
	time = null,
	fileList = [],
	ismore = false,
	index = 0;
$(function() {
	function init(){
        var id = '',
            released = 1;//0 已发布  1待公布  2 封板  3 不发布
		publishVersionFind();
		bindEvent();
	}
	init();
	
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
                        fileList.push(arrayStr(data[i].branches,data[i].listFile[j]))
		            }
	                 html_detail += '<li>'+
						            '<div class="commit-tit">'+
						            '<span>'+(i+1)+' 提交人: '+data[i].author+'</span>'+
	                                '<span>'+data[i].branches+'</span>'+
	                                '<span class="version-delete" data-id="'+data[i]._id+'"></span>'+
						            '</div>'+
						            '<div class="commit-filelist">'+
						            '<p>'+data[i].explain+'</p>'
	                                 +html_file_list
						            '</div>'+
						            '</li>';
				}
				$('.commit-list').html(html_detail);
				//删除
				$('.version-delete').click(function(){
					console.log('del_id==');
					var el = $(this);
			        var del_id = el.data('id');
			        $.get("/publishDetailDelete",{_id:del_id},function(data){
				         el.parent().parent().remove();
				    })
				});
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
					html_version += '<li data-id="' + data[i]._id +'" data-released="'+data[i].released+'">'+data[i].versionNumber+'</li>';
				}
				if(data[0].released == 2){
					$('.btn-close').unbind('click').css('background','#666');
				}
                id = data[0]._id                	
                $('.version.select').html(data[0].versionNumber);
                publishDetailFind(id);   
				$('.list').html(html_version);
				$('.download-box').css('display','-webkit-box').show();
				$(".list li").click(function(){
					id = $(this).data('id');
					var released = $(this).data('released');
					if(released == 2){
						$('.btn-close').unbind('click').css('background','#666');
					}else{
						$('.btn-close').unbind('click').css('background','#D92F2E');
						$('.btn-close').bind('click',function(){
							pop('封版后将不能提交哦！',function(){
					            released = 2;
								updataVersion(released,function(){
									$('.btn-close').unbind('click').css('background','#666');
								})
							})		
						});
					}
					$('.more').toggleClass('down');
				    $(this).parent().hide().siblings('.select').text($(this).text());
				    publishDetailFind(id);
				});
			}
        })
	}
	//更新数据
	function updataVersion(released,callback){
		var req = {
            released:released,
		    id: id
		}
        $.get("/modifyVersionStatus",req,function(data){
              console.log('更新成功');
              callback&&callback();
        });
	}
	//弹出框提示
	function pop(msg,surefn){
        $('.pop-msg').html(msg);
        $('.pup-sure').show();
        //取消按钮
        $('.btn-cancel').unbind().bind('click',function(){
        	$('.pup-sure').hide();
        })
        //确认按钮
        $('.btn-sure').unbind().bind('click',function(){
        	surefn&&surefn();
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
        //生产版本发布包
		$('.btn-pack').unbind().click(function(){
			if($('.commit-list li').length == 0){
                pop('该版本暂未有提交，不能打包哦！',function(){
                	$('.pup-sure').hide();
                });
			}else{
	            released = 1;
	            $('.download-progin').show();
	            if(!isClick){
	            	isClick = true;
	                download(fileList,function(){
                         alert('打包成功')
	                });
	            }
			}
		})
		//封板
		$('.btn-close').unbind().click(function(){
			pop('封版后将不能提交哦！',function(){
	            released = 2;
				updataVersion(released,function(){
					$('.btn-close').unbind('click').css('background','#666');
				})
			})			
		})
		//发布
		$('.btn-publish').unbind().click(function(){
			if($('.commit-list li').length == 0){
                pop('该版本暂未有提交，不能发布哦！',function(){
                	$('.pup-sure').hide();
                });
			}else{
				pop('确认发布？',function(){
					released = 0;
					updataVersion(released,function(){
						download(listFile,function(){
                            window.location.href='/sucess?from=1';
						});
					})
				})
			}
		})
		//不发布
		$('.btn-nopublish').unbind().click(function(){
			pop('不发布视为废弃版本哦！',function(){
				released = 3;
				updataVersion(released,function(){
					window.location.href='/sucess?from=2';
				})
			})
		})
	}
	//打包开始
	function download(fileList,sucfn){
		progress();
		$.get("/pack", {
			packageName: '',
			packagePath: fileList,
			pagckageInfo: ''
		}, function(data) {
			console.log(data);
			if (data.flag === 0 || data.flag == 1) {
				$(".download-progin .progin ul").append("<li>" + data.mes + "</li>");
				if (data.flag == 0) {
					sucfn&&sucfn();
					$(".downPackage").show();
				}

			} else if (data.flag === -1) {
				window.location.href = "/login"
			} else if (data.flag == 2) {
				$(".download-progin .progin ul").html("<li>打包开始</li><li>正在排队，前面有" + data.mes + "人在打包</li>");
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
		$(".download-progin .progin ul").html("<li>打包开始</li>");
		if (isClick) {
			$(".download-progin .progin ul").append("<li>更新svn</li>");
		}
		time = setInterval(function() {
			$.get("/progress", {}, function(data) {
				var str = $(".download-progin .progin ul")
				if (index !== data.progress && data.progress !== 0 && isClick) {
					index = data.progress;
					if (data.count) {
						$(".download-progin .progin ul").append("<li>" + data.count + "</li>")
					}
					if (index == 4 && !$(".download-progin .progin ul").hasClass("currt")) {
						$(".download-progin .progin ul").append("<li class='currt'>svn更新成功</li>")
						$(".download-progin .progin ul").append("<li>开始加密</li>")
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

	function arrayStr(packageName,path) {
		var path_all = '';
		if (packageName === "branches") {
			path_all = "/" + packageName + "/zlcft-main" + path;
		} else {
			path_all = "/" + packageName + "/zlcft-main" + path;
		}
		return path_all;
	}
})
