//import CustomEvents from '../../helper/customEvents';
import hp from '../../helper/helper';
import linkingModule from './linkingM';
import formatTextModule from './formatTextM';
import Figure from './Figure/Figure';
import paragraphTemp from './editor.template.js';
import EditorUndoManager from './EditorUndoManager.js';
import DefaultButtons from './editorDefaultButtons.js';


export default class Editor {
    constructor(options) {
        this.defaultButtons = new DefaultButtons();

        this.options = options || {};
        // Setting up default options
        hp.assign(this.options, {
            template: paragraphTemp,
            editorMenu:{
                buttons:[
                    'h1',
                    'h2',
                    'bold',
                    'highlight',
                    'link',
                    'blockquote',
                    'justifyAuto'
                ],
                activeClass:'animated flipInX',
                'static': false
            },
            figureMenu:{
                buttons:[
                    'imageJustify'
                ]
            }

        });

        this.template = this.options.template;

        this.elements = {};
        // Containers
        this.elements.editorContainer = $(this.template)[0];
        this.elements.editor = this.elements.editorContainer.querySelector('.editor');
        this.elements.editorInlineTooltip = this.elements.editorContainer.querySelector('.editorInlineTooltip');
        this.elements.editorMenu = this.elements.editorContainer.querySelector('.editorMenu');
        this.elements.figureMenu = this.elements.editorContainer.querySelector('.figureMenu');



        this.linking = linkingModule(this.elements.editorContainer);
        this.formatText = formatTextModule();
        /* In order to save the editor's state after clicking formatting-text buttons, decorate those functions with an after function: this.editorUndoManager.saveEditorState*/
        hp.decorateAfter(this.formatText,'bold h1 h2 blockquote highlight', this.saveEditorState.bind(this));
        hp.decorateAfter(this.formatText.justify,'center left right', this.saveEditorState.bind(this));
        hp.decorateAfter(this.linking,'confirm', this.saveEditorState.bind(this));
        /* After applying blockquote, h1 or h2, I want the editorMenu to change its position  */
        hp.decorateAfter(this.formatText,'h1 h2 blockquote', ()=>{
            setTimeout(()=>{
                this.showEditorMenu();
            }, 0);
        });




        /* Setting up editorMenu */
        this.addButtonsToEditorMenu(this.options.editorMenu.buttons);
        this.addButtonsToFigureMenu(this.options.figureMenu.buttons);

        this.saving = false;
        this.startValue = this.getEditorContent();


        this.activateCursorEvents();
        this.activateEditorMenuEvents();
        this.activateUndoAndRedo();
        this.activateEditorTooltipEvents();

        this.bindImageUploadHandler();

        /* Set up undoManager */
        this.editorUndoManager = new EditorUndoManager(this.elements.editor);
        this.editorUndoManager.saveEditorState();
    }

    addButtonsToEditorMenu(buttons) {
        let buildInButtons = 'bold h1 h2 blockquote highlight justifyLeft justifyRight justifyCenter justifyAuto'.split(' ');
        buttons.forEach(button=> {
            if (typeof button == "string"){
                if (buildInButtons.indexOf(button) > -1){
                    standardizeAndAppendButton.call(this, this.defaultButtons[button+"Btn"]);
                }else if (button === 'link'){
                    /* This is a special case. It comprises other components like the input, confirm button,... */
                    var linkBtn = document.createElement('button');
                    linkBtn.className = 'btn linkBtn';
                    linkBtn.innerHTML = "Link";
                    /* unlinkBtn */
                    var unlinkBtn = document.createElement('button');
                    unlinkBtn.className = 'btn unlinkBtn';
                    unlinkBtn.innerHTML = 'Unlink';
                    unlinkBtn.style.display = 'none';


                    var linkingComponent = `<div class="linkingStuff">
                        <input type="text" name="linkAttached" disabled/>
                        <button class="btn confirmLinkBtn" disabled>OK</button>
                    </div>`;
                    // Parse the string to a DOM element
                    var tempDom = document.createElement('div');
                    tempDom.innerHTML = linkingComponent;
                    linkingComponent = tempDom.firstChild;



                    EventListener.addEventListener().on(linkBtn).with({
                        'click': this.linking.saveBookmarkBeforeLinking.bind(this)
                    });
                    EventListener.addEventListener().on(unlinkBtn).with({
                        'click': this.linking.unlink.bind(this)
                    });

                    this.elements.editorMenu.appendChild(linkBtn);
                    this.elements.editorMenu.appendChild(unlinkBtn);
                    this.elements.editorMenu.appendChild(linkingComponent);
                    EventListener.addEventListener().on(linkingComponent.querySelector('.confirmLinkBtn')).with({
                        'click': this.linking.confirm.bind(this)
                    });
                }
            }
            else{

            }
        });

        /* (A private function) */
        function standardizeAndAppendButton(button){
            EventListener.addEventListener().on(button).with({
                'click': ()=>{
                    setTimeout(()=>{
                        this.saveEditorState();
                        this.showEditorMenu();
                    },0)
                }
            });
            this.elements.editorMenu.appendChild(button);
        }

    }
    addButtonsToFigureMenu(buttons){
        let buildInButtons = 'imageJustify'.split(' ');
        buttons.forEach(button=> {
            if (typeof button == "string"){
                if (buildInButtons.indexOf(button) > -1){
                    this.elements.figureMenu.appendChild(this.defaultButtons[button+'Btn']);
                }
            }
        });
    }

