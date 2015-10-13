/**
 * Created by chuso_000 on 23/9/2015.
 */
import EventListener from '../helper/EventListener.js';
import hp from '../helper/helper.js';


export default class Figure {
    constructor(imgUrl) {
        //this.imgUrl = imgUrl;
        if (imgUrl){
            this.template = `<div class="figure justifyLeft" contenteditable="false"><div class="aspectRatioPlaceholder"><img src="${imgUrl}" alt=""/><div class="figureCaption" contenteditable="true"><br/></div></div></div>`;
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


        this.elements.img = this.elements.container.querySelector('img');
        this.elements.aspectRatioPlaceholder = this.elements.container.querySelector('.aspectRatioPlaceholder');
        this.elements.figureCaption = this.elements.container.querySelector('.figureCaption');

    }
    bindEvents() {
        /* Events on image */
        EventListener.addEventListener().on(this.elements.img).with({
            'click': (e) => {
                //console.log('c');
                this.focus();
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
                    if (rangy.getSelection().isCollapsed && rangy.getSelection().getRangeAt(0).startOffset == 0) {
                        e.preventDefault();
                        let nRange = rangy.createRange();
                        if (!this.elements.container.previousElementSibling) $(this.elements.container).before('<p><br/></p>');

                        nRange.selectNodeContents(this.elements.container.previousElementSibling);
                        nRange.collapse(false);


                        this.elements.container.parentNode.removeChild(this.elements.container);
                        rangy.getSelection().removeAllRanges();
                        rangy.getSelection().addRange(nRange);

                        /* Check if the new line is empty, show insertToolbar */
                        // ?
                    }
                }
            },
            'keyup': (e) => {
                if (this.elements.figureCaption.textContent.trim() == "" && this.elements.figureCaption.innerHTML !== "<br>") {
                    this.elements.figureCaption.innerHTML = "<br>";
                }
            },
            'focus': (e) => {
                $(this.elements.img).removeClass('focused');
                $(this.elements.img).addClass('focused');
            },
            'blur': (e) => {
                if (!$(e.relatedTarget).parents('.figureMenu').length
                    // Mozilla
                    && !$(e.explicitOriginalTarget).parents('.figureMenu').length)
                {
                    $(this.elements.img).removeClass('focused');
                    this.hideFigureMenu();
                }
            },
            'paste': (e) => {
                console.log(e);
                if (!e)
                    e = window.event;

                //IE9 & Other Browsers
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
                //IE8 and Lower
                else {
                    e.cancelBubble = true;
                }
                /* Prevent pasting format text */
                //e.cancelBubble();
                e.preventDefault();
                let text = e.clipboardData.getData("text/plain");
                let url = e.clipboardData.getData("url");
                document.execCommand("insertHTML", false, text);
            }
        });



    }
    focus(){
        //$(this.elements.img).addClass('focused');
        this.elements.figureCaption.focus();
        var nRange = rangy.createRange();
        nRange.setStart(this.elements.figureCaption, 0);
        nRange.setEnd(this.elements.figureCaption, 0);
        rangy.getSelection().removeAllRanges();
        rangy.getSelection().addRange(nRange);
        this.showFigureMenu();
    }
    showFigureMenu() {
        var imgWidth = this.elements.img.width;
        var figureMenuWidth = 215;
        var figureMenu = $(this.elements.container).parents('.editorContainer').find('.figureMenu')[0];
        // console.log($(this.elements.container).parents('.editorContainer')[0].querySelector('.figureMenu'))
        figureMenu.style.left = (this.elements.aspectRatioPlaceholder.offsetLeft + (this.elements.aspectRatioPlaceholder.clientWidth - figureMenuWidth)/2) + "px";
        // console.log($(this.elements.aspectRatioPlaceholder.offsetTop));
        figureMenu.style.top = (this.elements.aspectRatioPlaceholder.offsetTop) + "px";
        $(figureMenu).addClass('show animated slideInUp');
    }
    hideFigureMenu() {
        var figureMenu = $(this.elements.container).parents('.editorContainer').find('.figureMenu')[0];
        $(figureMenu).removeClass('show animated slideInUp');
    }
}