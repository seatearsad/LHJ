cc.Class({
    extends: cc.Component,

    properties: {
        start_btn:cc.Button,
        stop_btn:cc.Button,
        info_btn:cc.Button,
        max_bet_btn:cc.Button,
        auto_btn:cc.Button,
        line_btn:cc.Button,
        bet_btn:cc.Button,
        win_label:cc.Label,
        bet_total_label:cc.Label,
        line_label:cc.Label,
        bet_label:cc.Label,
        auto_list:cc.Node,
        win_num:0,
        bet_num:1
    },

    // use this for initialization
    onLoad: function () {
        this.start_btn.node.on('click',this.startGame,this);
        this.info_btn.node.on('click',this.btnCallBack,this);
        this.max_bet_btn.node.on('click',this.btnCallBack,this);
        this.auto_btn.node.on('click',this.autoCallBack,this);
        this.line_btn.node.on('click',this.btnCallBack,this);
        this.bet_btn.node.on('click',this.btnCallBack,this);

        this.auto_num = [10,20,50,100,200];

        var loadAutoList = this.loadAutoList.bind(this);
        this.auto_show = false;
        this.auto_list.opacity = 0;
        this.auto_list.zIndex = this.auto_btn.node.zIndex - 1;

        cc.loader.loadRes("pre/auto_num_btn", loadAutoList);
    },
    startGame:function(){
        cc.log("start game!");
        this.main.jackpot.getComponent("slotScene").startSlots();
        this.changeState(1);
        this.stop_btn.node.on("click",this.stopSpin,this);
    },
    autoCallBack:function(){
        if(this.auto_show){
                var seq = cc.sequence(
                cc.moveTo(0.2,cc.v2(0, -260)),
                cc.fadeOut(0.2)
            )
            this.auto_show = false;
        }else{
            var seq = cc.sequence(
                cc.fadeIn(0.2),
                cc.moveTo(0.2,cc.v2(0, 24))
            )
            this.auto_show = true;
        }

        this.auto_list.runAction(seq);
    },
    btnCallBack:function(event){
       var btn = event.detail;
       cc.log(btn.name);
    },
    loadAutoList:function(err,res){
        this.buttonPre = res;

        for(var i=0;i < this.auto_num.length;++i){
            var base_space = 2;

            var num_btn = cc.instantiate(this.buttonPre);
            var height = num_btn.height;
            num_btn.on("click",this.clickAutoNum,this);

            num_btn.getComponentInChildren(cc.Label).string = this.auto_num[i];
            this.auto_list.addChild(num_btn);

            var hh = (height + base_space) * i + base_space;
            num_btn.position = cc.v2(0, hh);
        }
    },
    clickAutoNum:function(event){
        var btn = event.detail;
        var num = btn.node.getComponentInChildren(cc.Label).string;
        cacheManager.auto_times = num;

        this.autoCallBack();
        this.main.top.getComponent("topScene").show_uppop(0);

        this.main.jackpot.getComponent("slotScene").autoStart();
        
        //处理开始按钮的样式
        this.changeState(1);

        this.stop_btn.node.on("click",this.stopAuto,this);
    },
    changeState:function(stat){//stat 0 结束 1 开始
        if(stat == 1){
            this.start_btn.node.active = false;
            this.stop_btn.node.active = true;
        }else{
            this.start_btn.node.active = true;
            this.stop_btn.node.active = false;
        }
    },
    stopAuto:function(){
        this.stop_btn.node.off("click",this.stopAuto,this);
        cacheManager.auto_times = 0;
        this.main.jackpot.getComponent("slotScene").clearAuto();
    },
    stopSpin:function(){
        this.stop_btn.node.off("click",this.stopSpin,this);
        this.main.jackpot.getComponent("slotScene").fastStop();
    },
    updatePlayer:function(){
        var playerInfo = cacheManager.playerInfo;
        this.bet_label.string = playerInfo.level_bet[this.main.gameLevelId].bet;
        this.line_label.string = playerInfo.level_line[this.main.gameLevelId].line;
        this.bet_total_label.string = playerInfo.level_bet[this.main.gameLevelId].bet * playerInfo.level_line[this.main.gameLevelId].line;
        this.win_label.string = this.win_num;
    },
    updateWin:function(win){
        this.win_label.string = win;
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
