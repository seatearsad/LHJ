cc.Class({
    extends: cc.Component,

    properties: {
        cover:cc.Node,
        fantan:20,
        standard_time:0.6,
        total_col:5,
    },

    // use this for initialization
    onLoad: function () {
        this.col = {};
        
        this.test_num = 0;
        this.startShow = false;

        this.col_num = 0;

        this.cover.on("touchstart",this.emptyFunc,this);

        this.symbolNum = new Array();

        this.base_space = 12;
        this.init_space = 8;
        this.end_space = 4;
        //控制自动旋转的参数
        this.isAuto = false;
        this.total_time = 0;

        //当前已经停止列数
        this.curr_stop_col = 0;
    },
    emptyFunc:function (event) {
        event.stopPropagation();
    },
    loadAll:function(){
        //先加载图标资源
        this.symbolList = cacheManager.gameLevelList[this.main.gameLevelId].symbolList;
        this.symbolRes = [];
        
        for(var i in this.symbolList){
            if(!isNaN(i)){
                var url = this.symbolList[i].icon;
                this.symbolRes[this.symbolList[i].id] = {};
                var loadCallBack = this.loadCallBack.bind(this.symbolRes[i]);
                cc.loader.loadRes(url,cc.SpriteFrame,loadCallBack);
            }
        }

        var loadColumn = this.loadColumn.bind(this);
        cc.loader.loadRes("pre/column", loadColumn);
    },
    loadCallBack:function(err, res){//this.symbolRes[i]为此函数的this
        this.res = res;
    },
    loadColumn:function(err, prefab){
        this.col_prefab = prefab;
        this.addColumn();
        // for(var i=0;i < 5;++i){
        //     this.col_num = i;
        //     for(var j in this.symbolList){
        //         var url = this.symbolList[j].icon;
        //         var loadCallBack = this.loadCallBack.bind(this);
        //         cc.loader.loadRes(url,cc.SpriteFrame,loadCallBack);
        //     }
        //     this.test_num = 0;
        // }
        // this.col_1 = cc.instantiate(prefab);
        // this.jackpot.addChild(this.col_1);
        // this.col_1.position = cc.v2(0, 0);
    },
    addColumn:function(){
        //再加载列资源
        var J_width = this.node.width;
        var base_width = 126;
        var base_space = 12;

        var index_c = 0; 
        for(var i=0;i < this.total_col;++i){
            this.col[i] = cc.instantiate(this.col_prefab);
            this.col[i].tag = i;
            this.node.addChild(this.col[i]);
            var x = - J_width / 2 + base_space + (base_width + base_space)*i;
            // cc.log("x",x);
            this.col[i].position = cc.v2(x, 0);
            //添加本列的图标
            this.addSymbol(i);
            //绑定监听
            // this.col[i].on('touchstart',this.scroollTouchCallBack,this);

            index_c = this.col[i].zIndex;
            //查看位置
            // cc.log("x",this.col[i].getComponent(cc.ScrollView).getContentPosition().x);
            // cc.log("y",this.col[i].getComponent(cc.ScrollView).getContentPosition().y);
            // cc.log("child",this.col[i].getComponent(cc.ScrollView).content.getComponentsInChildren(cc.Sprite).length);
            // cc.log("inertia",this.col[i].getComponent(cc.ScrollView).inertia);
        }
        //使遮挡层在最上面
        this.cover.zIndex = index_c + 1;
    },
    addSymbol:function(col){
        var test_num = 0;

        var total = (col + 1);//添加图标循环数

        this.symbolFixRes = this.symbolRes.concat();

        //随机排序
        this.symbolFixRes.sort(function(){return Math.random()>0.5 ? -1 : 1;});
        
        for(var j=0;j < total;++j){
            for(var i in this.symbolFixRes){
                if(!isNaN(i)){
                    var node = this.addSymbolOne(test_num,this.symbolFixRes[i].res);

                    var content = this.col[col].getComponent(cc.ScrollView).content;
                    content.addChild(node);

                    test_num++;
                }
            }
        }
        this.symbolNum[col] = test_num;
        
        content.height = (test_num + 3) * (node.height + this.base_space) + this.end_space;
        // this.col[col].getComponent(cc.ScrollView).enabled = false;
        //loading
        // if(col == 4){
        //     this.main.removeLoading();
        // }
    },
    addSymbolOne:function(num,res){
        var type = "SpriteFrame";

        var node = new cc.Node("New " + type);
        node.anchorX = 0;
        node.anchorY = 0;
        // node = cc.instantiate(this.col_prefab);
        var component = null;
        component = node.addComponent(cc.Sprite);
        component.spriteFrame = res;
        node.setPosition(0, this.init_space + node.height * num + this.base_space * (num));
        // cc.log("position:",this.init_space + node.height * num + this.base_space * (num));
        return node;
    },
    scroollCallBack:function(event){//滚动停止监控
        var col = event.detail;
        col.getComponent(cc.ScrollView).content.height = col.getComponent(cc.ScrollView).content.height - this.fantan;
        //关闭监听
        col.node.off('scroll-ended',this.scroollCallBack,this);
        this.curr_stop_col = col.node.tag;
        if(col.node.tag == 4){
            //展现结果
            this.main.bottom.getComponent("bottomScene").updateWin(this.gameResult.payAmount);
            //开始下一次自动
            if(this.isAuto){
                // this.main.top.getComponent("topScene").times_label.string = cacheManager.auto_times;
                if(cacheManager.auto_times <= 0){
                    this.isAuto = false;
                    this.main.bottom.getComponent("bottomScene").changeState(0);
                    this.main.top.getComponent("topScene").hidden_uppop();
                }else{
                    this.autoStart();
                }
            }else{
                //更改开始按钮状态
                this.main.bottom.getComponent("bottomScene").changeState(0);
            }
            //结束展现
            this.startShow = false;
            this.curr_stop_col = 0;
        }
    },
    showMessage:function(str){//网络连接错误

        cc.log("showMessage",str);
        this.showMessageTxt = str;
        var loadShowMessage = this.loadShowMessage.bind(this);
        cc.loader.loadRes("pre/showMessage", loadShowMessage);
    },
    loadShowMessage:function(err,prefab){
        var showMessageNode = cc.instantiate(prefab);
        showMessageNode.getComponent("showMessage").changeTxt(cacheManager.language["netError"]);
        this.main.node.addChild(showMessageNode);
        var seq = cc.sequence(
            cc.fadeIn(0.2),
            cc.scaleTo(0.2,1.05),
            cc.scaleTo(0.1,1)
        )
        showMessageNode.runAction(seq);
        //更改开始按钮状态
        this.main.bottom.getComponent("bottomScene").changeState(0);
    },
    httpResp:function(resp){//协议回调
        cacheManager.initPlayerInfo(resp.playerInfo);
        this.main.updatePlayer();
        //赋值spin的结果
        this.gameResult = resp.GameResult;

        this.col_num = 0;
        
        for(var i=0;i < this.total_col;++i){
            var showReel=resp.GameResult.showReel[i];
            var content = this.col[i].getComponent(cc.ScrollView).content;
            var num = this.symbolNum[i];
            var child = this.col[i].getComponent(cc.ScrollView).content.getComponentsInChildren(cc.Sprite).length;
            
            if(child > num){
                for(var k=1;k < 4;++k){
                    var child_arr = this.col[i].getComponent(cc.ScrollView).content.getComponentsInChildren(cc.Sprite);
                    var t_num = child_arr.length - 1;
                    var t_child = child_arr[t_num].node.removeFromParent();
                }
            }

            // cc.log(num,child);
            // var node = this.addSymbolOne(num,this.symbolRes[0].res);
            // content.addChild(node);
            var pos = 0;
            for(var j=(showReel.length - 1);j >= 0;--j){
                var id = showReel[j];
                var addNum = num + pos;
                var node = this.addSymbolOne(addNum,this.symbolRes[id].res);
                content.addChild(node);

                pos++;
            }
            var timeL = this.standard_time*(i + 1);
            content.y = 0;
            content.height += this.fantan;
            // this.col[i].getComponent(cc.ScrollView).enabled = true;
            this.col[i].getComponent(cc.ScrollView).scrollToPercentVertical(1,timeL,false);
            //绑定监听
            this.col[i].on('scroll-ended',this.scroollCallBack,this);
            // this.col[i].getComponent(cc.ScrollView).scrollToPercentVertical(0.99,true);

            this.startShow = true;
        }
    },
    // scroollTouchCallBack:function(event){
    //     cc.log("touch");
    //     var col = event.detail;
    //     col.getComponent(cc.ScrollView).enabled = false;
    // },
    startSlots:function(){
        var send = {};
        message.sendData(messageDefine.game_result,send,this);
    },
    autoStart:function(){
        this.isAuto = true;
        this.total_time = 0;
        this.isSend = false;
    },
    fastStop:function(){//快速停止
        var baseTime = 0.1;
        for(var i = this.curr_stop_col + 1;i <= 4;++i){
            var timec = baseTime * i;
            this.col[i].getComponent(cc.ScrollView).scrollToPercentVertical(1,timec,false);
        }
    },
    clearAuto:function(){
        this.isAuto = false;
        this.total_time = 0;
        this.isSend = true;
        this.main.top.getComponent("topScene").hidden_uppop();
        if(!this.startShow)
            //更改开始按钮状态
            this.main.bottom.getComponent("bottomScene").changeState(0);
    },
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if(this.isAuto){
            this.total_time += dt;
            if(this.total_time > 1 && !this.isSend){
                cacheManager.auto_times--;
                this.startSlots();
                this.main.top.getComponent("topScene").times_label.string = cacheManager.auto_times;
                this.isSend = true;
            }
        }
    },
});
