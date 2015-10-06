/**
 * Created by chuso_000 on 19/9/2015.
 */

import Figure from '../main/Editor/Figure/Figure';

export default (function(){
    return {
        decorateWithBeforeValidator,
        decorateAfter,
        addEventListener,
        node,
        isLineEmpty,
        swap,
        isCurrentRangeInEditorContainer,
        testImageUrl,



    };
    function decorateWithBeforeValidator(sc, property, beforeValidator){
        if (typeof property == "string") property = property.split(' ');

        // Ex: decorateWithBeforeValidator(scope, ['applyBold', 'doSomethingElse'], validator, [arguments of applyBold], [arguments of doSomethingElse]);
        property.forEach(function (p,i) {
            var afterCb = sc[p].bind(sc,arguments[i]);
            sc[p] = function(){
                if (beforeValidator())
                {
                    afterCb();
                }

            }
        })

    }
    function decorateAfter(sc, property, afterCb){
        if (typeof property == "string") property = property.split(' ');

        // Ex: decorateWithBeforeValidator(scope, ['applyBold', 'doSomethingElse'], validator, [arguments of applyBold], [arguments of doSomethingElse]);
        property.forEach(function (p,i) {
            var beforeCb = sc[p].bind(sc,arguments[i]);
            sc[p] = function(){
                beforeCb();
                afterCb();
            }
        })

    }
    function addEventListener(){
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
                        node.addEventListener(key, content[keyString]);
                    else if (typeof content[keyString] == "object"){
                        var valid = true;
                        if (content[keyString].valid == false){
                            valid = false;
                        }
                        if (valid) node.addEventListener(key, content[keyString].action)
                    }
                })
            })
        }

    }
    function node(_node) {
        return{
            isChildOf,
            findSibling,
            isOneOfTheseNodes,
            parentOfTypes,
            removeAttributes,
            editorFormat,
            after, //deprecated
            split,
            findTextNodes,
            isFirstNodeIn,
            isLastNodeIn,
            nodeChildLoop
        };

        function isChildOf(parent) {
            if (typeof _node == "string")
                return $(_node).parents(parent).length > 0;
            if (typeof _node == "object")
                return $(parent).find(_node).length > 0;
        }
        function findSibling(sibling){
            return{
                in: In
            };
            function In(parent){
                return $(_node).parents(parent).find(sibling)[0];
            }
        }
        function isOneOfTheseNodes(nodes){
            if (typeof nodes == "string") nodes = nodes.split(' ');
            return nodes.indexOf(_node.nodeName.toUpperCase()) > -1;
        }

        function parentOfTypes(types){
            if (typeof types == "string") types = types.split(' ');
            if (types.indexOf(_node.nodeName.toUpperCase()) > -1) return _node;
            for(var i = 0; i< types.length; i++){
                if ($(_node).parents(types[i]).length >0 ) return $(_node).parents(types[i])[0];
            }
            return null;
        }
        function removeAttributes(){
            //console.log(_node);
            if (!_node.nodeName && _node.length && _node.length > 0){
                _.forEach(_node, (n)=>{
                    if (n.nodeName.toUpperCase() != "#TEXT" && n.nodeName.toUpperCase() != "#COMMENT") node(n).removeAttributes();
                    //if (n.nodeName.toUpperCase() == "#TEXT" && !n.textContent.trim())
                    //{
                    //    console.log(_node);
                    //    _node.remove(n);
                    //}
                    //if (n.nodeName.toUpperCase() == "#COMMENT")
                    //{
                    //    console.log(_node);
                    //    _node.remove(n);
                    //}
                })
            }else{
                if (_node.attributes.length > 0){
                    let attributesToDelete = _.map(_node.attributes, function (attr) {
                        return attr.nodeName;
                    });
                    if (_node.nodeName.toUpperCase() == "IMG" && _.indexOf(attributesToDelete, "src") > -1){
                        _.remove(attributesToDelete, (n)=>n=="src");
                    }
                    if (_node.nodeName.toUpperCase() == "A" && _.indexOf(attributesToDelete, "href") > -1){
                        _.remove(attributesToDelete, (n)=>n=="href");
                    }
                    //console.log(`attributesToDelete: `, attributesToDelete);
                    _.forEach(attributesToDelete, (a)=>{
                        //console.log(`Removing ${a} from `, $(_node));
                        _node.removeAttribute(a);

                    });
                }
                if (_node.hasChildNodes()) node(_node.childNodes).removeAttributes();
            }
        }
        function editorFormat(){
            let elementBlocks = "P BLOCKQUOTE H1 H2 H3 PRE".split(' ');
            $(_node).find('div').children().unwrap("div");
            $(_node).find('span').each(function(){
                $(this.childNodes).unwrap()
            });

            //
            _.forEach(_node.childNodes, (n)=>{
                if (_.indexOf(elementBlocks, n.nodeName) == -1 && n.nodeName.toUpperCase() != "IMG"){
                    $(n).wrap("<p></p>");
                }
                //else if (n.nodeName == "IMG"){
                //    var nImg = new Figure(n.attributes.src.value);
                //    $(n).after(nImg.elements.container);
                //    n.remove();
                //}
            });

            // Normalize text nodes
            _node.innerHTML = _node.innerHTML;


            node(_node).nodeChildLoop((n)=>{
                let $imgs = n.nodeName.toUpperCase() == "IMG" ? $(n) : $(n).find('img');
                //console.log($imgs.length);
                if ($imgs.length > 0){
                    _.forEach($imgs, (img)=>{
                        //console.log('Adding new Figure');
                        $(n).before(new Figure(img.attributes.src.value).elements.container);
                    });
                    $imgs.remove();
                }
            });
            
            // Clean up #comment, empty #text nodes and empty node
            for(var i=0; i< _node.childNodes.length; i++){
                var _nodeS = _node.childNodes[i];
                if (_nodeS.nodeName.toUpperCase() == "#COMMENT" || (_nodeS.nodeName.toUpperCase() == "#TEXT" && _nodeS.textContent.trim() == ""))
                {
                    _nodeS.remove();
                    i--;
                }
                if (_nodeS.nodeName.toUpperCase() != "IMG" && !_nodeS.innerText.trim()){
                    _nodeS.remove();
                    i--;
                }
            }

            // If an figure is an the end, append a <p><br/></p> after it!
            if (_node.lastChild.nodeName.toUpperCase() == "DIV" && /figure/i.test(_node.lastChild.className)){
                $(_node).append("<p>&nbsp;</p>");
                //var newP = document.createElement('p');
                //newP.appendChild(document.createTextNode(""));
                //_node.appendChild(newP);

            }
        }

        // Deprecated
        function after(elements){
            if (elements.length > 0){
                $(_node).after(elements[0]);
                for(var i = 1; i< elements.length; i++){
                    $(elements[i-1]).after(elements[i]);
                }
            }
        }

        function findTextNodes(){
            var textNodes = [];
            if (_node.childNodes && _node.childNodes.length){
                for (var i=0; i < _node.childNodes.length; i++){
                    var child = _node.childNodes[i];
                    //console.log(child);
                    //console.log('Before:',textNodes);
                    //console.log(node(child).findTextNodes());
                    textNodes = textNodes.concat(node(child).findTextNodes());
                    //console.log('After: ',textNodes);
                }

            }else{
                if (_node.nodeName.toUpperCase() == "#TEXT") textNodes.push(_node);
            }
            return textNodes;
        }

        function isFirstNodeIn(rootNode){
            if (!isChildOf(rootNode)) return false;
            var vNode = _node;
            //if (rangy.dom.getNodeIndex(vNode) !== 0) return false;
            while (vNode!= rootNode){
                if (rangy.dom.getNodeIndex(vNode) !== 0) return false;
                vNode = vNode.parentNode;
            }
            return true;
        }
        function isLastNodeIn(rootNode){
            if (!isChildOf(rootNode)) return false;
            var vNode = _node;
            //if (rangy.dom.getNodeIndex(vNode) !== 0) return false;
            while (vNode!= rootNode){
                if (rangy.dom.getNodeIndex(vNode) !== rangy.dom.getNodeLength(vNode.parentNode) - 1) return false;
                vNode = vNode.parentNode;
            }
            return true;
        }

        /* If there's a new child in the rootNode during the loop, nodeChildLoop will ignore that. */
        function nodeChildLoop(cb){
            var _rootNodeV = [];
            _.forEach(_node.childNodes, (cn)=>{
                _rootNodeV.push(cn);
            });

            _.forEach(_rootNodeV, function(_nodeV){
                cb(_nodeV);
            });

        }

        function split(node, offset){
            var blockL = document.createElement(_node.nodeName),
                blockR = document.createElement(_node.nodeName);

            var rangeL = rangy.createRange();
            rangeL.setStart(_node.firstChild, 0);
            rangeL.setEnd(node, offset);

            var rangeR = rangy.createRange();
            rangeR.setStart(node, offset);
            rangeR.setEnd(_node.lastChild, rangy.dom.getNodeLength(_node.lastChild));

            var contentL = rangeL.extractContents(),
                contentR = rangeR.extractContents();

            while(contentL.firstChild) blockL.appendChild(contentL.firstChild);
            while(contentR.firstChild) blockR.appendChild(contentR.firstChild);

            _node.parentNode.insertBefore(blockL, _node);
            _node.parentNode.insertBefore(blockR, _node);

            _node.remove();

            return [blockL, blockR];
        }

    }




    function isLineEmpty(pContainer){
        if (!pContainer || !pContainer.innerText){
            //console.log(`This bitch don't even have innerText: `, pContainer);
            return true;
        }
        return !pContainer.innerText.trim();
    }
    function swap(v1, v2){
        let c = v1;
        v1 = v2;
        v2 = c;
    }
    function isCurrentRangeInEditorContainer(editorContainer){
        let {baseNode, extentNode} = rangy.getNativeSelection();
        return ($(editorContainer).has($(baseNode)).length > 0 && $(editorContainer).has($(extentNode)).length>0);
    }
    function testImageUrl(url, callback, timeout) {
        timeout = timeout || 5000;
        var timedOut = false, timer;
        var img = new Image();
        img.onerror = img.onabort = function() {
            if (!timedOut) {
                clearTimeout(timer);
                callback(url, "error");
            }
        };
        img.onload = function() {
            if (!timedOut) {
                clearTimeout(timer);
                callback(url, "success");
            }
        };
        img.src = url;
        timer = setTimeout(function() {
            timedOut = true;
            callback(url, "timeout");
        }, timeout);
    }




})();