    activateCursorEvents() {
        /* Hide or show editorMenu and editorInsertMenu */
        EventListener.addEventListener().on(this.elements.editor).with({
            'mouseup keyup focusout': ()=>{
                setTimeout(()=>{
                    /* Text highlighted ? */
                    if (!rangy.getSelection().isCollapsed
                        && !hp.node(rangy.getSelection().getRangeAt(0).commonAncestorContainer).isChildOf(".figure"))
                        this.showEditorMenu();
                    else this.hideEditorMenu();
                },0);

                /* Cursor at an empty paragraph ? */
                if (rangy.getSelection().anchorNode && rangy.getSelection().anchorNode.nodeName == "P"
                    && rangy.getSelection().focusNode && rangy.getSelection().focusNode.nodeName == "P"
                    && !rangy.getSelection().anchorNode.textContent.trim()
                    && rangy.getSelection().rangeCount == 1)
                    this.showInsertToolbar();
                else this.hideInsertToolbar();
            },
            'focusout': (e)=>{

                //this.hideInsertToolbar();
            }
        });

        /* Linking stuff. Only active when the link button is appended in editorMenu */
        this.options.editorMenu.buttons.indexOf('link') && EventListener.addEventListener().on(this.elements.editor).with({
            'mouseup keyup': ()=>{
                /* Selection contains link ? */
                let selectionContainsLink = (function(){
                    /* Is selection wrapped in <a></a> */
                    if (rangy.getSelection().rangeCount && $(rangy.getSelection().getRangeAt(0).commonAncestorContainer).parents('a').length) return true;

                    /* Does selection contain <a></a> */
                    if (!rangy.getSelection() || rangy.getSelection().isCollapsed) return false;
                    let cloneContent = rangy.getSelection().getRangeAt(0).cloneContents();
                    return $(cloneContent).find('a').length > 0;
                }).call(this);
                if (selectionContainsLink) this.linking.disableAddLink();
                else this.linking.enableAddLink();
            }
        })



    }
    activateEditorMenuEvents() {
        /* Events on this.elements.editor */
        EventListener.addEventListener().on(this.elements.editor).with({
            'paste': (e) => {
                /* Prevent pasting formatted text */
                e.preventDefault();



                let curRange = rangy.getSelection().getRangeAt(0);
                let cbData = document.createElement('div');
                let block = hp.node(curRange.endContainer).parentOfTypes("P BLOCKQUOTE H1 H2 H3 PRE");
                if (/Firefox/.test(hp.getBrowser())){
                    $(cbData).append($('<p>'+(e.originalEvent || e).clipboardData.getData('text/plain')+'</p>'));
                }else{
                    $(cbData).append($((e.originalEvent || e).clipboardData.getData('text/html')));
                }

                if (!cbData.innerHTML.trim()) return;
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
                if ((hp.node(curRange.startContainer).isFirstNodeIn(block) && curRange.startOffset==0) || (!block.textContent.trim())){
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
                 * This line below prevents scenarios when user click extensions like editorMenu or editoInlineTooltip*/
                if (!($(this.elements.editorContainer).has($(e.relatedTarget)).length > 0)) {
                    rangy.getSelection().removeAllRanges();
                }

            },
            'keydown': (e) => {
                /* Disable undo default shortcut for windows */
                if (e.ctrlKey && e.keyCode == 90) {
                    e.preventDefault();
                    // If timer is still running, terminate it and saveEditorState
                    if (this.saving){
                        clearTimeout(this.timer);
                        this.saving=false;
                        this.editorUndoManager.saveEditorState();
                    }
                    if (e.shiftKey){
                        this.editorUndoManager.redo();
                    }else{
                        this.editorUndoManager.undo();
                    }
                    this.startValue = this.getEditorContent();
                    //console.log(this.editorUndoManager.editorStates);
                }
                /* Remain a br tag within a paragraph when editor is emptied. */
                if (e.keyCode == 8 && $(this.elements.editor).find('p, blockquote, h1, h2, h3').length == 1 && (!$(this.elements.editor).text() || this.elements.editor.textContent == document.createElement("br").textContent))
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
                    && (parBlock.previousElementSibling && parBlock.previousElementSibling.nodeName=='DIV' && /figure/i.test(parBlock.previousElementSibling.className))){
                    e.preventDefault();

                    let sFig = new Figure();
                    sFig.assignElements(parBlock.previousElementSibling);
                    sFig.focus();
                }

                if (e.keyCode == 13 && !e.shiftKey) {
                    let selectionRange = rangy.getSelection().getRangeAt(0);
                    let block = hp.node(selectionRange.commonAncestorContainer).parentOfTypes("BLOCKQUOTE H1 H2 H3 PRE CODE");
                    if (block) {
                        //e.preventDefault();
                        this.onReturn(e);
                    }
                }
            }
        });


    }

