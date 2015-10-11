/**
 * Created by chuso_000 on 19/9/2015.
 */

import hp from '../../helper/helper';

export default (function (){
    var classAppliers;
    if (rangy.supported && rangy.modules.ClassApplier && rangy.modules.ClassApplier.supported) {
        classAppliers ={
            bold: rangy.createClassApplier('bold',{
                tagNames: ['span']
            }),
            highlight: rangy.createClassApplier('highlighted',{
                tagNames: ['span','b']
            }),
            blockquote: rangy.createClassApplier('blockquote',{
                elementTagName: 'blockquote'
            }),
            textAlignCenter: rangy.createClassApplier('alignCenter',{
                tagNames: ['p']
            })
        };
    }

    let justify = {
        center() {
            document.execCommand('justifyCenter');
        },
        left(){
            document.execCommand('justifyLeft');
        },
        right(){
            document.execCommand('justifyRight');
        },
        auto(){
            if (document.queryCommandState('justifyLeft')) this.center();
            else if (document.queryCommandState('justifyCenter')) this.right();
            else if (document.queryCommandState('justifyRight')) this.left();
        }
    };
    return {
        bold,
        highlight,
        justify,
        replacePWith,
        blockquote,
        h1,
        h2
    };

    ////
    function bold(){
        document.execCommand('bold');
    }

    function highlight(){
        classAppliers.highlight.toggleSelection();
        //document.execCommand('backColor', true, 'yellow');
    }


    function replacePWith(nodeName){
        let _bookmark = rangy.getSelection().getBookmark();
        let {startContainer, endContainer}=rangy.getSelection().getRangeAt(0);
        let mainNodeTypes = "BLOCKQUOTE P H1 H2".split(' ');

        /* Trying to assign startContainer to one of these parent nodes ["P",nodeName] */
        if (!hp.node(startContainer).isOneOfTheseNodes(mainNodeTypes)){
            startContainer = hp.node(startContainer).parentOfTypes(mainNodeTypes);
            if (!startContainer) return ;
        }

        /* Trying to assign endContainer to one of these parent nodes ["P",nodeName] */
        if (!hp.node(endContainer).isOneOfTheseNodes(mainNodeTypes)){
            endContainer = hp.node(endContainer).parentOfTypes(mainNodeTypes);
            if (!endContainer) return ;
        }

        /* startContainer must comes before endContainer, therefore to use nextUntil() */
        let parentContainer = startContainer.parentElement;
        if ($(parentContainer).index(startContainer) > $(parentContainer).index(endContainer)){
            hp.swap(startContainer, endContainer);
        }

        /* Find elements in between in the selection */
        let elems = [startContainer];
        if (startContainer != endContainer)
            $(startContainer).nextUntil(endContainer).each(function (n) {
                elems.push(this);
            });
        if (startContainer!=endContainer)
            elems.push(endContainer);

        /* If all elements is of type nodeName, replace them all with P nodes */
        if (_.all(elems, (elem) => elem.nodeName == nodeName)){
            elems.forEach(function (elem) {
                let newP = document.createElement('p');
                let textContent = elem.innerHTML || document.createTextNode("<br>");
                $(newP).html(textContent);
                $(elem).replaceWith(newP);
            })
        }else{
            // Replace those that are not of type nodeName with nodeName nodes
            elems.forEach(function (elem) {
                if (hp.node(elem).isOneOfTheseNodes(mainNodeTypes) && elem.nodeName.toUpperCase() != nodeName){
                    let newBlockquote = document.createElement(nodeName);
                    let textContent = elem.innerHTML || document.createTextNode("<br>");
                    $(newBlockquote).html(textContent);
                    $(elem).replaceWith(newBlockquote);
                }
            })
        }


        rangy.getSelection().moveToBookmark(_bookmark);
    }
    function blockquote() {
        replacePWith("BLOCKQUOTE");
    }
    function h1(){
        replacePWith("H1");
    }
    function h2(){
        replacePWith("H2");
    }
});

