/**
 * Created by chuso_000 on 13/10/2015.
 */

import hp from './helper/helper';
import linkingModule from './linkingM';
import formatTextModule from './formatTextM';
import Figure from './Figure/Figure';
import paragraphTemp from './editor.template.js';
import EditorUndoManager from './EditorUndoManager.js';
import DefaultButtons from './editorDefaultButtons.js';
import EventListener from './helper/EventListener.js';

function Editor(rootContainer, options){
    rangy.init();
    options = options || {};
    // Setting up default options
    hp.assign(options, {
        template: paragraphTemp,
        placeholder: 'Add text here...',
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
        },
        editorInsertTooltip:{
            buttons:[
                'pasteImageUrl'
            ]
        }
    });
    this.options = options;

    /* Declare private functions and properties */
    let template = options.template,
        elements = {
            editorContainer: $(template)[0]
        };
    hp.assign(elements,{
        editor: elements.editorContainer.querySelector('.editor'),
        editorInlineTooltip: elements.editorContainer.querySelector('.editorInlineTooltip'),
        editorMenu: elements.editorContainer.querySelector('.editorMenu'),
        figureMenu: elements.editorContainer.querySelector('.figureMenu')
    });
    let defaultButtons = new DefaultButtons(elements.editorContainer);
    let linking = linkingModule(elements.editorContainer),
        formatText = formatTextModule();

    // Private variables
    let saving = false,
        timer,
        cursorAt, // For saving and restoring during linking procedures
        startValue = getEditorContent(),
        editorUndoManager = new EditorUndoManager(elements.editor);


    /* In order to save the editor's state after clicking formatting-text buttons, decorate those functions with an after function: this.editorUndoManager.saveEditorState*/
    hp.decorateAfter(formatText,'bold h1 h2 blockquote highlight', saveEditorState);
    hp.decorateAfter(formatText.justify,'center left right', saveEditorState);
    hp.decorateAfter(linking,'confirm', saveEditorState);
    /* After applying blockquote, h1 or h2, I want the editorMenu to change its position  */
    hp.decorateAfter(formatText,'h1 h2 blockquote', ()=>{
        setTimeout(()=>{
            showEditorMenu();
        }, 0);
    });

    if (/Firefox/.test(hp.getBrowser()))
        hp.decorateAfter(formatText,'bold h1 h2 blockquote highlight', ()=>{
            setTimeout(()=>{
                $(elements.editor).focus();
            },0)
        });

    /* Setting up editorMenu */
    addButtonsToEditorMenu(options.editorMenu.buttons);
    /* Setting up figureMenu */
    addButtonsToFigureMenu(options.figureMenu.buttons);


    cursorEvents();
    editorMenuEvents();
    activateUndoAndRedo();
    editorTooltipEvents();
    placeholder();


    editorUndoManager.saveEditorState();

    /* Finalize */
    rootContainer.appendChild(elements.editorContainer);





    // Private functions
    function addButtonsToEditorMenu (buttons){
        let buildInButtons = 'bold h1 h2 blockquote highlight justifyLeft justifyRight justifyCenter justifyAuto'.split(' ');
        buttons.forEach(button=> {
            if (typeof button == "string"){
                if (buildInButtons.indexOf(button) > -1){
                    standardizeAndAppendButton(defaultButtons[button+"Btn"]);
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
                        'click': linking.saveBookmarkBeforeLinking
                    });
                    EventListener.addEventListener().on(unlinkBtn).with({
                        'click': linking.unlink
                    });

                    elements.editorMenu.appendChild(linkBtn);
                    elements.editorMenu.appendChild(unlinkBtn);
                    elements.editorMenu.appendChild(linkingComponent);
                    EventListener.addEventListener().on(linkingComponent.querySelector('.confirmLinkBtn')).with({
                        'click': linking.confirm
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
                        saveEditorState();
                        showEditorMenu();
                    },0)
                }
            });
            elements.editorMenu.appendChild(button);
        }

    }
    function addButtonsToFigureMenu(buttons){
        let buildInButtons = 'imageJustify'.split(' ');
        buttons.forEach(button=> {
            if (typeof button == "string"){
                if (buildInButtons.indexOf(button) > -1){
                    elements.figureMenu.appendChild(defaultButtons[button+'Btn']);
                }
            }
        });
    }
    function cursorEvents(){
        /* Hide or show editorMenu and editorInsertMenu */
        EventListener.addEventListener().on(elements.editor).with({
            'mouseup keyup blur': ()=>{
                setTimeout(()=>{
                    /* Text highlighted ? */
                    //console.log('Check');
                    if (!rangy.getSelection().isCollapsed
                        && !hp.node(rangy.getSelection().getRangeAt(0).commonAncestorContainer).isChildOf(".figure"))
                        showEditorMenu();
                    else hideEditorMenu();
                },0);

                /* Cursor at an empty paragraph ? */
                if (rangy.getSelection().anchorNode && /^(P|H1|H2|PRE|BLOCKQUOTE)$/.test(rangy.getSelection().anchorNode.nodeName.toUpperCase())
                    && rangy.getSelection().focusNode && /^(P|H1|H2|PRE|BLOCKQUOTE)$/.test(rangy.getSelection().focusNode.nodeName.toUpperCase())
                    && !rangy.getSelection().anchorNode.textContent.trim()
                    && rangy.getSelection().rangeCount == 1)
                {
                    showEditorTooltip();
                }
                else hideEditorTooltip();
            }
        });

        /* Linking stuff. Only active when the link button is appended in editorMenu */
        options.editorMenu.buttons.indexOf('link') && EventListener.addEventListener().on(elements.editor).with({
            'mouseup keyup': ()=>{
                /* Selection contains link ? */
                let selectionContainsLink = (function(){
                    /* Is selection wrapped in <a></a> */
                    if (rangy.getSelection().rangeCount && $(rangy.getSelection().getRangeAt(0).commonAncestorContainer).closest('a').length) return true;

                    /* Does selection contain <a></a> */
                    if (!rangy.getSelection() || rangy.getSelection().isCollapsed) return false;
                    let cloneContent = rangy.getSelection().getRangeAt(0).cloneContents();
                    return $(cloneContent).find('a').length > 0;
                })();
                if (selectionContainsLink) linking.disableAddLink();
                else linking.enableAddLink();
            }
        })
    }
    function placeholder (){
        let placeholderDiv = elements.editorContainer.querySelector('.editorPlaceholder');
        placeholderDiv.innerHTML = options.placeholder;
        hp.assign(placeholderDiv.style,{
            position:'absolute',
            display:'block',
            zIndex:'-33'
        });

        togglePlaceholder();

        EventListener.addEventListener().on(elements.editor).with({
            'keyup':()=>{
                togglePlaceholder();
            }
        });

        function togglePlaceholder(){
            /* Trigger show and hide of the placeholder */
            // Check if it's empty => textContent=="" && has no images
            if (!elements.editor.textContent.trim() && !$(elements.editor).find('img').length){
                //console.log('Yep, this bitch empty');
                placeholderDiv.style.display = "block";
            }else{
                //console.log('No there something: ', elements.editor.textContent);
                placeholderDiv.style.display = "none";
            }
        }
    }
    function editorMenuEvents(){
        /* Events on this.elements.editor */
        EventListener.addEventListener().on(elements.editor).with({
            'paste': (e) => {
                /* Prevent pasting formatted text */
                e.preventDefault();



                let curRange = rangy.getSelection().getRangeAt(0);
                let cbData = document.createElement('div');
                let block = $(curRange.endContainer).closest("P, BLOCKQUOTE, H1, H2, H3, PRE")[0];
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





                /* Check if cursor is at the first or end of the block */
                //console.log(curRange.cloneRange());
                if (hp.isAtEndOfLine(block, curRange)){
                    console.log('Append to the block');
                    //console.log(cbData.firstElementChild.cloneNode(false));
                    if (cbData.firstChild.nodeName.toUpperCase() == "P" || cbData.firstChild.nodeName == block.nodeName){
                        /* Merge the first node to block */
                        if (block.children.length == 1 && block.firstElementChild.nodeName.toUpperCase() == "BR"){
                            block.firstElementChild.remove();
                        }
                        $(block).append(cbData.firstChild.childNodes);
                        block.normalize();
                        cbData.firstChild.remove();

                        hp.moveCursorTo({startContainer: block, collapse: false});
                    }
                    if (cbData.childNodes.length) {
                        let lastChild = cbData.lastElementChild;
                        $(block).after(cbData.childNodes);
                        cbData.remove();

                        hp.moveCursorTo({startContainer: lastChild, collapse: false});
                    }



                }
                else if (hp.isAtStartOfLine(block, curRange)){
                    console.log('Prepend to the block');

                    if (cbData.lastChild.nodeName.toUpperCase() == "P" || cbData.lastChild.nodeName == block.nodeName){
                        // Merge the last node to block
                        hp.moveCursorTo({startContainer:block, collapse: true});
                        console.log(block);
                        $(block).prepend(cbData.lastChild.childNodes);
                        block.normalize();
                        cbData.lastChild.remove();

                    }
                    if (cbData.childNodes.length) {
                        $(block).before(cbData.childNodes);
                        cbData.remove();
                    }


                }
                else{
                    console.log('Split and insert in the middle!');
                    let [blockL, blockR] = hp.node(block).split(curRange.startContainer, curRange.startOffset);
                    /* Merge to blockL if possible */
                    if (cbData.firstChild.nodeName.toUpperCase() == "P" || cbData.firstChild.nodeName == blockL.nodeName){
                        $(blockL).append(cbData.firstChild.childNodes);
                        blockL.normalize();
                        cbData.firstChild.remove();

                        hp.moveCursorTo({startContainer:blockL, collapse: false});
                    }

                    /* If the paste document is one piece, then merge blockR to blockL */
                    if (!cbData.children.length) {
                        //console.log('If the paste document is one piece, then merge blockR to blockL');
                        hp.moveCursorTo({startContainer:blockL, collapse: false});
                        $(blockL).append(blockR.childNodes);
                        blockL.normalize();
                        blockR.remove();
                    }
                    else if (cbData.lastChild.nodeName.toUpperCase() == "P" || cbData.lastChild.nodeName == blockR.nodeName){
                        /* Merge the rest of the copied content to blockR */
                        //console.log('Merge the rest of the copied content to blockR ');

                        hp.moveCursorTo({startContainer:blockR, collapse: true});
                        $(blockR).prepend(cbData.lastChild.childNodes);
                        blockR.normalize();
                        cbData.lastChild.remove();

                        if (cbData.childNodes.length) {
                            //console.log('There\'re still some stuff left. After() them in!');
                            $(blockL).after(cbData.childNodes);
                            cbData.remove();
                        }
                    }
                }
            },
            'mouseup keyup': (e) => {
                /* Guarantee that the editor must always contain at least 1 "P" node. If not, "#TEXT" node will take place. */
                if (!elements.editor.innerHTML || !$(elements.editor).find('p, h1, h2, h3, pre, blockquote').length) {
                    elements.editor.innerHTML = "<p><br/></p>";
                    let nR = rangy.getSelection().getRangeAt(0);
                    nR.setStart(elements.editor.firstElementChild, 0);
                    rangy.getSelection().removeAllRanges();
                    rangy.getSelection().addRange(nR);
                }

                //console.log(rangy.getSelection().getRangeAt(0));
                setTimeout(() => {
                    /* Disable or hide linking stuff */
                    linking.disableLinking();

                    editorTooltipState().initial();
                }, 0);
            },
            'blur': (e) => {
                /* If users focus out of the container, all ranges must be removed.
                 * editorMenu + insertToolbar must be hidden.
                 * This line below prevents scenarios when user click extensions like editorMenu or editorInlineTooltip*/
                if ($(e.target).parents('.editorContainer').length) return ;

                if (!($(elements.editorContainer).has($(e.relatedTarget)).length > 0)) {
                    rangy.getSelection().removeAllRanges();
                }

            },
            'keydown': (e) => {
                /* Remain a br tag within a paragraph when editor is emptied. */
                if (e.keyCode == 8 && $(elements.editor).find('p, blockquote, h1, h2, h3, pre').length == 1
                    && (!$(elements.editor).text() || $(elements.editor).find('p, blockquote, h1, h2, h3, pre')[0].textContent == ""))
                {
                    //console.log('Alert');
                    e.preventDefault();
                }

                /* Disable line breaking in mode inline */
                if (e.keyCode == 13 && options.mode == "inline") {
                    e.preventDefault();
                    return;
                }

                /* When backspacing at the beginning of a paragraph after a Figure div */
                let curRange = rangy.getSelection().getRangeAt(0);
                let parBlock = $(curRange.startContainer).closest("P, H1, H2, H3, PRE, BLOCKQUOTE")[0];
                //console.log(parBlock);
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
                    let block = $(selectionRange.commonAncestorContainer).closest("BLOCKQUOTE, H1, H2, H3, PRE, P")[0];
                    if (block) {
                        //e.preventDefault();
                        onReturn(e);
                        function onReturn(e){
                            /* Delete the selection first */
                            if (!rangy.getSelection().isCollapsed) document.execCommand('delete');

                            let cR = rangy.getSelection().getRangeAt(0);
                            let nRLeft = rangy.createRange(),
                                nRRight = rangy.createRange(),
                                fR = rangy.createRange();
                            let _parBlock = $(cR.startContainer).closest('PRE, H1, H2, H3, BLOCKQUOTE, P')[0];
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
                    }
                }
            }
        });
    }
    function editorTooltipEvents(){
        EventListener.addEventListener().on(elements.editorContainer.querySelector('.editorInlineTooltip .expandInsertToolbarBtn')).with({
            'click': editorTooltipState().showOptions
        });
        EventListener.addEventListener().on(elements.editorContainer.querySelector('.editorInlineTooltip .addImgBtn')).with({
            'click': editorTooltipState().addImg
        });
        EventListener.addEventListener().on(elements.editorContainer.querySelector(".editorInlineTooltip .pasteBtn")).with({
            'click': () => {
                /* Save the cursor position before focusing on the text input */
                cursorAt = rangy.getSelection().saveRanges();

                editorTooltipState().addImg().pasteUrl();
                elements.editorContainer.querySelector('.editorInlineTooltip .addImgOptions form input[name="pastedImgUrl"]').focus();
            }
        });
        EventListener.addEventListener().on(elements.editorContainer.querySelector(".editorInlineTooltip .addImgOptions form")).with({
            'submit': (e) => {
                e.preventDefault();

                /* Restore the position of the cursor */
                if (cursorAt) rangy.getSelection().restoreRanges(cursorAt);

                setTimeout(() => {
                    insertImage(elements.editorContainer.querySelector('.editorInlineTooltip .addImgOptions form input[name="pastedImgUrl"]').value);
                    elements.editorContainer.querySelector('.editorInlineTooltip .addImgOptions form input[name="pastedImgUrl"]').value = "";
                }, 1);

                editorTooltipState().initial();
            }
        });
    }

    function insertImage(imgUrl) {
        let selectionRange = rangy.getSelection().getRangeAt(0);
        let pContainer = $(selectionRange.commonAncestorContainer).closest('p')[0];
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
    function editorTooltipState(){
        let state = "initial";
        let contentDiv = $(elements.editorInlineTooltip).find('.content')[0];
        let addImgOptions = $(elements.editorInlineTooltip).find('.addImgOptions')[0];
        let addImgForm = $(elements.editorInlineTooltip).find('.addImgOptions form')[0];
        let inputText = $(elements.editorInlineTooltip).find('.addImgOptions form input[name="pastedImgUrl"]')[0];
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
            $(contentDiv).find('.addImgBtn').css('display','block');

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
            $(contentDiv).find('.addImgBtn').css('display','none');
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

    function activateUndoAndRedo(){
        /* Undo and Redo */
        /*   Save editor state when it changes */
        EventListener.addEventListener().on(elements.editor).with({
            'mouseup drag paste': (e)=>{
                saveEditorState();
            },
            'keydown':e=>{
                if (e.ctrlKey && e.keyCode==90){
                    e.preventDefault();
                }
            },
            'keyup': e=>{
                /* To prevent the editor from saving its state. Or else it will interrupt undo and redo events */
                if (e.ctrlKey && e.keyCode==90){
                    e.preventDefault();

                    if (saving){
                        clearTimeout(timer);
                        saving=false;
                        saveEditorState();
                    }
                    if (e.shiftKey){
                        editorUndoManager.redo();
                    }else{
                        editorUndoManager.undo();

                    }
                    startValue = getEditorContent();
                }else{
                    saveEditorState();
                }


            }
        });
    }
    function saveEditorState(){
        clearTimeout(timer);
        saving=true;
        timer = setTimeout(()=>{
            saving = false;
            let newValue = getEditorContent();
            if (startValue != newValue){
                //console.log(startValue);
                //console.log(newValue);
                editorUndoManager.saveEditorState();
                startValue = newValue;

            }
        },250);
    }

    function getEditorContent(){
        /* 1. Clone the editor
         * 2. Remove menus off the clone
         * 3. Get html */
        var $clone = $(elements.editor).clone();
        /* Clicking on images results in adding classes on images and showing the figureMenus. Therefore I have to remove the "class" attributes on images and their figureMenus.
         * However this is a very DIRTY way to do! What if the type of nodes varies, they display identically but have different class set on them? */
        $clone.find(".menu").remove();
        $clone.find("img").removeAttr('class');
        return $clone.html();

    }

    function showEditorMenu(){
        let editorMenu = elements.editorMenu;
        $(editorMenu).removeClass('hidden').addClass('show');
        if (options.editorMenu.activeClass) $(elements.editorMenu).addClass(options.editorMenu.activeClass);

        /*  Move editorMenu to a new position */
        let wholeSelRect = rangy.getSelection().getBoundingDocumentRect();
        let bodyWidth = $('body').width();
        editorMenu.style.top = (wholeSelRect.top - 39 - 20).toString() + "px";
        if (wholeSelRect.left < bodyWidth - editorMenu.offsetWidth)
            editorMenu.style.left = wholeSelRect.left + "px";
        else
            editorMenu.style.left = (wholeSelRect.right - editorMenu.offsetWidth).toString() + "px";
    }
    function hideEditorMenu(){
        $(elements.editorMenu).addClass('hidden').removeClass('show');
        if (options.editorMenu.activeClass) $(elements.editorMenu).removeClass(options.editorMenu.activeClass);
    }
    function showEditorTooltip(){
        let selectionRange = rangy.getSelection().getRangeAt(0);
        let pContainer = $(selectionRange.commonAncestorContainer).closest("P, BLOCKQUOTE, H1, H2, H3, PRE")[0];
        if (!pContainer) return;

        elements.editorInlineTooltip.style.top = (pContainer.offsetTop - 10) + "px";
        elements.editorInlineTooltip.style.left = (pContainer.offsetLeft - 40) + "px";
        $(elements.editorInlineTooltip).removeClass('hidden').addClass('show');
    }
    function hideEditorTooltip(){
        $(elements.editorInlineTooltip).removeClass('show').addClass('hidden');
    }

}


//if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
//    // AMD. Register as an anonymous module.
//    define(function() {
//        return Editor;
//    });
//} else if (typeof module !== 'undefined' && module.exports) {
//    module.exports = Editor;
//} else {
//    window.Editor = Editor;
//}
window.Editor = Editor;