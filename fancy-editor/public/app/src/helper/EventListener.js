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
            var linesOfKey = Object.getOwnPropertyNames(content);
            linesOfKey.forEach(function (keyString) {
                var keys = typeof keyString == "string" ? keyString.split(' ') : keyString;
                keys.forEach(function (key) {
                    if (typeof content[keyString] == "function")
                    {
                        node.addEventListener(key, content[keyString]);
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