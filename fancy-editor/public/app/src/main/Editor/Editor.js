//import CustomEvents from '../../helper/customEvents';
import hp from '../../helper/helper';
import linkingModule from './linkingM';
import formatTextModule from './formatTextM';
import Figure from './Figure/Figure';
import paragraphTemp from './editor.template.js';
import ParagraphUndoManager from './EditorUndoManager.js';


export default class Editor {
    constructor() {
        this.template = paragraphTemp;

        this.editorContainer = $(this.template)[0];
        this.editor = this.editorContainer.querySelector('.editor');
        this.editorInsertToolbar = this.editorContainer.querySelector('.editorInsertToolbar');
        this.elements = {};
        // Containers
        this.elements.editorContainer = this.editorContainer;
        this.elements.editor = this.editorContainer.querySelector('.editor');
        this.elements.editorInsertToolbar = this.editorContainer.querySelector('.editorInsertToolbar');
        this.elements.editorMenu = this.editorContainer.querySelector('.editorMenu');


        // Buttons in editorMenu
        this.elements.boldBtn = this.editorContainer.querySelector('.boldBtn');
        this.elements.h1Btn = this.elements.editorMenu.querySelector('.h1Btn');
        this.elements.h2Btn = this.elements.editorMenu.querySelector('.h2Btn');
        this.elements.highlightBtn = this.elements.editorMenu.querySelector('.highlightBtn');
        this.elements.justifyCenterBtn = this.elements.editorMenu.querySelector('.justifyCenterBtn');
        this.elements.justifyLeftBtn = this.elements.editorMenu.querySelector('.justifyLeftBtn');
        this.elements.justifyRightBtn = this.elements.editorMenu.querySelector('.justifyRightBtn');
        this.elements.linkBtn = this.elements.editorMenu.querySelector('.linkBtn');
        this.elements.unlinkBtn = this.elements.editorMenu.querySelector('.unlinkBtn');
        this.elements.blockquoteBtn = this.elements.editorMenu.querySelector('.blockquoteBtn');
        // Linking stuff
        this.elements.linkInput = this.elements.editorMenu.querySelector('input[name="linkAttached"]');
        this.elements.confirmLinkBtn = this.elements.editorMenu.querySelector('.confirmLinkBtn');

        // Buttons in editorInsertToolbar
        this.elements.expandInsertToolbarBtn = this.editorContainer.querySelector('.editorInsertToolbar .expandInsertToolbarBtn');
        this.elements.addImgBtn = this.elements.editorInsertToolbar.querySelector('.addImgBtn');
        this.elements.enterImgUrlBtn = this.elements.editorInsertToolbar.querySelector('.enterImgUrlBtn');
        this.elements.pastedImgUrl = this.elements.editorInsertToolbar.querySelector('input[name="pastedImgUrl"]');
        this.elements.addImgOptions = this.elements.editorInsertToolbar.querySelector('div.addImgOptions');



        this.linking = linkingModule($(this.editorContainer));
        this.formatText = formatTextModule();

        this.options = {};
        this.options.prototype = {
            pasteAsText: true,
            inlineMode: false
        };

        //this.customEvents = new CustomEvents(this.editorContainer);

        this.bindCustomEvents();
        this.bindEvents();
        this.bindImageUploadHandler();

        this.paragraphUndoManager = new ParagraphUndoManager(this.elements.editor);
        this.paragraphUndoManager.saveEditorState();
    }
    bindCustomEvents() {

        EventListener.addEventListener().on(this.editor).with({
            'mouseup keyup focusout': ()=>{
                // Text highlighted ?
                if (!rangy.getNativeSelection().isCollapsed) this.showEditorMenu();
                else this.hideEditorMenu();

                // Cursor at an empty paragraph ?
                if ((rangy.getSelection().anchorNode && rangy.getSelection().anchorNode.nodeName == "P" && rangy.getSelection().focusNode && rangy.getSelection().focusNode.nodeName == "P" && !rangy.getSelection().anchorNode.innerText.trim() && rangy.getSelection().rangeCount == 1))
                    this.showInsertToolbar();
                else this.hideInsertToolbar();
            },
            'mouseup keyup': ()=>{
                // Selection contains link ?
                let selectionContainsLink = (function(){
                    if (!rangy.getSelection() || rangy.getSelection().isCollapsed) return false;
                    let cloneContent = rangy.getSelection().getRangeAt(0).cloneContents();
                    return $(cloneContent).find('a').length > 0;
                }).call(this);
                if (selectionContainsLink) this.linking.disableAddLink();
                else this.linking.enableAddLink();
            }
        })



    }
    bindEvents() {
        /* Events on this.editor */
        EventListener.addEventListener().on(this.editor).with({
            'paste': (e) => {
                /* Prevent pasting formatted text */
                e.preventDefault();

                let curRange = rangy.getSelection().getRangeAt(0);
                let cbData = document.createElement('div');
                let block = hp.node(curRange.endContainer).parentOfTypes("P BLOCKQUOTE H1 H2 H3 PRE");
                $(cbData).append($(e.clipboardData.getData('text/html')));
                hp.node(cbData).removeAttributes();
                hp.node(cbData).editorFormat();


                if (!rangy.getSelection().isCollapsed)
                    document.execCommand('delete');


                let rangeStartContainer;
                let rangeStartOffset;

                if (hp.node(cbData.lastChild).findTextNodes().length){
                    rangeStartContainer = hp.node(cbData.lastChild).findTextNodes()[hp.node(cbData.lastChild).findTextNodes().length - 1];
                    rangeStartOffset = rangy.dom.getNodeLength(rangeStartContainer);
                }else {
                    rangeStartContainer = curRange.startContainer;
                    rangeStartOffset = curRange.startOffset;
                }


                /* Check if cursor is at the first or end of the block */
                if ((hp.node(curRange.startContainer).isFirstNodeIn(block) && curRange.startOffset==0) || (!block.innerText.trim())){
                    //console.log('Prepend to the block');

                    if (cbData.lastChild.nodeName.toUpperCase() == "P" || cbData.lastChild.nodeName == block.nodeName){
                        // Merge the last node to block
                        $(block).prepend(cbData.lastChild.childNodes);
                        block.normalize();
                        cbData.lastChild.remove();

                    }
                    if (cbData.childNodes.length) {
                        //console.log('Prepend: ', cbData);
                        $(block).before(cbData.childNodes);
                        cbData.remove();
                    }
                }
                else if (hp.node(curRange.startContainer).isLastNodeIn(block) && curRange.startOffset==rangy.dom.getNodeLength(curRange.startContainer)){
                    //console.log('Append to block');
                    if (cbData.firstChild.nodeName.toUpperCase() == "P" || cbData.firstChild.nodeName == block.nodeName){
                        /* Merge the first node to block */
                        $(block).append(cbData.firstChild.childNodes);
                        block.normalize();
                        rangeStartContainer = hp.node(block).findTextNodes()[hp.node(block).findTextNodes().length-1];
                        rangeStartOffset = rangy.dom.getNodeLength(rangeStartContainer);

                        cbData.firstChild.remove();
                    }
                    if (cbData.childNodes.length) {
                        $(block).after(cbData.childNodes);
                        cbData.remove();
                    }

                }
                else{
                    //console.log('Split and insert in the middle!');
                    let [blockL, blockR] = hp.node(block).split(curRange.startContainer, curRange.startOffset);

                    /* Merge to blockL if possible */
                    if (cbData.firstChild.nodeName.toUpperCase() == "P" || cbData.firstChild.nodeName == blockL.nodeName){
                        $(blockL).append(cbData.firstChild.childNodes);
                        blockL.normalize();
                        rangeStartContainer = hp.node(blockL).findTextNodes()[hp.node(blockL).findTextNodes().length-1];
                        rangeStartOffset = rangy.dom.getNodeLength(rangeStartContainer);

                        cbData.firstChild.remove();
                    }

                    /* If the paste document is one piece, then merge blockR to blockL */
                    if (!cbData.children.length) {
                        $(blockL).append(blockR.childNodes);
                        blockL.normalize();

                        blockR.remove();
                    }
                    else if (cbData.lastChild.nodeName.toUpperCase() == "P" || cbData.lastChild.nodeName == blockR.nodeName){
                        /* Merge the rest of the copied content to blockR */
                        $(blockR).prepend(cbData.lastChild.childNodes);
                        blockR.normalize();
                        cbData.lastChild.remove();
                    }
                    if (cbData.childNodes.length) {
                        $(blockL).after(cbData.childNodes);
                    }
                }




                let newRange = rangy.createRange();
                //console.log(rangeStartContainer, rangeStartOffset);
                newRange.setStart(rangeStartContainer, rangeStartOffset);

                rangy.getSelection().removeAllRanges();
                rangy.getSelection().addRange(newRange);
            },
            'mouseup keyup': (e) => {
                /* Guarantee that the editor must always contain at least 1 "P" node. If not, "#TEXT" node will take place. */
                if (!this.elements.editor.innerHTML) {
                    this.elements.editor.innerHTML = "<p><br/></p>";
                    let nR = rangy.getSelection().getRangeAt(0);
                    nR.setStart(this.elements.editor.firstElementChild, 0);
                    rangy.getSelection().removeAllRanges();
                    rangy.getSelection().addRange(nR);
                }

                //console.log(rangy.getSelection().getRangeAt(0));
                setTimeout(() => {
                    /* Disable or hide linking stuff */
                    this.linking.disableLinking();

                    this.insertToolbarState().initial.call(this);
                }, 0);
            },
            'focusout': (e) => {
                /* If users focus out of the container, all ranges must be removed.
                 * editorMenu + insertToolbar must be hidden.
                 * This line below prevents scenarios when user click extensions like editorMenu or insertToolbar*/
                if (!($(this.editorContainer).has($(e.relatedTarget)).length > 0)) {
                    rangy.getSelection().removeAllRanges();
                }

            },
            'keydown': (e) => {
                /* Disable undo default shortcut for windows */
                if (e.ctrlKey && e.keyCode == 90) {
                    e.preventDefault();
                    // If timer is still running, terminate it and saveEditorState
                    if (saving){
                        clearTimeout(timer);
                        saving=false;
                        this.paragraphUndoManager.saveEditorState();
                    }
                    if (e.shiftKey){
                        this.paragraphUndoManager.redo();
                    }else{
                        this.paragraphUndoManager.undo();
                    }
                    startValue = this.getEditorContent();
                    //console.log(this.paragraphUndoManager.editorStates);
                }
                /* Remain a br tag within a paragraph when editor is emptied. */
                if (e.keyCode == 8 && $(this.elements.editor).find('p, blockquote, h1, h2, h3').length == 1 && (!$(this.elements.editor).text() || this.elements.editor.innerText == document.createElement("br").innerText))
                    e.preventDefault();

                /* Disable line breaking in mode inline */
                if (e.keyCode == 13 && this.options.mode == "inline") {
                    e.preventDefault();
                    return;
                }

                /* When backspacing at the beginning of a paragraph where after a Figure div */
                let curRange = rangy.getSelection().getRangeAt(0);
                let parBlock = hp.node(curRange.startContainer).parentOfTypes("P H1 H2 H3 PRE BLOCKQUOTE");
                if (e.keyCode == 8 && rangy.getSelection().isCollapsed && parBlock && curRange.startOffset == 0
                    && (curRange.startContainer == parBlock || curRange.startContainer == hp.node(parBlock).findTextNodes()[0])
                    && (parBlock.previousElementSibling.nodeName=='DIV' && /figure/i.test(parBlock.previousElementSibling.className))){
                    e.preventDefault();

                    let sFig = new Figure();
                    sFig.assignElements(parBlock.previousElementSibling);
                    sFig.focus();
                }

                if (e.keyCode == 13 && !e.shiftKey) {
                    let selectionRange = rangy.getSelection().getRangeAt(0);
                    let block = hp.node(selectionRange.commonAncestorContainer).parentOfTypes("BLOCKQUOTE H1 H2 H3 PRE");
                    if (block) {
                        e.preventDefault();
                        this.exitBlockAfterLinebreak();
                    }
                }
            }
        });

        // Undo and Redo
        var timer, saving=false;
        var startValue = this.getEditorContent();


        EventListener.addEventListener().on(this.editor).with({
            'mouseup keyup drag paste': (e)=>{
                if (e.type == "keyup" && e.ctrlKey && e.keyCode==90){
                    return;
                }

                //console.log(e);
                saveEditorState.call(this);

            }
        });

        /* In order to save the editor's state after clicking formatting-text buttons, decorate those function with an after function: this.paragraphUndoManager.saveEditorState*/
        hp.decorateAfter(this.formatText,'bold h1 h2 blockquote highlight', saveEditorState.bind(this));
        hp.decorateAfter(this.formatText.justify,'center left right', saveEditorState.bind(this));
        hp.decorateAfter(this.linking,'confirm', saveEditorState.bind(this));

        function saveEditorState(){
            clearTimeout(timer);
            saving=true;
            timer = setTimeout(()=>{
                saving = false;
                var newValue = this.getEditorContent();
                if (startValue != newValue){
                    //console.log(startValue);
                    //console.log(newValue);
                    this.paragraphUndoManager.saveEditorState();
                    startValue = newValue;

                }
            },250);
        }

        /* Events on buttons */
        EventListener.addEventListener().on(this.elements.boldBtn).with({
            'click': this.formatText.bold.bind(this)
        });

        /* After applying blockquote, I want the editorMenu to change its position  */
        hp.decorateAfter(this.formatText,'h1 h2 blockquote', ()=>{
            setTimeout(()=>{
                this.showEditorMenu();
            }, 0);

        });
        EventListener.addEventListener().on(this.elements.h1Btn).with({
            'click': this.formatText.h1.bind(this)
        });
        EventListener.addEventListener().on(this.elements.h2Btn).with({
            'click': this.formatText.h2.bind(this)
        });
        EventListener.addEventListener().on(this.elements.blockquoteBtn).with({
            'click': this.formatText.blockquote.bind(this)
        });
        EventListener.addEventListener().on(this.elements.justifyCenterBtn).with({
            'click': () => {
                this.formatText.justify.center.call(this);
                setTimeout(() => {
                    this.showEditorMenu();
                }, 0);
            }
        });
        EventListener.addEventListener().on(this.elements.justifyLeftBtn).with({
            'click': () => {
                this.formatText.justify.left.call(this);
                setTimeout(() => {
                    this.showEditorMenu();
                }, 0);
            }
        });
        EventListener.addEventListener().on(this.elements.justifyRightBtn).with({
            'click': () => {
                this.formatText.justify.right.call(this);
                setTimeout(() => {
                    this.showEditorMenu();
                }, 0);
            }
        });
        EventListener.addEventListener().on(this.elements.highlightBtn).with({
            'click': this.formatText.highlight.bind(this)
        });
        EventListener.addEventListener().on(this.elements.linkBtn).with({
            'click': this.linking.saveBookmarkBeforeLinking.bind(this)
        });
        EventListener.addEventListener().on(this.elements.unlinkBtn).with({
            'click': this.linking.unlink.bind(this)
        });
        EventListener.addEventListener().on(this.elements.confirmLinkBtn).with({
            'click': this.linking.confirm.bind(this)
        });
        EventListener.addEventListener().on(this.elements.expandInsertToolbarBtn).with({
            'click': this.insertToolbarState.call(this).showOptions.bind(this)
        });
        EventListener.addEventListener().on(this.elements.addImgBtn).with({
            'click': this.insertToolbarState.call(this).addImg.bind(this)
        });
        EventListener.addEventListener().on(this.elements.editorInsertToolbar.querySelector(".enterImgUrlBtn")).with({
            'click': () => {
                /* Save the cursor position before focusing on the text input */
                this.cursorAt = rangy.getSelection().saveRanges();

                this.insertToolbarState.call(this).addImg().pasteUrl();
                this.elements.editorInsertToolbar.querySelector('.addImgOptions form input[name="pastedImgUrl"]').focus();
            }
        });
        EventListener.addEventListener().on(this.elements.editorInsertToolbar.querySelector(".addImgOptions form")).with({
            'submit': (e) => {
                e.preventDefault();

                /* Restore the position of the cursor */
                if (this.cursorAt) rangy.getSelection().restoreRanges(this.cursorAt);

                setTimeout(() => {
                    this.insertImage(this.elements.editorInsertToolbar.querySelector('.addImgOptions form input[name="pastedImgUrl"]').value);
                    this.elements.editorInsertToolbar.querySelector('.addImgOptions form input[name="pastedImgUrl"]').value = "";
                }, 1);

                this.insertToolbarState().initial();

            }
        });

        EventListener.addEventListener().on(this.elements.editorContainer.querySelector('.figureMenu .imageJustifyBtn')).with({
            'click': (e)=>{
                this.imageJustify().auto();
            }
        })


    }
    imageJustify() {
        // var focusedImgContainer = $(".figure").has("img.focused")[0];
        var _imageJustify = {
            left,
            right,
            center,
            auto
        };

        var focusedImgContainer = $(this.elements.editorContainer).find('.figure').has("img.focused")[0];
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
    getEditorContent(){
        /* 1. Clone the editor
         * 2. Remove menus off the clone
         * 3. Get html */
        var $clone = $(this.editor).clone();
        /* Clicking on images results in adding classes on images and showing the figureMenus. Therefore I have to remove the "class" attributes on images and their figureMenus.
         * However this is a very DIRTY way to do! What if the type of nodes varies, they display identically but have different class set on them? */
        $clone.find(".menu").remove();
        $clone.find("img").removeAttr('class');
        return $clone.html();

    }

    bindImageUploadHandler() {
        this.uploadFileHandler($(this.editorContainer).find('.editorInsertToolbar .content input.imageUploadInput'), (files) => {
            let file = files[0];
            let imageUrl = '/uploads/' + file.name;
            //console.log(imageUrl);
            this.insertImage(imageUrl);
        });
    }
    uploadFileHandler(fileInput, done, error) {
        $(fileInput).fileupload({
            dataType: 'json',
            disableImageResize: /Android(?!.*Chrome)|Opera/
                .test(window.navigator && navigator.userAgent),
            imageMaxWidth: 800,
            imageMaxHeight: 800,
            imageCrop: true, // Force cropped images
            add: function(e, data) {
                // you can filter files in here
                let file = data.files[0];
                if (!/image/i.test(file.type)) {
                    console.log(file);
                    alert('Wrong type of file!');
                    return data.abort();
                }
                return data.submit();
            },
            progressall: function(e, data) {
                let a = data.loaded / data.total;
                let progress = a * 100;
                //console.log(progress);
            },
            done: function(e, data) {
                $.each(data.result.files, function(index, file) {
                    //$('<p/>').text(file.name).appendTo(document.body);
                    //console.log(file.name);
                });
                done(data.result.files);

            },
        });
    }
    showEditorMenu() {
        let editorMenu = this.elements.editorMenu;

        /*  Move editorMenu to a new position and show */
        let wholeSelRect = rangy.getSelection().getBoundingDocumentRect();
        let bodyWidth = $('body').width();
        editorMenu.style.top = (wholeSelRect.top - 39 - 20).toString() + "px";
        if (wholeSelRect.left < bodyWidth - 370)
            editorMenu.style.left = wholeSelRect.left + "px";
        else
            editorMenu.style.left = (wholeSelRect.right - 370).toString() + "px";
        $(editorMenu).removeClass('hidden');
        $(editorMenu).addClass('show');
    }
    hideEditorMenu() {
        $(this.elements.editorMenu).addClass('hidden').removeClass('show');
    }
    showInsertToolbar() {
        let selectionRange = rangy.getSelection().getRangeAt(0);
        let pContainer = hp.node(selectionRange.commonAncestorContainer).parentOfTypes("P");
        if (!pContainer) return;

        this.editorInsertToolbar.style.top = (pContainer.offsetTop - 10) + "px";
        this.editorInsertToolbar.style.left = (pContainer.offsetLeft - 40) + "px";
        $(this.editorInsertToolbar).removeClass('hidden').addClass('show');
    }
    hideInsertToolbar() {
        /*  */
        $(this.editorInsertToolbar).removeClass('show').addClass('hidden');
    }
    insertImage(imgUrl) {
        let selectionRange = rangy.getSelection().getRangeAt(0);
        let pContainer = selectionRange.commonAncestorContainer.nodeName == 'P' ? selectionRange.commonAncestorContainer : $(selectionRange.commonAncestorContainer).parents('p')[0];
        //console.log(pContainer);
        if (hp.isLineEmpty(pContainer)) {
            //let newEl = $compile(`<figure src="${imgUrl}"></figure>`)(scope);
            hp.testImageUrl(imgUrl, (url, result) => {
                if (result == "success") {
                    let figure = new Figure(imgUrl);
                    //console.log(`Adding a new figure: ${figure.imgUrl}`);
                    //console.log(figure.elements.container);
                    $(pContainer).before(figure.elements.container);
                    if (!figure.elements.container.nextElementSibling) $(figure.elements.container).after("<p><br/></p>");

                }
            });
        }
    }
    exitBlockAfterLinebreak() {
        document.execCommand('insertParagraph');
        document.execCommand('formatBlock', false, "p");
    }
    insertToolbarState() {
        let state = "initial";
        let contentDiv = $(this.elements.editorInsertToolbar).find('.content')[0];
        let addImgOptions = $(this.elements.editorInsertToolbar).find('.addImgOptions')[0];
        let addImgForm = $(this.elements.editorInsertToolbar).find('.addImgOptions form')[0];
        let inputText = $(this.elements.editorInsertToolbar).find('.addImgOptions form input[name="pastedImgUrl"]')[0];
        return {
            state,
            initial,
            showOptions,
            addImg
        };

        function initial() {
            state = "initial";
            //contentDiv.style.display = "none";
            $(contentDiv).removeClass('show');

        }

        function showOptions() {
            state = "showOptions";
            /* Make sure no redundancy is shown */
            //addImgOptions.style.visibility = "hidden";
            $(addImgOptions).removeClass('show');
            //addImgForm.style.visibility = "hidden";
            $(addImgForm).removeClass('show');
            /* ------ */
            $(contentDiv).addClass('show');
        }

        function addImg() {
            state = "addImg";
            //addImgOptions.style.visibility = "visible";
            $(addImgOptions).addClass('show');
            return {
                pasteUrl
            };

            function pasteUrl() {
                //addImgForm.style.visibility = "visible";
                $(addImgForm).addClass('show');
                //inputText.style.display = "block";
                $(inputText).addClass('show');
            }
        }
    }

}