    activateUndoAndRedo(){
        /* Undo and Redo */
        /*   Save editor state when it changes */
        EventListener.addEventListener().on(this.elements.editor).with({
            'mouseup keyup drag paste': (e)=>{
                if (e.type == "keyup" && e.ctrlKey && e.keyCode==90){
                    return;
                }

                //console.log(e);
                this.saveEditorState.call(this);

            }
        });
    }

    activateEditorTooltipEvents(){
        EventListener.addEventListener().on(this.elements.editorContainer.querySelector('.editorInlineTooltip .expandInsertToolbarBtn')).with({
            'click': this.insertToolbarState.call(this).showOptions.bind(this)
        });
        EventListener.addEventListener().on(this.elements.editorContainer.querySelector('.editorInlineTooltip .addImgBtn')).with({
            'click': this.insertToolbarState.call(this).addImg.bind(this)
        });
        EventListener.addEventListener().on(this.elements.editorContainer.querySelector(".editorInlineTooltip .pasteBtn")).with({
            'click': () => {
                /* Save the cursor position before focusing on the text input */
                this.cursorAt = rangy.getSelection().saveRanges();

                this.insertToolbarState.call(this).addImg().pasteUrl();
                this.elements.editorContainer.querySelector('.editorInlineTooltip .addImgOptions form input[name="pastedImgUrl"]').focus();
            }
        });
        EventListener.addEventListener().on(this.elements.editorContainer.querySelector(".editorInlineTooltip .addImgOptions form")).with({
            'submit': (e) => {
                e.preventDefault();

                /* Restore the position of the cursor */
                if (this.cursorAt) rangy.getSelection().restoreRanges(this.cursorAt);

                setTimeout(() => {
                    this.insertImage(this.elements.editorContainer.querySelector('.editorInlineTooltip .addImgOptions form input[name="pastedImgUrl"]').value);
                    this.elements.editorContainer.querySelector('.editorInlineTooltip .addImgOptions form input[name="pastedImgUrl"]').value = "";
                }, 1);

                this.insertToolbarState().initial();
            }
        });
    }


    saveEditorState(){
        clearTimeout(this.timer);
        this.saving=true;
        this.timer = setTimeout(()=>{
            this.saving = false;
            var newValue = this.getEditorContent();
            if (this.startValue != newValue){
                //console.log(startValue);
                //console.log(newValue);
                this.editorUndoManager.saveEditorState();
                this.startValue = newValue;

            }
        },250);
    }

    getEditorContent(){
        /* 1. Clone the editor
         * 2. Remove menus off the clone
         * 3. Get html */
        var $clone = $(this.elements.editor).clone();
        /* Clicking on images results in adding classes on images and showing the figureMenus. Therefore I have to remove the "class" attributes on images and their figureMenus.
         * However this is a very DIRTY way to do! What if the type of nodes varies, they display identically but have different class set on them? */
        $clone.find(".menu").remove();
        $clone.find("img").removeAttr('class');
        return $clone.html();

    }

