/**
 * Created by chuso_000 on 10/10/2015.
 */

import formatTextModule from './formatTextM';
import hp from '../../helper/helper';
import linkingModule from './linkingM';


export default class DefaultButtons{
    constructor(editorContainer){
        /* let buildInButtons = 'BOLD H1 H2 BLOCKQUOTE JUSTIFYLEFT JUSTIFYRIGHT JUSTIFYCENTER JUSTIFYAUTO HIGHLIGHT'.split(' '); */
        this.formatText = formatTextModule();

        if (/Firefox/.test(hp.getBrowser()))
        {
            let firefoxAfterFocus = ()=>{
                setTimeout(()=>{
                    //console.log('Focus plz');
                    $(editorContainer).find('.editor').focus();
                },0)
            };
            hp.decorateAfter(this.formatText,'bold h1 h2 blockquote highlight', firefoxAfterFocus);
            hp.decorateAfter(this.formatText.justify,'center left right', firefoxAfterFocus)
        }
        ///
        /* boldBtn */
        this.boldBtn = document.createElement('button');
        this.boldBtn.className = 'btn boldBtn';
        this.boldBtn.innerHTML = 'B';
        EventListener.addEventListener().on(this.boldBtn).with({
            'click': this.formatText.bold
        });

        /* h1Btn */
        this.h1Btn = document.createElement('button');
        this.h1Btn.className = 'btn h1Btn';
        this.h1Btn.innerHTML = 'H1';
        EventListener.addEventListener().on(this.h1Btn).with({
            'click': this.formatText.h1
        });

        /* h2Btn */
        this.h2Btn = document.createElement('button');
        this.h2Btn.className = 'btn h2Btn';
        this.h2Btn.innerHTML = 'H2';
        EventListener.addEventListener().on(this.h2Btn).with({
            'click': this.formatText.h2
        });

        /* blockquoteBtn */
        this.blockquoteBtn = document.createElement('button');
        this.blockquoteBtn.className = 'btn blockquoteBtn';
        this.blockquoteBtn.innerHTML = '"';
        EventListener.addEventListener().on(this.blockquoteBtn).with({
            'click': this.formatText.blockquote
        });

        /* justifyLeftBtn */
        this.justifyLeftBtn = document.createElement('button');
        this.justifyLeftBtn.className = 'btn justifyLeftBtn';
        this.justifyLeftBtn.innerHTML = 'Left';
        EventListener.addEventListener().on(this.justifyLeftBtn).with({
            'click': this.formatText.justify.left
        });

        /* justifyRightBtn */
        this.justifyRightBtn = document.createElement('button');
        this.justifyRightBtn.className = 'btn justifyRightBtn';
        this.justifyRightBtn.innerHTML = 'Right';
        EventListener.addEventListener().on(this.justifyRightBtn).with({
            'click': this.formatText.justify.right
        });

        /* justifyCenterBtn */
        this.justifyCenterBtn = document.createElement('button');
        this.justifyCenterBtn.className = 'btn justifyCenterBtn';
        this.justifyCenterBtn.innerHTML = 'Center';
        EventListener.addEventListener().on(this.justifyCenterBtn).with({
            'click': this.formatText.justify.center
        });

        /* justifyAutoBtn */
        this.justifyAutoBtn = document.createElement('button');
        this.justifyAutoBtn.className = 'btn justifyAutoBtn';
        this.justifyAutoBtn.innerHTML = 'Justify';
        EventListener.addEventListener().on(this.justifyAutoBtn).with({
            'click': this.formatText.justify.auto.bind(this.formatText.justify)
        });

        /* highlightBtn */
        this.highlightBtn = document.createElement('button');
        this.highlightBtn.className = 'btn highlightBtn';
        this.highlightBtn.innerHTML = '<span class="highlighted"><em>A</em></span>';
        EventListener.addEventListener().on(this.highlightBtn).with({
            'click': this.formatText.highlight.bind(this)
        });

        //////
        this.imageJustifyBtn = parseElement('<button class="btn imageJustifyBtn">Justify</button>');
        EventListener.addEventListener().on(this.imageJustifyBtn).with({
            'click': (e)=>{
                imageJustify($(e.target).parents('.editorContainer').find('.figure').has("img.focused")[0])
                    .auto();
            }
        });

        function parseElement(innerHTML){
            var div = document.createElement('div');
            div.innerHTML = innerHTML;
            return div.firstElementChild;
        }

        function imageJustify(focusedImgContainer){
            var _imageJustify = {
                left,
                right,
                center,
                auto
            };

            //var focusedImgContainer = $(e.target).parents('.editorContainer').find('.figure').has("img.focused")[0];
            return _imageJustify;

            function left() {
                if (!focusedImgContainer) return;

                $(focusedImgContainer)
                    .removeClass('justifyRight justifyCenter')
                    .addClass('justifyLeft');
                focusedImgContainer.querySelector('img').click();
            }

            function right() {
                if (!focusedImgContainer) return;

                $(focusedImgContainer)
                    .removeClass('justifyCenter justifyLeft')
                    .addClass('justifyRight');
                focusedImgContainer.querySelector('img').click();
            }

            function center() {
                if (!focusedImgContainer) return;

                $(focusedImgContainer)
                    .removeClass('justifyRight justifyLeft')
                    .addClass('justifyCenter');
                focusedImgContainer.querySelector('img').click();
            }

            function auto(){
                if (!focusedImgContainer) return;
                if ($(focusedImgContainer).hasClass('justifyLeft')) center();
                else if ($(focusedImgContainer).hasClass('justifyCenter')) right();
                else if ($(focusedImgContainer).hasClass('justifyRight')) left();
            }
        }
    }


}

