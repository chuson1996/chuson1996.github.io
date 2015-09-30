(function($){
    function Serializer(rootNode){
        this.rootNode = rootNode;
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
            return JSON.stringify({
                startOffset: range.startOffset,
                endOffset: range.endOffset,
                startContainer: serialize.call(this, range.startContainer ),
                endContainer: serialize.call(this, range.endContainer )
            });
        else throw new Error("The range is not in the rootNode");
    }
    function deserializeRange(range){
        range = JSON.parse(range);
        var parentNode = this.rootNode;
        var nR = document.createRange();

        nR.setStart(deserialize.call(this, range.startContainer), range.startOffset);
        // nR.setStart(deserialize(range.startContainer, parentNode), 0);
        nR.setEnd(deserialize.call(this, range.endContainer), range.endOffset);
        // nR.setEnd(deserialize(range.endContainer, parentNode), 0);
        return nR;
    }
    function serialize(elem){
        var parentNode = this.rootNode;

        if (!$(parentNode).find(elem).length) {
            console.error('$(editor).find(elem) is empty');
            console.error($(parentNode));
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
            if (textNodeNth) {
                elem = _.reduce(elem.childNodes, function(result, node){
                    if (node.nodeName.toUpperCase() == "#TEXT"){
                        result.push(node);
                    }
                    return result;
                }, [])[textNodeNth];
                // console.log(elem);
                // console.log(textNodeNth);
            }
            // console.log(elem);
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
                i++;
            }
        }
        return i;
    }



}).call(this, $);