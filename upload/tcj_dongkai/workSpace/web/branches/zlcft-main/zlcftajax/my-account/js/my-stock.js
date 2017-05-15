require.config({
    baseUrl: 'js/',
    paths: {
        "jquery": ["/common/vendor/jquery-2.1.4/jquery-2.1.4.min"],
        "base": ["/common/scripts/base"],
        "iScroll": ["/common/vendor/iscroll-4.2-custom/iscroll"],
        "refresh":["/common/scripts/refresh"],
        "ajax": ["/common/scripts/ajax"]
    },
     shim: {
        "iScroll": {
            deps: [],
            exports: 'iScroll'
        },
        "refresh": {
            deps: ["iScroll", "jquery"],
            exports: 'refresh'
        }
    }
});

require(["jquery", "base", "ajax","iScroll","refresh"], function($, base, ajax,iScroll,refresh) {

    var myStock= {
        assetProp:"150000", //账号类型
        moneyType:"401156", //币种
        moneyFlag:"",
        stockCode:"",       //选中的股票
        stockType:"",       //选中股票的类型(160001 普通股票 160002 信用账户股票 160003 “沪港通” 160005“深港通”股票 160004 场内基金)
        gridType:"",        //大盘指数参数
        init: function(){
            var that = this;
            that.assetProp = base.getUrlParameter("assetProp");
            that.moneyType = base.getUrlParameter("moneyType");
            if(that.assetProp===null){
                that.assetProp = "150000";
            }
            if(that.moneyType === null){
                that.moneyType = "401156";
            }
            if(that.moneyType === "401156"){
                $(".currency").text("元");
                $(".marketRateDesc").text("上证");
                that.grid = "1A0001";
            }else if(that.moneyType === "401840"){
                $(".currency").text("美元");
                $(".currencyflag").text("$")
                that.moneyFlag ="$";
                $(".marketRateDesc").text("B股指数");
                that.grid ="1A0003";
            }else{
                $(".currency").text("港币");
                $(".currencyflag").text("HK$")
                that.moneyFlag ="HK$";
                $(".marketRateDesc").text("B股指数");
                that.grid = "1A0003";//"2C03";
            }
            that.getData();
            that.getMaketRate();
            that.bindEvent();
            that.refresh();
            that.resetCss();
        },
        getData: function(){
            var that = this;
            var url ='/reqxml?action=27005&path=/htsc_hub/pc&funcId=104039&clientNo=($account)&flag=0&moneyType='+that.moneyType+'&assetProp='+that.assetProp;
            ajax.run(url,"",function(xml){
                console.log('数据返回为：'+JSON.stringify(xml));
                xml = $(xml.BINDATA);
                 var code = xml.find('flag').attr("code");
                if(code === "0"){
                    var $stockinfo = $(xml.find("stocks")).find("stock");
                    /*stock mktVal=\"0\" sumIncome=\"0\" todayIncome=\"0\" todayPftRate=\"0\"/>
                    */

                   /* mktVal 股票总市值 
                    sumIncome 股票持仓总盈亏
                    todayIncome 股票今日盈亏
                    todayIftRate 持仓今日盈亏率
                    marketRate 大盘涨跌幅*/
                    //股票今日盈亏
                    var todayIncome = $stockinfo.attr("todayIncome");
                    $(".todayIncome").text(todayIncome);
                     //持仓今日盈亏率
                    var todayPftRate = $stockinfo.attr("todayPftRate");
                    if(todayPftRate!== undefined){
                        $(".todayPftRate").text(todayPftRate+"%");
                    }
                    //股票总市值
                    var mktVal = $stockinfo.attr("mktVal");
                    $(".mktVal").text(mktVal);
                     //股票持仓总盈亏
                    var sumIncome = $stockinfo.attr("sumIncome");
                    $(".sumIncome").text(sumIncome);
                    
                    var prdts = $(xml.find("prdts")).find("prdt");
                    if(prdts.length>0){
                        if(prdts.length>9){//大于10条数据时候  搜索框显示
                            $(".sousuo-blk").removeClass("none")
                        }
                        /*$(".stock-list").empty();*/
                        var tempMoneyFlag =that.moneyFlag;
                        var allHtml = "";
                        for (var i = 0; i < prdts.length; i++) {
                            var $prdtObj = $(prdts[i]);

                            var valClass ="up";
                            if($prdtObj.attr("sumIncome").indexOf("-")>-1){
                                valClass = "down";
                            }
                            //股票类型
                            var newMoneyFlag = "";
                            var stkTypeClass="";
                            if(that.assetProp !=="150002"){
                                if($prdtObj.attr("type")==="160002"){//融资融券
                                    stkTypeClass ="rzrq";
                                }else if($prdtObj.attr("type")==="160003" || $prdtObj.attr("type")==="160005"){//港股通（添加美元符号）
                                    stkTypeClass ="hgt";
                                    if($prdtObj.attr("type")==="160005"){
                                        stkTypeClass ="sgt";
                                    }
                                    newMoneyFlag = "HK$";
                                    that.moneyFlag ="HK$";
                                }if($prdtObj.attr("type")==="160004"){//场内基金
                                    stkTypeClass ="cnjj";
                                }
                                //stkTypeClass = $prdtObj.attr("type") =="160002" ? "rzrq": $prdtObj.attr("type") =="160003"?"ggt":$prdtObj.attr("type") =="160004"?"cnjj":"";
                            }
                            if(newMoneyFlag ===""){
                                that.moneyFlag = tempMoneyFlag;
                            }
                            var opts ="";
                            if($prdtObj.attr("type") === "160002"){
                                opts = '<div class="opt-row">'+
                                                '<div class="opt-obj opt-width-20 opt-disabled"><div class="opt-text">两融</div></div>'+
                                                '<div class="opt-obj opt-width-20"><div class="opt-text">买</div></div>'+
                                                '<div class="opt-obj opt-width-20"><div class="opt-text">卖</div></div>'+
                                                '<div class="opt-obj opt-width-20"><div class="opt-text">行情</div></div>'+
                                                '<div class="opt-obj opt-width-20"><div class="opt-text">历史</div></div>'+
                                            '</div>';
                            }else{
                                opts = '<div class="opt-row">'+
                                                '<div class="opt-obj"><div class="opt-text">买</div></div>'+
                                                '<div class="opt-obj"><div class="opt-text">卖</div></div>'+
                                                '<div class="opt-obj"><div class="opt-text">行情</div></div>'+
                                                '<div class="opt-obj"><div class="opt-text">历史</div></div>'+
                                            '</div>';
                            }
                            //停牌提示
                            var notice ='';
                            if($prdtObj.attr("notice")!==null){
                                notice = '<div class="stock-tips">'+ $prdtObj.attr("notice") +'</div>';
                            }
                            var html = '<div class="stock-obj '+ valClass +' '+ stkTypeClass+'">'+
                                        '<input type="hidden" class="stkType" value="'+ $prdtObj.attr("type") +'">'+
                                        '<div class="info">'+
                                            '<div class="stock-name">'+ $prdtObj.attr("stockName") +'</div>'+
                                            '<div class="stock-code">'+ $prdtObj.attr("stockCode") +'</div>'+
                                            '<div class="mark"></div>'+
                                        '</div>'+
                                        '<div class="info-split"></div>'+
                                            notice+
                                            '<div class="kuiying">'+
                                                '<div class="title">总亏盈</div>'+
                                                '<div class="value1">'+ $prdtObj.attr("sumIncomeRate") +'<span class="bfh">%</span></div>'+
                                                '<div class="value2">'+ $prdtObj.attr("sumIncome") +'</div>'+
                                            '</div>'+
                                            '<div class="stock-details">'+
                                                '<div class="stock-blk">'+
                                                    '<div class="row">'+
                                                        '<span class="key">市价</span>';

                                                        if(newMoneyFlag!==""){
                                                            html += '<span class="value">'+
                                                        '<span class="moneyFlag" style="margin-right:3px;">'+ that.moneyFlag +'</span>'+
                                                        $prdtObj.attr("assetPrice") +'</span>';
                                                        }else{
                                                            html += '<span class="value">'+ $prdtObj.attr("assetPrice") +
                                                        '<span class="moneyFlag">'+ that.moneyFlag +'</span>'+
                                                        '</span>';
                                                        }
                                                        
                                                    html+='</div>'+
                                                    '<div class="row">'+
                                                        '<span class="key">成本</span>';
                                                        if(newMoneyFlag !== ""){
                                                            html += '<span class="value">'+ 
                                                            '<span class="moneyFlag" style="margin-right:3px;">HK$</span>'+
                                                            $prdtObj.attr("costPrice") +'</span>';
                                                        }else{
                                                            html += '<span class="value">'+ $prdtObj.attr("costPrice") +
                                                            '<span class="moneyFlag">'+  that.moneyFlag +'</span>'+
                                                            '</span>';
                                                        }
                                                    html +='</div>'+
                                                    '<div class="row">'+
                                                        '<span class="key">买入均价</span>';
                                                        if(newMoneyFlag !==""){
                                                            html += '<span class="value buyPrice">'+ 
                                                            '<span class="moneyFlag">HK$</span>'+
                                                            ($prdtObj.attr("buyPrice") == undefined ? "--": $prdtObj.attr("buyPrice")) +'</span>';
                                                        }else{
                                                            html += '<span class="value buyPrice">'+ ($prdtObj.attr("buyPrice") == undefined ? "--": $prdtObj.attr("buyPrice")) +
                                                            '<span class="moneyFlag">'+ that.moneyFlag +'</span>'+
                                                            '</span>';
                                                        }
                                                    html += '</div>'+   
                                                '</div>'+
                                                '<div class="stock-blk">'+
                                                    '<div class="row">'+
                                                        '<span class="key">持仓数</span>'+
                                                        '<span class="value">'+ $prdtObj.attr("stkCnt") +'</span>'+
                                                    '</div>'+
                                                    '<div class="row">'+
                                                        '<span class="key">可用数</span>'+
                                                        '<span class="value">'+ $prdtObj.attr("enableAmount") +'</span>'+
                                                    '</div>'+
                                                    '<div class="row">'+
                                                        '<span class="key">市值</span>';
                                                        if(newMoneyFlag !==""){
                                                            html += '<span class="value">'+ 
                                                            '<span class="moneyFlag">￥</span>'+
                                                            $prdtObj.attr("stkMkt") +'</span>';
                                                        }else{
                                                            html += '<span class="value">'+ $prdtObj.attr("stkMkt") +
                                                            '<span class="moneyFlag">'+that.moneyFlag +'</span>'+
                                                            '</span>';
                                                        }
                                                    html += '</div>'+
                                                '</div>'+
                                            '</div>'+
                                            opts+
                                        '</div>';
                            allHtml  += html;                 
                        }
                            $(".res-list").html(allHtml);

                    }else{
                        $(".stock-empty").removeClass("none");
                    }
                    $('.m-info-mask').addClass("hidden");
                }
            });
        },
        //获取大盘涨跌幅
        getMaketRate: function(){
            var that = this;
            var url ='/reqxml?action=60&MobileCode=($MobileCode)&Token=($Token)&Reqno=($Reqno)&Account=($account)&Grid='+that.grid+'&MaxCount=1&StartPos=1&StockIndex=1';
            ajax.run(url,"",function(data){
                 if (data.GRID0) {
                    if (data.ERRORNO == 1 || data.ERRORNO == 2) {//成功
                        
                        /*var val = data.GRID0[1].split("|")[1];*/
                        var arr= that.strToArrs(data.GRID0);
                        var val = that.strToArrPos(arr,1,'幅度');
                        if(val.substring(0,1) !== '-'){
                            val = '+'+val;
                        }
                        $(".marketRate").html(val)
                    } else {//失败
                        alert(data.ErrorMessage);
                    }
                }
            });
        },
        strToArrs: function (arr) {
            var b = [];
            for (var i = 0, j = arr.length; i < j; i++) {
                var a = arr[i].split('|');
                a.splice(a.length - 1, 1);
                b.push(a);
            }
            return b;
        },
        strToArrPos:function(arr, i, title){
            return arr[i][$.inArray(title ,arr[0])]
        },
        touch:function(event){
            //event.preventDefault();
        },

        /**
         * [mScroll 页面滚动指定元素的底部]
         * @param  {[type]} obj [description]
         * @return {[type]}     [description]
         */
        mScroll: function(obj) {
            // iscroll用
            var height = $(window).height(), //设备高度   
                pullHeight = 60, //iscroll 上拉下拉显示的高度
                emptyHeight = 8, //距底留多少像素 
                time = 500, //滑动时长         
                flag = Math.round(obj.offset().top - this.getScrollTop()), //元素距离上面的高度 - 滚动条高度        
                top = obj.offset().top + obj.height(), //算出当前元素的底部
                scrollTop = parseFloat($("#scroller").css('top')) + pullHeight,
                u_top = -(top - scrollTop - height + pullHeight + emptyHeight),
                parentObj = obj.parent(),
                parentTop = scrollTop - parentObj.offset().top - pullHeight;
            //如果父元素显示不完全，那么下滑到元素顶部位置
            parentObj.offset().top < 0 && refresh.getScroll().scrollTo(0, parentTop, time);
            //如果 距上的高度比屏幕高，表示显示不完整需要滑动到当前元素的底部
            flag >= height - obj.height() && refresh.getScroll().scrollTo(0, u_top, time);
    
        },
        /**
         * [getScrollTop 获取滚动条高度]
         * @return {[type]} [description]
         */
        getScrollTop: function() {
            var scrollTop = 0;
            if (document.documentElement && document.documentElement.scrollTop) {
                scrollTop = document.documentElement.scrollTop;
            } else if (document.body) {
                scrollTop = document.body.scrollTop;
            }
            return scrollTop;
        },
         refresh:function(){
            var that = this;
            refresh.launch("#main-wrap", {
                pullDownAction: function() {
                    if($("#clear").is(":visible")){
                        $("#clear").click();
                    }
                    //$(".stock-list .stock-obj").remove();
                    that.getData();
                    that.getMaketRate();
                },
                pullUpAction:function(){
                    return false;
                }
            });
            //$("#wrapper").css("background", "#df2424");
            //$("#wrapper").css("background", "url('images/refresh-bak.png')  fixed center");
            
            $("#scroller").css({background:"#f0eff4"})
            $("#pullDown").css({background:"#df3031"});
            $("#pullDown span").css({color:"#ffffff","opacity":"0.5","font-weight":"normal"});
            $(".pullloadPic img").attr("src","/zlcftajax/my-account/images/loading_arrow2.png");
        },
        resetCss: function() {
            //$("#scroll-wrap").css({ "background-color": "#F0EFF4","min-height": $("#scroller").height() + "px" });//, "min-height": $(window).height() + "px" 
            $(".main-wrap").css({ "background-color": "#F0EFF4", "min-height": $(window).height() + "px" });
            $("#pullUp").hide();
        },
        showMask: function(){
            $('.m-info-mask').removeClass("hidden");
        },
        bindEvent:function(){
            var that = this;
            /*点击出现操作行*/
            $(".stock-list").on("click",".stock-obj",function(){
                that.stockCode = $(this).find(".stock-code").text();
                that.stockType = $(this).find("input.stkType").val();

                var obj = $(this).find(".opt-row"); //买卖操作条
                $(this).siblings().children(".opt-row").hide(); //隐藏父元素下面的买卖操作条
                //利用slideToggle 进行状态切换
                $(obj).slideToggle("fast", "swing", function() {
                    var flag = obj.is(":hidden"); //判断当前元素是否显示
                    !flag && setTimeout(function() {
                        that.mScroll(obj)
                    }, 400); //如果显示 移动到元素位置显示出来                    
                });

            });
            //操作行点击 买、卖、行情
            $(".stock-list").on("click",".opt-row .opt-obj",function(event){
                var text = $(this).find(".opt-text").text();
                //160001 普通股票 160002 信用账户股票 160003 “沪港通” 160005“深港通”股票 160004 场内基金
                if(text === "买"){//买
                    if(that.stockType==="160002"){//融资融券
                        $(".rzrj_pop").css("top",document.body.scrollTop);
                        $(".rzrj_pop li:eq(0)").text("担保买入");
                        $(".rzrj_pop li:eq(1)").text("融资买入");
                        $(".rzrj_pop li:eq(2)").text("买券还券");
                        $(".rzrj_pop").removeClass("none")
                        document.body.addEventListener('touchmove', that.touch, false);//禁止滑动页面
                        event.stopPropagation();
                    }else if(that.stockType === "160003" ){//沪港通的marketcode是HKACCOUNT，深港通的是HKSACCOUNT
                        base.href('http://action:16010?stockcode='+that.stockCode);                        
                    }else if(that.stockType === "160005"){//沪港通的marketcode是HKACCOUNT，深港通的是HKSACCOUNT
                        base.href('http://action:16010?stockcode='+that.stockCode);                        
                    }else{
                        base.href('http://action:12310?stockcode='+that.stockCode);
                        
                    }
                }else if(text === "卖"){//卖
                    if(that.stockType==="160002"){//融资融券
                        $(".rzrj_pop").css("top",document.body.scrollTop);
                        $(".rzrj_pop li:eq(0)").text("担保卖出");
                        $(".rzrj_pop li:eq(1)").text("融券卖出");
                        $(".rzrj_pop li:eq(2)").text("卖券还款");
                        $(".rzrj_pop").removeClass("none")
                        document.body.addEventListener('touchmove', that.touch, false);//禁止滑动页面
                        event.stopPropagation();
                    }else if(that.stockType === "160003"){//沪港通的marketcode是HKACCOUNT，深港通的是HKSACCOUNT
                        base.href('http://action:16011?marketcode=HKACCOUNT&&stockcode='+that.stockCode);
                        
                    }else if(that.stockType === "160005"){//沪港通的marketcode是HKACCOUNT，深港通的是HKSACCOUNT
                        base.href('http://action:16011?marketcode=HKSACCOUNT&&stockcode='+that.stockCode);
                        
                    }else{
                        base.href('http://action:12311?stockcode='+that.stockCode);
                        
                    }
                }else if(text === "行情"){//行情
                    if(that.stockType === "160003" || that.stockType === "160005"){//港股通
                        var app = navigator.appVersion;
                        app = app.toLocaleLowerCase();
                        var url ="";
                        if(app.indexOf("iphone")>0){
                            url="http://hkstock:"+that.stockCode.replace(/[a-zA-Z]/,"");
                        }else{
                            url="http://stock:"+that.stockCode;
                        }
                        base.href(url);
                    }else{
                        base.href('http://stock:'+that.stockCode);
                    }
                }else if($(this).text() === "历史"){//历史
                    var buyPrice = $($(this).parent(".opt-row").prev(".stock-details")[0]).find(".buyPrice").text();
                    var stkName = $($(this).parent(".opt-row").parent(".stock-obj").children(".info")[0]).find(".stock-name").text();
                    var profit = $($(this).parent(".opt-row").parent(".stock-obj").children(".kuiying")[0]).find(".value2").text();
                    if(profit.indexOf("+")>-1){
                        profit = profit.substring(1);
                    }
                    if(that.moneyType==="401840"){
                        buyPrice = buyPrice.substring(0,buyPrice.length-1);
                    }else if(that.moneyType==="401344"){
                        buyPrice = buyPrice.substring(0,buyPrice.length-3);
                    }else{
                        if(that.stockType ==="160003" || that.stockType ==="160005"){
                            buyPrice = buyPrice.substring(1);
                        }
                    }
                    var newAssetProp = that.stockType =="160002" ? "150002" : "150001";
                    base.href('http://action:10061/?fullscreen=1&&type=9&&url=/zlcftajax/my-account/history-detail.htm?stockCode='+that.stockCode +'&stockType='+ that.stockType +'&assetProp='+newAssetProp+"&buyPrice="+buyPrice+"&profit="+profit+"&moneyType="+ that.moneyType +"&stockName="+encodeURIComponent(stkName));
                    
                }else{//两融，不可点击
                    event.stopPropagation();
                }
            });
            //融资融券担保买入卖出
            $(".rzrj_pop li:eq(0)").on("click",function(){
                if($(this).text()=="担保买入"){
                    base.href('http://action:15010?stockcode='+that.stockCode);
                }else{//担保卖出
                    base.href('http://action:15011?stockcode='+that.stockCode);
                }
            });
            //融资融券融券买入卖出
            $(".rzrj_pop li:eq(1)").on("click",function(){
                if($(this).text()=="融资买入"){
                    base.href('http://action:15012?stockcode='+that.stockCode);
                }else{//融券卖出
                    base.href('http://action:15013?stockcode='+that.stockCode);
                }
            });
            //融资融券融券买入卖出
            $(".rzrj_pop li:eq(2)").on("click",function(){
                if($(this).text()=="买券还券"){
                    base.href('http://action:15014?stockcode='+that.stockCode);
                }else{//卖券还款
                    base.href('http://action:15015?stockcode='+that.stockCode);
                }
            });
            //弹窗出现内容后点击关闭操作
            $(".close_r").on("click",function(){
                $(".rzrj_pop").addClass("none")
                document.body.removeEventListener('touchmove',that.touch, false);//可以滑动页面
            })
            //搜索框
            $("#sousuo").on("input",function(){
            //$("#sousuo").bind("input value",function(){
                //var reg = new RegExp("^\d+$");
                var keyword=$.trim($(this).val());
                var type = /^\d+$/;
                var reg = new RegExp(type);
                if (!reg.test(keyword)) {
                    keyword = keyword.substring(0,keyword.length-1);
                    $(this).val(keyword);
                }
                $("#clear").removeClass("none")//输入内容之后X号出现
                if(keyword==''){
                    $("#clear").addClass("none")//如果输入后然后清除所有输入，X隐藏
                }
                $(".stock-list .stock-obj").each(function(){// 根据输入的股票代码 进行筛选数据
                    var gpdm =  $(this).find(".stock-code").text();
                    if(gpdm.indexOf(keyword)<0){
                        $(this).addClass("none")
                    }else{
                        $(this).removeClass("none")
                    }
                });
                var none_now=0;//判断模块是否有数据  1：第一或第二模块无数据   2 两个模块都无数据
                if($(".stock-list .stock-obj").length==$(".stock-list .stock-obj.none").length){//判断第一模块是否有数据
                    none_now++
                }
                if(none_now==1){
                    $("#zw").removeClass("none");
                }else{
                    $("#zw").addClass("none");
                }

            });
            //$("#sousuo").bind("input value",function(){
            //点击清楚按钮   清楚文本框里面所有输入的内容并且将数据还原
            $("#clear").on("click",function(){
                $("#sousuo").val("");
                $("#clear").addClass("none")//X号隐藏
                $("#zw").addClass("none")//暂无数据提示语隐藏
                $(".stock-list .stock-obj").removeClass("none")
              /*  $("#sousuo").parent("div").removeClass("white")*/
                /*$("#clzzp .block").removeClass("none")*/
            });
        }
    };
    myStock.init();
    //返回页面刷新页面
    /*window.GoBackOnLoad = function(){ 
        $(".m-info-mask").removeClass("hidden");
        if($("#clear").is(":visible")){
            $("#clear").click();
        }
        if($(".rzrj_pop").is(":visible")){
            $(".close_r").click();
        }
        $(".stock-list .stock-obj").remove();
        myStock.getData();
        myStock.getMaketRate();
    };*/
    window.pageJump = function(){
            var newUrl = 'http://action:10061/?fullscreen=1&&type=9&&url=/zlcftajax/my-account/history-trade.htm?assetProp='+myStock.assetProp+'&moneyType='+myStock.moneyType;
            base.href(newUrl);
        };
});
