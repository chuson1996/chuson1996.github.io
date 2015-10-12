
(function(Serializer, $){
    function EventListener(){
        // this.listeners = [];
    }
    EventListener.listeners = [];
    // Saving and rebinding event handlers feature requires Serializer
    if (Serializer){
        var elSerializer;
        EventListener.savedEventListeners = [];
        EventListener.saveEventListeners = function(rootNode){
            if (!rootNode){
                console.error('rootNode is undefined');
                return;
            }
            elSerializer = new Serializer(rootNode);
            EventListener.savedEventListeners = [];
            EventListener.listeners.forEach(function(listener, i){
                /* Some how $(node).parents(node) == parents of node */
                if ($(rootNode).find(listener.node).length > 0){
                    EventListener.savedEventListeners=[];
                    EventListener.savedEventListeners.push({
                        handler: listener.handler,
                        key: listener.key,
                        node: elSerializer.serializeNode(listener.node),
                        index: i
                    })
                }
            });
            return EventListener.savedEventListeners;
        };
        EventListener.restoreEventListeners = function(rootNode){
            if (!elSerializer || elSerializer.rootNode != rootNode){
                return console.error("You haven't save event listeners or you're trying to restore event listeners of elements that are not children of this rootNode");
            }
            // Remove the obsolete event listeners. They becomes redundant when the rootNode is overriden.
            for (var i =0; i< EventListener.savedEventListeners.length; i++){
                EventListener.listeners.splice(EventListener.savedEventListeners[i].index,1);
            }
            EventListener.savedEventListeners.forEach(function(listener){
                var nNode = elSerializer.deserializeNode(listener.node);
                if (nNode){
                    // addEventListener AGAIN
                    var param = {};
                    param[listener.key] = listener.handler;
                    EventListener.addEventListener().on(nNode).with(param);
                }
            });
        }
    }

    EventListener.addEventListener=function (){
        var node;
        return {
            on: on
        };
        function on(_node ) {
            node = _node;
            return {
                with: With
            }
        }
        function With(content){
            if (!node) {
                //console.error('EventListener.addEventListener().on([Node])... Parameter 1 in on() is not of type Node!');
                return;
            }
            var linesOfKey = Object.getOwnPropertyNames(content);
            linesOfKey.forEach(function (keyString) {
                var keys = typeof keyString == "string" ? keyString.split(' ') : keyString;
                keys.forEach(function (key) {
                    if (typeof content[keyString] == "function")
                    {
                        node.addEventListener(key, content[keyString]);
                        if (/Firefox/.test(getBrowser())){
                            switch (key){
                                case 'blur':
                                    $(node).on(key, content[keyString]);
                                    break;
                                default:
                                    break;
                            }
                        }
                        EventListener.listeners.push({
                            node: node,
                            key: key,
                            handler: content[keyString]
                        });
                    }
                    else if (typeof content[keyString] == "object"){
                        var valid = true;
                        if (content[keyString].valid == false){
                            valid = false;
                        }
                        if (valid) {
                            node.addEventListener(key, content[keyString].action)
                            EventListener.listeners.push({
                                node: node,
                                key: key,
                                handler: content[keyString].action
                            });
                        }
                    }
                })
            })
        }

    };


    function getBrowser(){
        return (function(){
            var ua= navigator.userAgent, tem,
                M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
            if(/trident/i.test(M[1])){
                tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
                return 'IE '+(tem[1] || '');
            }
            if(M[1]=== 'Chrome'){
                tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
                if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
            }
            M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
            if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
            return M.join(' ');
        })();
    }

    // AMD support
    if (typeof define === "function" && define.amd) {
        // Define as an anonymous module
        define(EventListener);
    } else if(typeof module != "undefined" && module.exports){
        module.exports = EventListener
    }else {
        this.EventListener = EventListener;
    }
    return EventListener;
}).call(this, Serializer, $);