/*      ------ Super class -----          
 *     prototype of jstree for information and edit link page 
 *      upload file tree will use its own class, because it is too complicated
 * 
 * ****/

function Filetree(id, height){
    this.tree = $(id); 
    this.height = height;
};
Filetree.prototype ={
    constructor: Filetree,
    initTree: function(json){
        var _this = this;                                                       //console.log("this.plugins", this.plugins);
        this.tree.jstree({
                "core" : {
                    //"animation" : 0,
                    "multiple": false,
                    "check_callback" : false,
                    "themes" : { "stripes" : true },
                    "data" : json
                },
                "types" : { "#" : {"max_children" : 8, "max_depth" :8, "valid_children" : ["root"]},
                    "root" : { "icon" : "assets/tree_icon.png","valid_children" : ["default"] },
                    "default" : {"valid_children" : ["folder", "file"]},
                    "folder": {"valid_children" : ["folder","file"]},
                    "tag": {"icon" : "fa fa-file-o", "valid_children" : ["file"]},
                    "file" : { "icon" : "glyphicon glyphicon-file", "valid_children" : []} 
                },
                "search": {
                    "case_insensitive": true,
                    "show_only_matches" : true
                },
                "plugins" : _this.plugins || ["types", "state", "dnd", "search"]
            }).bind("hover_node.jstree", function(event, data){                            //console.log(data);
                 $("#"+data.node.id).prop("title", data.node.text);
            }).bind("loaded.jstree", function (event, data) {
                $(this).css("height", _this.height);                             
                var $tree = $(this);                                            //console.log($tree);
                $($tree.jstree().get_json("#", {flat: true}))
                    .each(function(index, value) {
                          var node = $tree.jstree().get_node(this.id);
                          if(node.type === "tag" && node.children.length) 
                              $tree.jstree().set_icon(node.id, "glyphicon glyphicon-file");
                    });
                App.initSlimScroll(_this.tree);
                var search = $("input[name='query']").val();
                if(search.length) $('#jsECTDtree').jstree('search', search);
                $("input[name='query']").keyup(function(){
                        var searchString = $(this).val();
                        $('#jsECTDtree').jstree('search', searchString);                //console.log($(this).val());
                });
            }).bind("select_node.jstree", function (e, data) { 
                if(_this.selectNodeHandler) _this.selectNodeHandler(data);
            }).bind("dblclick.jstree", function(event){
                _this.dblclickEventHandler(event);                              
            }).on('copy_node.jstree', function (e, data) {
                if(_this.copyNodeHandler) _this.copyNodeHandler(data);
            }).on('delete_node.jstree', function (e, data) {
                if(_this.deleteNodeHandler) _this.deleteNodeHandler(data);
            }).on('move_node.jstree', function (e, data) {
                if(_this.moveNodeHandler) _this.moveNodeHandler(data);
            });
    },
    setSelectNodeHandler: function(selectNodeHandler){
        this.selectNodeHandler = selectNodeHandler;
        return this;
    },
    setCopyNodeHandler: function(copyNodeHandler){
        this.copyNodeHandler = copyNodeHandler;
        return this;
    },
    setDeleteNodeHandler: function(deleteNodeHandler){
        this.deleteNodeHandler = deleteNodeHandler;
        return this;
    },
    setMoveNodeHandler: function(moveNodeHandler){
        this.moveNodeHandler = moveNodeHandler;
        return this;
    },
    setController: function(ctrlId){
        this.ctrlId = ctrlId;
        return this;
    },
    toggle: function(open){
        if (open)
            this.tree.jstree().close_node(["m1", "m2", "m3", "m4", "m5"]); 
        else
            this.tree.jstree("open_all");
    },
    dblclickEventHandler: function(event){
        var nodeId = $(event.target).closest("li")[0].id;
        var node = this.tree.jstree(true).get_node(nodeId);             //console.log(node); 
        if(node && node.type=="file"){ 
            var uuid = node.id;                                   
            var userData = angular.element(this.ctrlId).scope().getUserData();  //console.log("UUID: ",uuid, userData );

            var url = Base_URL + "/a/application/file/download/" + uuid +"/?uid=" + userData.uid +"&apptoken=" + userData.access_token;
            this.openIframe( url);
        }
    },
    openIframe: function(url){
        var w = $(window).width(), h = $(window).height(), gap = 100;
        var layer = $("<div>").attr("id", "layer")
                .css({"position": "absolute", "top": 0, "left": 0, "width": w, "height": $(document).height(), "background-color": "rgba(0, 0, 0, 0.5)", "text-align": "center", "z-index": 1001 });
        var iframe = $("<iframe>").attr("id", "frame")
                .css({"position": "absolute","top":gap,"left":w/4 ,"width": w/2, "height": h-gap*2, "border": "solid 1px #999"});        

        $("body").append(layer);
        $("#layer").click(function(){
            $(this).remove();
        });
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';

        xhr.onprogress = function(e){        //console.log (e);
            if (e.lengthComputable) {
                var progress = e.loaded/e.total; 
                                                                                //console.log(progress); 
            }
        };
        xhr.onload = function(e) {
            if (this.status === 200) {
                var blob = new Blob([this.response], {type: 'application/pdf'}),
                file = URL.createObjectURL(blob);                               //console.log(file);
                layer.append(iframe);
                $("#frame").attr("src", file);
            }
        };
        xhr.send();
    }
};
