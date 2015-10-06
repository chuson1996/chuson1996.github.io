/**
 * Created by chuso_000 on 23/9/2015.
 */

import hp from '../../../helper/helper';


export default class Figure {
    constructor(imgUrl) {
        //this.imgUrl = imgUrl;
        if (imgUrl){
            this.template = `<div class="figure" contenteditable="false"><div class="menu figureMenu"><button class="btn imageJustifyLeftBtn">L</button><button class="btn imageJustifyCenterBtn">C</button><button class="btn imageJustifyRightBtn">R</button></div><div class="aspectRatioPlaceholder"><img src="${imgUrl}" alt=""/><div class="figureCaption" contenteditable="true"><br/></div></div></div>`;
            this.assignElements();




            this.bindEvents();
        }

    }

    /* This is required when the template already existes on the DOM. Reassign elements. */
    reinitialize(figureElement){
        this.assignElements(figureElement);
        this.bindEvents();
    }
    assignElements(figureElement){
        this.elements = {};
        this.elements.container= figureElement? figureElement : $(this.template)[0];
        this.elements.figureMenu = this.elements.container.querySelector('.figureMenu');

        this.elements.img = this.elements.container.querySelector('img');
        this.elements.aspectRatioPlaceholder = this.elements.container.querySelector('.aspectRatioPlaceholder');
        this.elements.figureCaption = this.elements.container.querySelector('.figureCaption');
        this.elements.imageJustifyLeftBtn = this.elements.figureMenu.querySelector('.imageJustifyLeftBtn');
        this.elements.imageJustifyRightBtn = this.elements.figureMenu.querySelector('.imageJustifyRightBtn');
        this.elements.imageJustifyCenterBtn = this.elements.figureMenu.querySelector('.imageJustifyCenterBtn');
    }
    bindEvents() {
        /* Events on image */
        EventListener.addEventListener().on(this.elements.img).with({
            'click': (e) => {
                //console.log('c');
                $(this.elements.img).addClass('focused');
                var nRange = rangy.createRange();
                nRange.setStart(this.elements.figureCaption, 0);
                nRange.setEnd(this.elements.figureCaption, 0);
                rangy.getSelection().removeAllRanges();
                rangy.getSelection().addRange(nRange);
                this.showFigureMenu();
            },
            'dragstart':(e)=>{
                // Disable dragging images
                e.preventDefault();
            }
        });

        /* Events on figureCaption */
        EventListener.addEventListener().on(this.elements.figureCaption).with({
            'keypress': (e) => {
                /* Go to a line break after pressing enter in the figureCaption */
                if (e.keyCode == 13) {
                    e.preventDefault();
                    let newLine = document.createElement('p');
                    $(newLine).html('<br/>');

                    $(newLine).insertAfter(this.elements.container);

                    let newRange = rangy.createRange();
                    newRange.setStart(newLine, 0);
                    rangy.getSelection().removeAllRanges();
                    rangy.getSelection().addRange(newRange);
                }


            },
            'keydown': (e) => {
                /* When hitting backspace at the first offset in figureCaption, delete this figure */
                if (e.keyCode == 8) {
                    if (rangy.getSelection().getRangeAt(0).startOffset == 0) {
                        e.preventDefault();
                        let nRange = rangy.createRange();
                        nRange.setStartBefore(this.elements.container);
                        nRange.setEndBefore(this.elements.container);
                        this.elements.container.parentNode.removeChild(this.elements.container);
                        rangy.getSelection().removeAllRanges();
                        rangy.getSelection().addRange(nRange);

                        /* Check if the new line is empty, show insertToolbar */
                        // ?
                    }
                }
            },
            'keyup': (e) => {
                if (this.elements.figureCaption.innerText.trim() == "" && this.elements.figureCaption.innerHTML !== "<br>") {
                    this.elements.figureCaption.innerHTML = "<br>";
                }
            },
            'focusin': (e) => {

                $(this.elements.img).removeClass('focused');
                $(this.elements.img).addClass('focused');

                //focusoutImage(){
                //    $(this.editor.querySelector('img')).removeClass('focused');
                //}
            },
            'focusout': (e) => {
                $(this.elements.img).removeClass('focused');
                this.hideFigureMenu();
            },
            'paste': (e) => {
                /* Prevent pasting format text */
                e.preventDefault();
                let text = e.clipboardData.getData("text/plain");
                let url = e.clipboardData.getData("url");
                document.execCommand("insertHTML", false, text);
            }
        });

        /* Events on buttons */
        EventListener.addEventListener().on(this.elements.imageJustifyLeftBtn).with({
            'click': this.imageJustify.call(this).left
        });
        EventListener.addEventListener().on(this.elements.imageJustifyRightBtn).with({
            'click': this.imageJustify.call(this).right
        });
        EventListener.addEventListener().on(this.elements.imageJustifyCenterBtn).with({
            'click': this.imageJustify.call(this).center
        });

    }
    imageJustify() {
        var _this = this;
        var whereCursorAt = rangy.getSelection().getBookmark();
        var _imageJustify = {
            left,
            right,
            center
        };
        //hp.decorateAfter(_imageJustify, 'left right center', () => {
        //    console.log('Run this shit', whereCursorAt);
        //    rangy.getSelection().moveToBookmark(whereCursorAt);
        //});

        return _imageJustify;

        function left() {
            $(_this.elements.container).removeClass('justifyRight justifyCenter');
            // this.showFigureMenu.call(_this);
            _this.elements.img.click();
        }

        function right() {
            $(_this.elements.container).removeClass('justifyCenter').addClass('justifyRight');
            // this.showFigureMenu.call(_this);
            _this.elements.img.click();
        }

        function center() {
            $(_this.elements.container).removeClass('justifyRight').addClass('justifyCenter');
            // this.showFigureMenu.call(_this);
            _this.elements.img.click();
        }
    }
    showFigureMenu() {
        let imgWidth = this.elements.img.width;
        let figureMenuWidth = 215;
        this.elements.figureMenu.style.marginLeft = (this.elements.aspectRatioPlaceholder.clientWidth - figureMenuWidth) / 2 + "px";
        $(this.elements.figureMenu).addClass('show');
    }
    hideFigureMenu() {
        $(this.elements.figureMenu).removeClass('show');
    }
}