    bindImageUploadHandler() {
        this.uploadFileHandler($(this.elements.editorContainer).find('.editorInlineTooltip .content input.imageUploadInput'), (files) => {
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
        $(editorMenu).removeClass('hidden').addClass('show');
        if (this.options.editorMenu.activeClass) $(this.elements.editorMenu).addClass(this.options.editorMenu.activeClass);

        /*  Move editorMenu to a new position */
        let wholeSelRect = rangy.getSelection().getBoundingDocumentRect();
        let bodyWidth = $('body').width();
        editorMenu.style.top = (wholeSelRect.top - 39 - 20).toString() + "px";
        if (wholeSelRect.left < bodyWidth - editorMenu.offsetWidth)
            editorMenu.style.left = wholeSelRect.left + "px";
        else
            editorMenu.style.left = (wholeSelRect.right - editorMenu.offsetWidth).toString() + "px";
    }
    hideEditorMenu() {
        $(this.elements.editorMenu).addClass('hidden').removeClass('show');
        if (this.options.editorMenu.activeClass) $(this.elements.editorMenu).removeClass(this.options.editorMenu.activeClass);
    }
    showInsertToolbar() {
        let selectionRange = rangy.getSelection().getRangeAt(0);
        let pContainer = hp.node(selectionRange.commonAncestorContainer).parentOfTypes("P");
        if (!pContainer) return;

        this.elements.editorInlineTooltip.style.top = (pContainer.offsetTop - 10) + "px";
        this.elements.editorInlineTooltip.style.left = (pContainer.offsetLeft - 40) + "px";
        $(this.elements.editorInlineTooltip).removeClass('hidden').addClass('show');
    }
    hideInsertToolbar() {
        /*  */
        $(this.elements.editorInlineTooltip).removeClass('show').addClass('hidden');
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
    onReturn(e) {
        let cR = rangy.getSelection().getRangeAt(0);
        let nRLeft = rangy.createRange(),
            nRRight = rangy.createRange(),
            fR = rangy.createRange();
        let _parBlock = $(cR.commonAncestorContainer).parents('PRE, H1, H2, H3, CODE, BLOCKQUOTE')[0];
        nRRight.selectNodeContents(_parBlock);
        nRRight.setStart(cR.startContainer, cR.startOffset);
        //console.log($(nRLeft.cloneContents().childNodes));

        nRLeft.selectNodeContents(_parBlock);
        nRLeft.setEnd(cR.endContainer, cR.endOffset);
        //console.log(nRLeft.cloneContents().childNodes);

        // Cursor at the start of the block
        if (!nRLeft.cloneContents().textContent){
            e.preventDefault();
            let nPBlock = $('<p><br/></p>')[0];
            $(_parBlock).before(nPBlock);
        }
        // Cursor at the end of the block
        else if (!nRRight.cloneContents().textContent){
            e.preventDefault();
            let nPBlock = $('<p><br/></p>')[0];
            $(_parBlock).after(nPBlock);
            fR.selectNodeContents(nPBlock);
            fR.collapse(true);

            rangy.getSelection().removeAllRanges();
            rangy.getSelection().addRange(fR);
        }else{
            e.preventDefault();
            let RR = rangy.createRange();
            RR.selectNodeContents(_parBlock);
            RR.setStart(cR.startContainer, cR.startOffset);
            let nLine = document.createElement(_parBlock.nodeName);
            $(nLine).append(RR.extractContents().childNodes);
            $(_parBlock).after(nLine);

            RR.selectNodeContents(_parBlock.nextElementSibling);
            RR.collapse(true);
            rangy.getSelection().removeAllRanges();
            rangy.getSelection().addRange(RR);
        }




    }
    insertToolbarState() {
        let state = "initial";
        let contentDiv = $(this.elements.editorInlineTooltip).find('.content')[0];
        let addImgOptions = $(this.elements.editorInlineTooltip).find('.addImgOptions')[0];
        let addImgForm = $(this.elements.editorInlineTooltip).find('.addImgOptions form')[0];
        let inputText = $(this.elements.editorInlineTooltip).find('.addImgOptions form input[name="pastedImgUrl"]')[0];
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