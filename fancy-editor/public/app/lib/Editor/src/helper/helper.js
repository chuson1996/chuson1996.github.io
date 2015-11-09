/**
 * Created by chuso_000 on 19/9/2015.
 */

import Figure from '../Figure/Figure.js';
import node from './dom.js';

export default (function(){
    return {
        decorateWithBeforeValidator,
        decorateAfter,
        node,
        isLineEmpty,
        swap,
        isCurrentRangeInEditorContainer,
        testImageUrl,
        moveCursorTo,
        assign,
        getBrowser,
        isAtStartOfLine,
        isAtEndOfLine



    };
    function isAtStartOfLine(block, range){
        //console.log('Testing isAtStartOfLine');
        let lR = rangy.createRange();
        //console.log(block);
        //console.log(range.endContainer);
        lR.selectNodeContents(block);
        lR.setEnd(range.endContainer, range.endOffset);
        //console.log($(lR.cloneContents()));
        return !lR.cloneContents().textContent;

    }
    function isAtEndOfLine(block, range){
        //console.log('Testing isAtEndOfLine');
        let rR = rangy.createRange();
        rR.selectNodeContents(block);
        rR.setStart(range.startContainer, range.startOffset);
        return !rR.cloneContents().textContent
    }
    function assign(dest, source){
        if (typeof source != "object" || typeof dest != "object") return;
        Object.getOwnPropertyNames(source).forEach(function (souKey) {
            if (!dest[souKey]) dest[souKey] = source[souKey];
        });
    }
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
    function moveCursorTo({startContainer, startOffset, endContainer, endOffset, collapse}){
        startOffset = startOffset || 0;
        endOffset = endOffset || 0;
        let newR = rangy.createRange();
        if (collapse !== undefined){
            let lastTN = _.last(node(startContainer).findTextNodes());
            newR.selectNodeContents(lastTN || startContainer);
            newR.collapse(collapse);
            rangy.getSelection().removeAllRanges();
            rangy.getSelection().addRange(newR);
            return ;
        }
        if (startOffset) newR.setStart(startContainer, startOffset);
        if (endOffset) newR.setEnd(endContainer, endOffset);
        else{
            endContainer = startContainer;
            endOffset = startOffset;
        }
        if (startContainer)
        {
            rangy.getSelection().removeAllRanges();
            rangy.getSelection().addRange(newR);
        }

    }

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
    



    function isLineEmpty(pContainer){
        if (!pContainer || !pContainer.textContent){
            //console.log(`This bitch don't even have textContent: `, pContainer);
            return true;
        }
        return !pContainer.textContent.trim();
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

