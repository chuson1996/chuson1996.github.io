(function($){
    function Serializer(rootNode){
        this.rootNode = rootNode;

        this.defaultRange = document.createRange();
        this.defaultRange.selectNodeContents(rootNode);
        this.defaultRange.collapse(true);
    }
    Serializer.prototype = {
        serializeRange : serializeRange,
        deserializeRange: deserializeRange,
        serializeNode: serialize,
        deserializeNode: deserialize,
        nth: nth
    };
    Serializer.nth = nth;



    // AMD support
    if (typeof define === "function" && define.amd) {
        // Define as an anonymous module
        define(Serializer);
    } else if(typeof module != "undefined" && module.exports){
        module.exports = Serializer;
    }else {
        this.Serializer = Serializer;
    }

    return Serializer;
    function serializeRange(range){
        var parentNode = this.rootNode;


        // Justify the range is in the rootNode
        if ($(parentNode).find(range.startContainer).length && $(parentNode).find(range.endContainer).length)
        {
            //console.log(range);
            return JSON.stringify({
                startOffset: range.startOffset,
                endOffset: range.endOffset,
                startContainer: serialize.call(this, range.startContainer ),
                endContainer: serialize.call(this, range.endContainer )
            });
        }

        else throw new Error("The range is not in the rootNode");
    }
    function deserializeRange(range){
        range = JSON.parse(range);
        var parentNode = this.rootNode;
        var nR = document.createRange();
        var startContainer = deserialize.call(this, range.startContainer);
        var endContainer = deserialize.call(this, range.endContainer);
        if (!startContainer || !endContainer || !isNode(startContainer) || !isNode(endContainer)) {
            console.log('Using defaultRange because');
            console.log('Range: ', range);
            //console.log('startContainer:', startContainer);
            //console.log('endContainer:', endContainer);
            //console.log('isNode(startContainer): ',isNode(startContainer));
            //console.log('isNode(endContainer):', isNode(endContainer));
            return this.defaultRange;
        }
        nR.setStart(startContainer, range.startOffset);
        nR.setEnd(endContainer, range.endOffset);
        return nR;
    }
    function serialize(elem){
        var parentNode = this.rootNode;

        if (!$(parentNode).find(elem).length) {
            return "";
        }
        var se=[];
        var vEl = elem;
        while(vEl!=parentNode){
            // if (vEl.nodeName.toUpperCase()!="#TEXT")
            se.push(vEl.nodeName+":nth("+nth(vEl)+")");
            vEl = vEl.parentElement;
        }
        se.reverse();
        se = se.join(">");
        //console.log('Serialize: ' + se);
        return se;
    }
    function deserialize(series){
        var parentNode = this.rootNode;
        var se = series.split('>');
        var textNodeNth, elem;
        if (/^\#TEXT\:nth\(/i.test(se[se.length-1].toUpperCase())){
            textNodeNth = se.splice(se.length-1, 1)[0];
            textNodeNth = (textNodeNth.toUpperCase().replace(/^\#TEXT\:NTH\(/,'').replace(/\)/,''));
            // console.log(textNodeNth);
            // console.log(se);
        }
        se = se.join('>');
        if ($(parentNode).find(se)){
            elem =  $(parentNode).find(se)[0];
            //console.log(elem);
            if (!elem) {
                elem = parentNode.firstElementChild;
                console.error('Cannot deserialize: ' + series + '\nUsing the first element node in rootNode by default.');
            }
            else if (textNodeNth) {
                elem = _.reduce(elem.childNodes, function(result, node){
                    if (node.nodeName.toUpperCase() == "#TEXT"){
                        result.push(node);
                    }
                    return result;
                }, [])[textNodeNth];


                ///* After overriding the node, empty text nodes cannot recover themselves --> Recreate them */
                //if (!elem){
                //    elem = document.createTextNode("");
                //    parentNode.appendChild(elem);
                //}
                // console.log(textNodeNth);
            }

            //console.log(elem);
            //console.log(parentNode.cloneNode(), se);
            return elem;
        }

        return null;
    }
    function nth(elem){
        var i=0;
        var vElem = elem;
        while(vElem){
            vElem = vElem.previousSibling;
            if (vElem && vElem.nodeName == elem.nodeName)
            {
                //console.log(vElem);
                i++;
            }
        }
        return i;
    }
    function isNode(obj){
        return (obj.nodeType && obj.nodeType>0 && obj.nodeType < 13);
    }



}).call(this, $);