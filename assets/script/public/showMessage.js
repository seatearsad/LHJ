cc.Class({
    extends: cc.Component,

    properties: {
        message_font:cc.Label,
        close_btn:cc.Button
    },

    // use this for initialization
    onLoad: function () {
        this.node.on("touchstart",this.emptyFunc,this);
        this.close_btn.node.on("click",this.btnCallBack,this);
        this.node.opacity = 0;
        this.node.scale = 0.3;
    },
    emptyFunc:function (event) {
        event.stopPropagation();
    },
    btnCallBack:function(){
        this.node.removeFromParent();
    },
    changeTxt:function(str){
        this.message_font.string = str;
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
