(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
/*
Simple Javascript undo and redo.
https://github.com/ArthurClemens/Javascript-Undo-Manager
*/

;(function() {

	'use strict';

    function removeFromTo(array, from, to) {
        array.splice(from,
            !to ||
            1 + to - from + (!(to < 0 ^ from >= 0) && (to < 0 || -1) * array.length));
        return array.length;
    }

    var UndoManager = function() {

        var commands = [],
            index = -1,
            limit = 0,
            isExecuting = false,
            callback,
            
            // functions
            execute;

        execute = function(command, action) {
            if (!command || typeof command[action] !== "function") {
                return this;
            }
            isExecuting = true;

            command[action]();

            isExecuting = false;
            return this;
        };

        return {

            /*
            Add a command to the queue.
            */
            add: function (command) {
                if (isExecuting) {
                    return this;
                }
                // if we are here after having called undo,
                // invalidate items higher on the stack
                commands.splice(index + 1, commands.length - index);

                commands.push(command);
                
                // if limit is set, remove items from the start
                if (limit && commands.length > limit) {
                    removeFromTo(commands, 0, -(limit+1));
                }
                
                // set the current index to the end
                index = commands.length - 1;
                if (callback) {
                    callback();
                }
                return this;
            },

            /*
            Pass a function to be called on undo and redo actions.
            */
            setCallback: function (callbackFunc) {
                callback = callbackFunc;
            },

            /*
            Perform undo: call the undo function at the current index and decrease the index by 1.
            */
            undo: function () {
                var command = commands[index];
                if (!command) {
                    return this;
                }
                execute(command, "undo");
                index -= 1;
                if (callback) {
                    callback();
                }
                return this;
            },

            /*
            Perform redo: call the redo function at the next index and increase the index by 1.
            */
            redo: function () {
                var command = commands[index + 1];
                if (!command) {
                    return this;
                }
                execute(command, "redo");
                index += 1;
                if (callback) {
                    callback();
                }
                return this;
            },

            /*
            Clears the memory, losing all stored states. Reset the index.
            */
            clear: function () {
                var prev_size = commands.length;

                commands = [];
                index = -1;

                if (callback && (prev_size > 0)) {
                    callback();
                }
            },

            hasUndo: function () {
                return index !== -1;
            },

            hasRedo: function () {
                return index < (commands.length - 1);
            },

            getCommands: function () {
                return commands;
            },
            
            setLimit: function (l) {
                limit = l;
            }
        };
    };

	if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
		// AMD. Register as an anonymous module.
		define(function() {
			return UndoManager;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = UndoManager;
	} else {
		window.UndoManager = UndoManager;
	}

}());

},{}],3:[function(require,module,exports){
/**
 * Created by chuso_000 on 13/10/2015.
 */

'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _helperHelper = require('./helper/helper');

var _helperHelper2 = _interopRequireDefault(_helperHelper);

var _linkingM = require('./linkingM');

var _linkingM2 = _interopRequireDefault(_linkingM);

var _formatTextM = require('./formatTextM');

var _formatTextM2 = _interopRequireDefault(_formatTextM);

var _FigureFigure = require('./Figure/Figure');

var _FigureFigure2 = _interopRequireDefault(_FigureFigure);

var _editorTemplateJs = require('./editor.template.js');

var _editorTemplateJs2 = _interopRequireDefault(_editorTemplateJs);

var _EditorUndoManagerJs = require('./EditorUndoManager.js');

var _EditorUndoManagerJs2 = _interopRequireDefault(_EditorUndoManagerJs);

var _editorDefaultButtonsJs = require('./editorDefaultButtons.js');

var _editorDefaultButtonsJs2 = _interopRequireDefault(_editorDefaultButtonsJs);

var _helperEventListenerJs = require('./helper/EventListener.js');

var _helperEventListenerJs2 = _interopRequireDefault(_helperEventListenerJs);

function Editor(rootContainer, options) {
    options = options || {};
    // Setting up default options
    _helperHelper2['default'].assign(options, {
        template: _editorTemplateJs2['default'],
        placeholder: 'Add text here...',
        editorMenu: {
            buttons: ['h1', 'h2', 'bold', 'highlight', 'link', 'blockquote', 'justifyAuto'],
            activeClass: 'animated flipInX',
            'static': false
        },
        figureMenu: {
            buttons: ['imageJustify']
        },
        editorInsertTooltip: {
            buttons: ['pasteImageUrl']
        }
    });
    this.options = options;

    /* Declare private functions and properties */
    var template = options.template,
        elements = {
        editorContainer: $(template)[0]
    };
    _helperHelper2['default'].assign(elements, {
        editor: elements.editorContainer.querySelector('.editor'),
        editorInlineTooltip: elements.editorContainer.querySelector('.editorInlineTooltip'),
        editorMenu: elements.editorContainer.querySelector('.editorMenu'),
        figureMenu: elements.editorContainer.querySelector('.figureMenu')
    });
    var defaultButtons = new _editorDefaultButtonsJs2['default'](elements.editorContainer);
    var linking = _linkingM2['default'](elements.editorContainer),
        formatText = _formatTextM2['default']();

    // Private variables
    var saving = false,
        timer = undefined,
        cursorAt = undefined,
        // For saving and restoring during linking procedures
    startValue = getEditorContent(),
        editorUndoManager = new _EditorUndoManagerJs2['default'](elements.editor);

    /* In order to save the editor's state after clicking formatting-text buttons, decorate those functions with an after function: this.editorUndoManager.saveEditorState*/
    _helperHelper2['default'].decorateAfter(formatText, 'bold h1 h2 blockquote highlight', saveEditorState);
    _helperHelper2['default'].decorateAfter(formatText.justify, 'center left right', saveEditorState);
    _helperHelper2['default'].decorateAfter(linking, 'confirm', saveEditorState);
    /* After applying blockquote, h1 or h2, I want the editorMenu to change its position  */
    _helperHelper2['default'].decorateAfter(formatText, 'h1 h2 blockquote', function () {
        setTimeout(function () {
            showEditorMenu();
        }, 0);
    });

    if (/Firefox/.test(_helperHelper2['default'].getBrowser())) _helperHelper2['default'].decorateAfter(formatText, 'bold h1 h2 blockquote highlight', function () {
        setTimeout(function () {
            $(elements.editor).focus();
        }, 0);
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
    function addButtonsToEditorMenu(buttons) {
        var buildInButtons = 'bold h1 h2 blockquote highlight justifyLeft justifyRight justifyCenter justifyAuto'.split(' ');
        buttons.forEach(function (button) {
            if (typeof button == "string") {
                if (buildInButtons.indexOf(button) > -1) {
                    standardizeAndAppendButton(defaultButtons[button + "Btn"]);
                } else if (button === 'link') {
                    /* This is a special case. It comprises other components like the input, confirm button,... */
                    var linkBtn = document.createElement('button');
                    linkBtn.className = 'btn linkBtn';
                    linkBtn.innerHTML = "Link";
                    /* unlinkBtn */
                    var unlinkBtn = document.createElement('button');
                    unlinkBtn.className = 'btn unlinkBtn';
                    unlinkBtn.innerHTML = 'Unlink';
                    unlinkBtn.style.display = 'none';

                    var linkingComponent = '<div class="linkingStuff">\n                        <input type="text" name="linkAttached" disabled/>\n                        <button class="btn confirmLinkBtn" disabled>OK</button>\n                    </div>';
                    // Parse the string to a DOM element
                    var tempDom = document.createElement('div');
                    tempDom.innerHTML = linkingComponent;
                    linkingComponent = tempDom.firstChild;

                    _helperEventListenerJs2['default'].addEventListener().on(linkBtn)['with']({
                        'click': linking.saveBookmarkBeforeLinking
                    });
                    _helperEventListenerJs2['default'].addEventListener().on(unlinkBtn)['with']({
                        'click': linking.unlink
                    });

                    elements.editorMenu.appendChild(linkBtn);
                    elements.editorMenu.appendChild(unlinkBtn);
                    elements.editorMenu.appendChild(linkingComponent);
                    _helperEventListenerJs2['default'].addEventListener().on(linkingComponent.querySelector('.confirmLinkBtn'))['with']({
                        'click': linking.confirm
                    });
                }
            } else {}
        });

        /* (A private function) */
        function standardizeAndAppendButton(button) {
            _helperEventListenerJs2['default'].addEventListener().on(button)['with']({
                'click': function click() {
                    setTimeout(function () {
                        saveEditorState();
                        showEditorMenu();
                    }, 0);
                }
            });
            elements.editorMenu.appendChild(button);
        }
    }
    function addButtonsToFigureMenu(buttons) {
        var buildInButtons = 'imageJustify'.split(' ');
        buttons.forEach(function (button) {
            if (typeof button == "string") {
                if (buildInButtons.indexOf(button) > -1) {
                    elements.figureMenu.appendChild(defaultButtons[button + 'Btn']);
                }
            }
        });
    }
    function cursorEvents() {
        /* Hide or show editorMenu and editorInsertMenu */
        _helperEventListenerJs2['default'].addEventListener().on(elements.editor)['with']({
            'mouseup keyup blur': function mouseupKeyupBlur() {
                setTimeout(function () {
                    /* Text highlighted ? */
                    //console.log('Check');
                    if (!rangy.getSelection().isCollapsed && !_helperHelper2['default'].node(rangy.getSelection().getRangeAt(0).commonAncestorContainer).isChildOf(".figure")) showEditorMenu();else hideEditorMenu();
                }, 0);

                /* Cursor at an empty paragraph ? */
                if (rangy.getSelection().anchorNode && rangy.getSelection().anchorNode.nodeName == "P" && rangy.getSelection().focusNode && rangy.getSelection().focusNode.nodeName == "P" && !rangy.getSelection().anchorNode.textContent.trim() && rangy.getSelection().rangeCount == 1) showInsertToolbar();else hideInsertToolbar();
            }
        });

        /* Linking stuff. Only active when the link button is appended in editorMenu */
        options.editorMenu.buttons.indexOf('link') && _helperEventListenerJs2['default'].addEventListener().on(elements.editor)['with']({
            'mouseup keyup': function mouseupKeyup() {
                /* Selection contains link ? */
                var selectionContainsLink = (function () {
                    /* Is selection wrapped in <a></a> */
                    if (rangy.getSelection().rangeCount && $(rangy.getSelection().getRangeAt(0).commonAncestorContainer).closest('a').length) return true;

                    /* Does selection contain <a></a> */
                    if (!rangy.getSelection() || rangy.getSelection().isCollapsed) return false;
                    var cloneContent = rangy.getSelection().getRangeAt(0).cloneContents();
                    return $(cloneContent).find('a').length > 0;
                })();
                if (selectionContainsLink) linking.disableAddLink();else linking.enableAddLink();
            }
        });
    }
    function placeholder() {
        var placeholderDiv = elements.editorContainer.querySelector('.editorPlaceholder');
        placeholderDiv.innerHTML = options.placeholder;
        _helperHelper2['default'].assign(placeholderDiv.style, {
            position: 'absolute',
            display: 'block',
            zIndex: '-33'
        });

        togglePlaceholder();

        _helperEventListenerJs2['default'].addEventListener().on(elements.editor)['with']({
            'keyup': function keyup() {
                togglePlaceholder();
            }
        });

        function togglePlaceholder() {
            /* Trigger show and hide of the placeholder */
            // Check if it's empty => textContent=="" && has no images
            if (!elements.editor.textContent.trim() && !$(elements.editor).find('img').length) {
                //console.log('Yep, this bitch empty');
                placeholderDiv.style.display = "block";
            } else {
                //console.log('No there something: ', elements.editor.textContent);
                placeholderDiv.style.display = "none";
            }
        }
    }
    function editorMenuEvents() {
        /* Events on this.elements.editor */
        _helperEventListenerJs2['default'].addEventListener().on(elements.editor)['with']({
            'paste': function paste(e) {
                /* Prevent pasting formatted text */
                e.preventDefault();

                var curRange = rangy.getSelection().getRangeAt(0);
                var cbData = document.createElement('div');
                var block = $(curRange.endContainer).closest("P, BLOCKQUOTE, H1, H2, H3, PRE")[0];
                if (/Firefox/.test(_helperHelper2['default'].getBrowser())) {
                    $(cbData).append($('<p>' + (e.originalEvent || e).clipboardData.getData('text/plain') + '</p>'));
                } else {
                    $(cbData).append($((e.originalEvent || e).clipboardData.getData('text/html')));
                }

                if (!cbData.innerHTML.trim()) return;
                _helperHelper2['default'].node(cbData).removeAttributes();
                _helperHelper2['default'].node(cbData).editorFormat();

                if (!rangy.getSelection().isCollapsed) document.execCommand('delete');

                /* Check if cursor is at the first or end of the block */
                //console.log(curRange.cloneRange());
                if (_helperHelper2['default'].isAtEndOfLine(block, curRange)) {
                    console.log('Append to the block');
                    //console.log(cbData.firstElementChild.cloneNode(false));
                    if (cbData.firstChild.nodeName.toUpperCase() == "P" || cbData.firstChild.nodeName == block.nodeName) {
                        /* Merge the first node to block */
                        if (block.children.length == 1 && block.firstElementChild.nodeName.toUpperCase() == "BR") {
                            block.firstElementChild.remove();
                        }
                        $(block).append(cbData.firstChild.childNodes);
                        block.normalize();
                        cbData.firstChild.remove();

                        _helperHelper2['default'].moveCursorTo({ startContainer: block, collapse: false });
                    }
                    if (cbData.childNodes.length) {
                        var lastChild = cbData.lastElementChild;
                        $(block).after(cbData.childNodes);
                        cbData.remove();

                        _helperHelper2['default'].moveCursorTo({ startContainer: lastChild, collapse: false });
                    }
                } else if (_helperHelper2['default'].isAtStartOfLine(block, curRange)) {
                    console.log('Prepend to the block');

                    if (cbData.lastChild.nodeName.toUpperCase() == "P" || cbData.lastChild.nodeName == block.nodeName) {
                        // Merge the last node to block
                        _helperHelper2['default'].moveCursorTo({ startContainer: block, collapse: true });
                        console.log(block);
                        $(block).prepend(cbData.lastChild.childNodes);
                        block.normalize();
                        cbData.lastChild.remove();
                    }
                    if (cbData.childNodes.length) {
                        $(block).before(cbData.childNodes);
                        cbData.remove();
                    }
                } else {
                    console.log('Split and insert in the middle!');

                    var _hp$node$split = _helperHelper2['default'].node(block).split(curRange.startContainer, curRange.startOffset);

                    var blockL = _hp$node$split[0];
                    var blockR = _hp$node$split[1];

                    /* Merge to blockL if possible */
                    if (cbData.firstChild.nodeName.toUpperCase() == "P" || cbData.firstChild.nodeName == blockL.nodeName) {
                        $(blockL).append(cbData.firstChild.childNodes);
                        blockL.normalize();
                        cbData.firstChild.remove();

                        _helperHelper2['default'].moveCursorTo({ startContainer: blockL, collapse: false });
                    }

                    /* If the paste document is one piece, then merge blockR to blockL */
                    if (!cbData.children.length) {
                        //console.log('If the paste document is one piece, then merge blockR to blockL');
                        _helperHelper2['default'].moveCursorTo({ startContainer: blockL, collapse: false });
                        $(blockL).append(blockR.childNodes);
                        blockL.normalize();
                        blockR.remove();
                    } else if (cbData.lastChild.nodeName.toUpperCase() == "P" || cbData.lastChild.nodeName == blockR.nodeName) {
                        /* Merge the rest of the copied content to blockR */
                        //console.log('Merge the rest of the copied content to blockR ');

                        _helperHelper2['default'].moveCursorTo({ startContainer: blockR, collapse: true });
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
            'mouseup keyup': function mouseupKeyup(e) {
                /* Guarantee that the editor must always contain at least 1 "P" node. If not, "#TEXT" node will take place. */
                if (!elements.editor.innerHTML || !$(elements.editor).find('p, h1, h2, h3, pre, blockquote').length) {
                    elements.editor.innerHTML = "<p><br/></p>";
                    var nR = rangy.getSelection().getRangeAt(0);
                    nR.setStart(elements.editor.firstElementChild, 0);
                    rangy.getSelection().removeAllRanges();
                    rangy.getSelection().addRange(nR);
                }

                //console.log(rangy.getSelection().getRangeAt(0));
                setTimeout(function () {
                    /* Disable or hide linking stuff */
                    linking.disableLinking();

                    insertToolbarState().initial();
                }, 0);
            },
            'blur': function blur(e) {
                /* If users focus out of the container, all ranges must be removed.
                 * editorMenu + insertToolbar must be hidden.
                 * This line below prevents scenarios when user click extensions like editorMenu or editorInlineTooltip*/
                if ($(e.target).parents('.editorContainer').length) return;

                if (!($(elements.editorContainer).has($(e.relatedTarget)).length > 0)) {
                    rangy.getSelection().removeAllRanges();
                }
            },
            'keydown': function keydown(e) {
                /* Remain a br tag within a paragraph when editor is emptied. */
                if (e.keyCode == 8 && $(elements.editor).find('p, blockquote, h1, h2, h3, pre').length == 1 && (!$(elements.editor).text() || $(elements.editor).find('p, blockquote, h1, h2, h3, pre')[0].textContent == "")) {
                    //console.log('Alert');
                    e.preventDefault();
                }

                /* Disable line breaking in mode inline */
                if (e.keyCode == 13 && options.mode == "inline") {
                    e.preventDefault();
                    return;
                }

                /* When backspacing at the beginning of a paragraph after a Figure div */
                var curRange = rangy.getSelection().getRangeAt(0);
                var parBlock = $(curRange.startContainer).closest("P, H1, H2, H3, PRE, BLOCKQUOTE")[0];
                //console.log(parBlock);
                if (e.keyCode == 8 && rangy.getSelection().isCollapsed && parBlock && curRange.startOffset == 0 && (curRange.startContainer == parBlock || curRange.startContainer == _helperHelper2['default'].node(parBlock).findTextNodes()[0]) && (parBlock.previousElementSibling && parBlock.previousElementSibling.nodeName == 'DIV' && /figure/i.test(parBlock.previousElementSibling.className))) {
                    e.preventDefault();

                    var sFig = new _FigureFigure2['default']();
                    sFig.assignElements(parBlock.previousElementSibling);
                    sFig.focus();
                }

                if (e.keyCode == 13 && !e.shiftKey) {
                    var selectionRange = rangy.getSelection().getRangeAt(0);
                    var block = $(selectionRange.commonAncestorContainer).closest("BLOCKQUOTE, H1, H2, H3, PRE, P")[0];
                    if (block) {
                        var onReturn = function onReturn(e) {
                            /* Delete the selection first */
                            if (!rangy.getSelection().isCollapsed) document.execCommand('delete');

                            var cR = rangy.getSelection().getRangeAt(0);
                            var nRLeft = rangy.createRange(),
                                nRRight = rangy.createRange(),
                                fR = rangy.createRange();
                            var _parBlock = $(cR.startContainer).closest('PRE, H1, H2, H3, BLOCKQUOTE, P')[0];
                            nRRight.selectNodeContents(_parBlock);
                            nRRight.setStart(cR.startContainer, cR.startOffset);
                            //console.log($(nRLeft.cloneContents().childNodes));

                            nRLeft.selectNodeContents(_parBlock);
                            nRLeft.setEnd(cR.endContainer, cR.endOffset);
                            //console.log(nRLeft.cloneContents().childNodes);

                            // Cursor at the start of the block
                            if (!nRLeft.cloneContents().textContent) {
                                e.preventDefault();
                                var nPBlock = $('<p><br/></p>')[0];
                                $(_parBlock).before(nPBlock);
                            }
                            // Cursor at the end of the block
                            else if (!nRRight.cloneContents().textContent) {
                                    e.preventDefault();
                                    var nPBlock = $('<p><br/></p>')[0];
                                    $(_parBlock).after(nPBlock);
                                    fR.selectNodeContents(nPBlock);
                                    fR.collapse(true);

                                    rangy.getSelection().removeAllRanges();
                                    rangy.getSelection().addRange(fR);
                                } else {
                                    e.preventDefault();
                                    var RR = rangy.createRange();
                                    RR.selectNodeContents(_parBlock);
                                    RR.setStart(cR.startContainer, cR.startOffset);
                                    var nLine = document.createElement(_parBlock.nodeName);
                                    $(nLine).append(RR.extractContents().childNodes);
                                    $(_parBlock).after(nLine);

                                    RR.selectNodeContents(_parBlock.nextElementSibling);
                                    RR.collapse(true);
                                    rangy.getSelection().removeAllRanges();
                                    rangy.getSelection().addRange(RR);
                                }
                        };

                        //e.preventDefault();
                        onReturn(e);
                    }
                }
            }
        });
    }
    function editorTooltipEvents() {
        _helperEventListenerJs2['default'].addEventListener().on(elements.editorContainer.querySelector('.editorInlineTooltip .expandInsertToolbarBtn'))['with']({
            'click': insertToolbarState().showOptions
        });
        _helperEventListenerJs2['default'].addEventListener().on(elements.editorContainer.querySelector('.editorInlineTooltip .addImgBtn'))['with']({
            'click': insertToolbarState().addImg
        });
        _helperEventListenerJs2['default'].addEventListener().on(elements.editorContainer.querySelector(".editorInlineTooltip .pasteBtn"))['with']({
            'click': function click() {
                /* Save the cursor position before focusing on the text input */
                cursorAt = rangy.getSelection().saveRanges();

                insertToolbarState().addImg().pasteUrl();
                elements.editorContainer.querySelector('.editorInlineTooltip .addImgOptions form input[name="pastedImgUrl"]').focus();
            }
        });
        _helperEventListenerJs2['default'].addEventListener().on(elements.editorContainer.querySelector(".editorInlineTooltip .addImgOptions form"))['with']({
            'submit': function submit(e) {
                e.preventDefault();

                /* Restore the position of the cursor */
                if (cursorAt) rangy.getSelection().restoreRanges(cursorAt);

                setTimeout(function () {
                    insertImage(elements.editorContainer.querySelector('.editorInlineTooltip .addImgOptions form input[name="pastedImgUrl"]').value);
                    elements.editorContainer.querySelector('.editorInlineTooltip .addImgOptions form input[name="pastedImgUrl"]').value = "";
                }, 1);

                insertToolbarState().initial();
            }
        });
    }

    function insertImage(imgUrl) {
        var selectionRange = rangy.getSelection().getRangeAt(0);
        var pContainer = $(selectionRange.commonAncestorContainer).closest('p')[0];
        //console.log(pContainer);
        if (_helperHelper2['default'].isLineEmpty(pContainer)) {
            //let newEl = $compile(`<figure src="${imgUrl}"></figure>`)(scope);
            _helperHelper2['default'].testImageUrl(imgUrl, function (url, result) {
                if (result == "success") {
                    var figure = new _FigureFigure2['default'](imgUrl);
                    //console.log(`Adding a new figure: ${figure.imgUrl}`);
                    //console.log(figure.elements.container);
                    $(pContainer).before(figure.elements.container);
                    if (!figure.elements.container.nextElementSibling) $(figure.elements.container).after("<p><br/></p>");
                }
            });
        }
    }
    function insertToolbarState() {
        var state = "initial";
        var contentDiv = $(elements.editorInlineTooltip).find('.content')[0];
        var addImgOptions = $(elements.editorInlineTooltip).find('.addImgOptions')[0];
        var addImgForm = $(elements.editorInlineTooltip).find('.addImgOptions form')[0];
        var inputText = $(elements.editorInlineTooltip).find('.addImgOptions form input[name="pastedImgUrl"]')[0];
        return {
            state: state,
            initial: initial,
            showOptions: showOptions,
            addImg: addImg
        };

        function initial() {
            state = "initial";
            //contentDiv.style.display = "none";
            $(contentDiv).removeClass('show');
            $(contentDiv).find('.addImgBtn').css('display', 'block');
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
            $(contentDiv).find('.addImgBtn').css('display', 'none');
            return {
                pasteUrl: pasteUrl
            };

            function pasteUrl() {
                //addImgForm.style.visibility = "visible";
                $(addImgForm).addClass('show');
                //inputText.style.display = "block";
                $(inputText).addClass('show');
            }
        }
    }

    function activateUndoAndRedo() {
        /* Undo and Redo */
        /*   Save editor state when it changes */
        _helperEventListenerJs2['default'].addEventListener().on(elements.editor)['with']({
            'mouseup drag paste': function mouseupDragPaste(e) {
                saveEditorState();
            },
            'keydown': function keydown(e) {
                if (e.ctrlKey && e.keyCode == 90) {
                    e.preventDefault();
                }
            },
            'keyup': function keyup(e) {
                /* To prevent the editor from saving its state. Or else it will interrupt undo and redo events */
                if (e.ctrlKey && e.keyCode == 90) {
                    e.preventDefault();

                    if (saving) {
                        clearTimeout(timer);
                        saving = false;
                        saveEditorState();
                    }
                    if (e.shiftKey) {
                        editorUndoManager.redo();
                    } else {
                        editorUndoManager.undo();
                    }
                    startValue = getEditorContent();
                } else {
                    saveEditorState();
                }
            }
        });
    }
    function saveEditorState() {
        clearTimeout(timer);
        saving = true;
        timer = setTimeout(function () {
            saving = false;
            var newValue = getEditorContent();
            if (startValue != newValue) {
                //console.log(startValue);
                //console.log(newValue);
                editorUndoManager.saveEditorState();
                startValue = newValue;
            }
        }, 250);
    }

    function getEditorContent() {
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

    function showEditorMenu() {
        var editorMenu = elements.editorMenu;
        $(editorMenu).removeClass('hidden').addClass('show');
        if (options.editorMenu.activeClass) $(elements.editorMenu).addClass(options.editorMenu.activeClass);

        /*  Move editorMenu to a new position */
        var wholeSelRect = rangy.getSelection().getBoundingDocumentRect();
        var bodyWidth = $('body').width();
        editorMenu.style.top = (wholeSelRect.top - 39 - 20).toString() + "px";
        if (wholeSelRect.left < bodyWidth - editorMenu.offsetWidth) editorMenu.style.left = wholeSelRect.left + "px";else editorMenu.style.left = (wholeSelRect.right - editorMenu.offsetWidth).toString() + "px";
    }
    function hideEditorMenu() {
        $(elements.editorMenu).addClass('hidden').removeClass('show');
        if (options.editorMenu.activeClass) $(elements.editorMenu).removeClass(options.editorMenu.activeClass);
    }
    function showInsertToolbar() {
        var selectionRange = rangy.getSelection().getRangeAt(0);
        var pContainer = _helperHelper2['default'].node(selectionRange.commonAncestorContainer).parentOfTypes("P");
        if (!pContainer) return;

        elements.editorInlineTooltip.style.top = pContainer.offsetTop - 10 + "px";
        elements.editorInlineTooltip.style.left = pContainer.offsetLeft - 40 + "px";
        $(elements.editorInlineTooltip).removeClass('hidden').addClass('show');
    }
    function hideInsertToolbar() {
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

},{"./EditorUndoManager.js":4,"./Figure/Figure":5,"./editor.template.js":6,"./editorDefaultButtons.js":7,"./formatTextM":8,"./helper/EventListener.js":9,"./helper/helper":10,"./linkingM":11}],4:[function(require,module,exports){
/**
 * Created by chuso_000 on 28/9/2015.
 */
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _undoManager = require('undo-manager');

var _undoManager2 = _interopRequireDefault(_undoManager);

var _helperHelper = require('./helper/helper');

var _helperHelper2 = _interopRequireDefault(_helperHelper);

var _FigureFigureJs = require('./Figure/Figure.js');

var _FigureFigureJs2 = _interopRequireDefault(_FigureFigureJs);

var _csonSerializer = require('cson-serializer');

var _csonSerializer2 = _interopRequireDefault(_csonSerializer);

var _helperEventListenerJs = require('./helper/EventListener.js');

var _helperEventListenerJs2 = _interopRequireDefault(_helperEventListenerJs);

var EditorUndoManager = (function () {
    function EditorUndoManager(editor) {
        _classCallCheck(this, EditorUndoManager);

        this.paraUndoManager = new _undoManager2['default']();
        this.editor = editor;
        this.editorStates = {};
        this.index = 0;
        this.paraSerializer = new _csonSerializer2['default'](this.editor);
        //this.saveEditorState();
    }

    EditorUndoManager.prototype.saveEditorState = function saveEditorState() {
        var _this = this;

        //let id = this.generateId();

        var id = this.index;
        var editorState = {
            innerHTML: this.editor.innerHTML
        };

        if (document.getSelection().rangeCount) editorState.storedRange = this.paraSerializer.serializeRange(document.getSelection().getRangeAt(0));else {
            var defaultRange = document.createRange();
            defaultRange.setStart(this.editor.firstElementChild, 0);
            //console.log(defaultRange);
            editorState.storedRange = this.paraSerializer.serializeRange(defaultRange);
        }

        //console.log(editorState);

        this.addEditorState(id, editorState);

        // make undo-able
        this.paraUndoManager.add({
            undo: function undo() {
                _this.removeEditorState(id);
            },
            redo: function redo() {
                _this.addEditorState(id, editorState);
            }
        });

        console.log('Saved');
    };

    EditorUndoManager.prototype.addEditorState = function addEditorState(id, editorState) {
        this.editorStates[id] = editorState;
        this.index++;
    };

    EditorUndoManager.prototype.removeEditorState = function removeEditorState(id) {
        delete this.editorStates[id];
        this.index--;
    };

    EditorUndoManager.prototype.hasUndo = function hasUndo() {
        return this.paraUndoManager.hasUndo();
    };

    EditorUndoManager.prototype.hasRedo = function hasRedo() {
        return this.paraUndoManager.hasRedo();
    };

    EditorUndoManager.prototype.undo = function undo() {
        if (!this.hasUndo()) return;
        //this.saveEditorState();
        //console.log(this.editorStates);

        this.paraUndoManager.undo();
        //console.log('After undo',this.editorStates);
        // Clear time out when undo
        this.restoreEditorState();
    };

    EditorUndoManager.prototype.redo = function redo() {
        if (!this.hasRedo()) return;
        this.paraUndoManager.redo();
        //console.log(this.editorStates);
        // Clear time out when undo
        this.restoreEditorState();
    };

    EditorUndoManager.prototype.restoreEditorState = function restoreEditorState() {
        if (Object.getOwnPropertyNames(this.editorStates).length) {
            var _editorStates = this.editorStates[Object.getOwnPropertyNames(this.editorStates).length - 1];
            var innerHTML = _editorStates.innerHTML;
            var storedRange = _editorStates.storedRange;

            //console.log(storedRange);

            if (this.editor) {
                this.editor.normalize();
                //EventListener.saveEventListeners(this.editor);
                //console.log(EventListener.savedEventListeners);
                this.editor.innerHTML = innerHTML;
                //console.log('Thinks problem here');
                //EventListener.restoreEventListeners(this.editor);
                //console.log('Thinks problem here');

                /* !! You need to have a custom figure restoring function here !! */
                // Step 1: Find figure div and remove all event listeners from every child in it, including itself
                _helperEventListenerJs2['default'].listeners = [];

                // Step 2: Initialize them div
                $(this.editor).find('.figure').each(function () {
                    var nF = new _FigureFigureJs2['default']();
                    nF.reinitialize(this);
                });
            }

            if (storedRange) {
                var nR = this.paraSerializer.deserializeRange(storedRange);
                //console.log(nR);
                //console.log(storedRange);
                document.getSelection().removeAllRanges();
                //console.log(nR);
                document.getSelection().addRange(nR);
            }
            //else this.editor.focus();
        }
    };

    EditorUndoManager.prototype.generateId = function generateId() {
        var generatedNumber = Math.round(Math.random() * 10000000);
        if (_.indexOf(Object.getOwnPropertyNames(this.editorStates), generatedNumber) == -1) return generatedNumber;else this.generateId();
    };

    return EditorUndoManager;
})();

exports['default'] = EditorUndoManager;
module.exports = exports['default'];

},{"./Figure/Figure.js":5,"./helper/EventListener.js":9,"./helper/helper":10,"cson-serializer":1,"undo-manager":2}],5:[function(require,module,exports){
/**
 * Created by chuso_000 on 23/9/2015.
 */
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helperEventListenerJs = require('../helper/EventListener.js');

var _helperEventListenerJs2 = _interopRequireDefault(_helperEventListenerJs);

var _helperHelperJs = require('../helper/helper.js');

var _helperHelperJs2 = _interopRequireDefault(_helperHelperJs);

var Figure = (function () {
    function Figure(imgUrl) {
        _classCallCheck(this, Figure);

        //this.imgUrl = imgUrl;
        if (imgUrl) {
            this.template = '<div class="figure justifyLeft" contenteditable="false"><div class="aspectRatioPlaceholder"><img src="' + imgUrl + '" alt=""/><div class="figureCaption" contenteditable="true"><br/></div></div></div>';
            this.assignElements();

            this.bindEvents();
        }
    }

    /* This is required when the template already existes on the DOM. Reassign elements. */

    Figure.prototype.reinitialize = function reinitialize(figureElement) {
        this.assignElements(figureElement);
        this.bindEvents();
    };

    Figure.prototype.assignElements = function assignElements(figureElement) {
        this.elements = {};
        this.elements.container = figureElement ? figureElement : $(this.template)[0];

        this.elements.img = this.elements.container.querySelector('img');
        this.elements.aspectRatioPlaceholder = this.elements.container.querySelector('.aspectRatioPlaceholder');
        this.elements.figureCaption = this.elements.container.querySelector('.figureCaption');
    };

    Figure.prototype.bindEvents = function bindEvents() {
        var _this = this;

        /* Events on image */
        _helperEventListenerJs2['default'].addEventListener().on(this.elements.img)['with']({
            'click': function click(e) {
                //console.log('c');
                _this.focus();
            },
            'dragstart': function dragstart(e) {
                // Disable dragging images
                e.preventDefault();
            }
        });

        /* Events on figureCaption */
        _helperEventListenerJs2['default'].addEventListener().on(this.elements.figureCaption)['with']({
            'keypress': function keypress(e) {
                /* Go to a line break after pressing enter in the figureCaption */
                if (e.keyCode == 13) {
                    e.preventDefault();
                    var newLine = document.createElement('p');
                    $(newLine).html('<br/>');

                    $(newLine).insertAfter(_this.elements.container);

                    var newRange = rangy.createRange();
                    newRange.setStart(newLine, 0);
                    rangy.getSelection().removeAllRanges();
                    rangy.getSelection().addRange(newRange);
                }
            },
            'keydown': function keydown(e) {
                /* When hitting backspace at the first offset in figureCaption, delete this figure */
                if (e.keyCode == 8) {
                    if (rangy.getSelection().isCollapsed && rangy.getSelection().getRangeAt(0).startOffset == 0) {
                        e.preventDefault();
                        var nRange = rangy.createRange();
                        if (!_this.elements.container.previousElementSibling) $(_this.elements.container).before('<p><br/></p>');

                        nRange.selectNodeContents(_this.elements.container.previousElementSibling);
                        nRange.collapse(false);

                        _this.elements.container.parentNode.removeChild(_this.elements.container);
                        rangy.getSelection().removeAllRanges();
                        rangy.getSelection().addRange(nRange);

                        /* Check if the new line is empty, show insertToolbar */
                        // ?
                    }
                }
            },
            'keyup': function keyup(e) {
                if (_this.elements.figureCaption.textContent.trim() == "" && _this.elements.figureCaption.innerHTML !== "<br>") {
                    _this.elements.figureCaption.innerHTML = "<br>";
                }
            },
            'focus': function focus(e) {
                $(_this.elements.img).removeClass('focused');
                $(_this.elements.img).addClass('focused');
            },
            'blur': function blur(e) {
                if (!$(e.relatedTarget).parents('.figureMenu').length
                // Mozilla
                 && !$(e.explicitOriginalTarget).parents('.figureMenu').length) {
                    $(_this.elements.img).removeClass('focused');
                    _this.hideFigureMenu();
                }
            },
            'paste': function paste(e) {
                console.log(e);
                if (!e) e = window.event;

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
                var text = e.clipboardData.getData("text/plain");
                var url = e.clipboardData.getData("url");
                document.execCommand("insertHTML", false, text);
            }
        });
    };

    Figure.prototype.focus = function focus() {
        //$(this.elements.img).addClass('focused');
        this.elements.figureCaption.focus();
        var nRange = rangy.createRange();
        nRange.setStart(this.elements.figureCaption, 0);
        nRange.setEnd(this.elements.figureCaption, 0);
        rangy.getSelection().removeAllRanges();
        rangy.getSelection().addRange(nRange);
        this.showFigureMenu();
    };

    Figure.prototype.showFigureMenu = function showFigureMenu() {
        var imgWidth = this.elements.img.width;
        var figureMenuWidth = 215;
        var figureMenu = $(this.elements.container).parents('.editorContainer').find('.figureMenu')[0];
        // console.log($(this.elements.container).parents('.editorContainer')[0].querySelector('.figureMenu'))
        figureMenu.style.left = this.elements.aspectRatioPlaceholder.offsetLeft + (this.elements.aspectRatioPlaceholder.clientWidth - figureMenuWidth) / 2 + "px";
        // console.log($(this.elements.aspectRatioPlaceholder.offsetTop));
        figureMenu.style.top = this.elements.aspectRatioPlaceholder.offsetTop + "px";
        $(figureMenu).addClass('show animated slideInUp');
    };

    Figure.prototype.hideFigureMenu = function hideFigureMenu() {
        var figureMenu = $(this.elements.container).parents('.editorContainer').find('.figureMenu')[0];
        $(figureMenu).removeClass('show animated slideInUp');
    };

    return Figure;
})();

exports['default'] = Figure;
module.exports = exports['default'];

},{"../helper/EventListener.js":9,"../helper/helper.js":10}],6:[function(require,module,exports){
/**
 * Created by chuso_000 on 24/9/2015.
 */
"use strict";

exports.__esModule = true;
exports["default"] = "\n<div class=\"editorContainer\">\n    <div class=\"editorPlaceholder\"></div>\n    <div class=\"editorMenu hidden\"></div>\n\n    <div class=\"editorInlineTooltip hidden\">\n        <button class=\"btn expandInsertToolbarBtn\" >+</button>\n        <div class=\"content\">\n            <button class=\"btn addImgBtn\">Img</button>\n            <div class=\"addImgOptions\">\n                <button class=\"btn pasteBtn\" style=\"width:100px\">Paste an url</button>\n                <form><input type=\"text\" name=\"pastedImgUrl\"/></form>\n            </div>\n\n\n        </div>\n    </div>\n\n    <div class=\"menu figureMenu\"></div>\n    <div class=\"editor article\" contenteditable=\"true\" data-placeholder=\"Enter text...\">\n        <p><br/></p>\n    </div>\n\n</div>\n";
module.exports = exports["default"];

},{}],7:[function(require,module,exports){
/**
 * Created by chuso_000 on 10/10/2015.
 */

'use strict';

exports.__esModule = true;
exports['default'] = DefaultButtons;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _formatTextM = require('./formatTextM');

var _formatTextM2 = _interopRequireDefault(_formatTextM);

var _helperHelper = require('./helper/helper');

var _helperHelper2 = _interopRequireDefault(_helperHelper);

var _linkingM = require('./linkingM');

var _linkingM2 = _interopRequireDefault(_linkingM);

var _helperEventListenerJs = require('./helper/EventListener.js');

var _helperEventListenerJs2 = _interopRequireDefault(_helperEventListenerJs);

function DefaultButtons(editorContainer) {
    /* let buildInButtons = 'BOLD H1 H2 BLOCKQUOTE JUSTIFYLEFT JUSTIFYRIGHT JUSTIFYCENTER JUSTIFYAUTO HIGHLIGHT'.split(' '); */
    this.formatText = _formatTextM2['default']();

    if (/Firefox/.test(_helperHelper2['default'].getBrowser())) {
        var firefoxAfterFocus = function firefoxAfterFocus() {
            setTimeout(function () {
                //console.log('Focus plz');
                $(editorContainer).find('.editor').focus();
            }, 0);
        };
        _helperHelper2['default'].decorateAfter(this.formatText, 'bold h1 h2 blockquote highlight', firefoxAfterFocus);
        _helperHelper2['default'].decorateAfter(this.formatText.justify, 'center left right', firefoxAfterFocus);
    }
    ///
    /* boldBtn */
    this.boldBtn = document.createElement('button');
    this.boldBtn.className = 'btn boldBtn';
    this.boldBtn.innerHTML = 'B';
    _helperEventListenerJs2['default'].addEventListener().on(this.boldBtn)['with']({
        'click': this.formatText.bold
    });

    /* h1Btn */
    this.h1Btn = document.createElement('button');
    this.h1Btn.className = 'btn h1Btn';
    this.h1Btn.innerHTML = 'H1';
    _helperEventListenerJs2['default'].addEventListener().on(this.h1Btn)['with']({
        'click': this.formatText.h1
    });

    /* h2Btn */
    this.h2Btn = document.createElement('button');
    this.h2Btn.className = 'btn h2Btn';
    this.h2Btn.innerHTML = 'H2';
    _helperEventListenerJs2['default'].addEventListener().on(this.h2Btn)['with']({
        'click': this.formatText.h2
    });

    /* blockquoteBtn */
    this.blockquoteBtn = document.createElement('button');
    this.blockquoteBtn.className = 'btn blockquoteBtn';
    this.blockquoteBtn.innerHTML = '"';
    _helperEventListenerJs2['default'].addEventListener().on(this.blockquoteBtn)['with']({
        'click': this.formatText.blockquote
    });

    /* justifyLeftBtn */
    this.justifyLeftBtn = document.createElement('button');
    this.justifyLeftBtn.className = 'btn justifyLeftBtn';
    this.justifyLeftBtn.innerHTML = 'Left';
    _helperEventListenerJs2['default'].addEventListener().on(this.justifyLeftBtn)['with']({
        'click': this.formatText.justify.left
    });

    /* justifyRightBtn */
    this.justifyRightBtn = document.createElement('button');
    this.justifyRightBtn.className = 'btn justifyRightBtn';
    this.justifyRightBtn.innerHTML = 'Right';
    _helperEventListenerJs2['default'].addEventListener().on(this.justifyRightBtn)['with']({
        'click': this.formatText.justify.right
    });

    /* justifyCenterBtn */
    this.justifyCenterBtn = document.createElement('button');
    this.justifyCenterBtn.className = 'btn justifyCenterBtn';
    this.justifyCenterBtn.innerHTML = 'Center';
    _helperEventListenerJs2['default'].addEventListener().on(this.justifyCenterBtn)['with']({
        'click': this.formatText.justify.center
    });

    /* justifyAutoBtn */
    this.justifyAutoBtn = document.createElement('button');
    this.justifyAutoBtn.className = 'btn justifyAutoBtn';
    this.justifyAutoBtn.innerHTML = 'Justify';
    _helperEventListenerJs2['default'].addEventListener().on(this.justifyAutoBtn)['with']({
        'click': this.formatText.justify.auto.bind(this.formatText.justify)
    });

    /* highlightBtn */
    this.highlightBtn = document.createElement('button');
    this.highlightBtn.className = 'btn highlightBtn';
    this.highlightBtn.innerHTML = '<span class="highlighted"><em>A</em></span>';
    _helperEventListenerJs2['default'].addEventListener().on(this.highlightBtn)['with']({
        'click': this.formatText.highlight.bind(this)
    });

    //////
    this.imageJustifyBtn = parseElement('<button class="btn imageJustifyBtn">Justify</button>');
    _helperEventListenerJs2['default'].addEventListener().on(this.imageJustifyBtn)['with']({
        'click': function click(e) {
            imageJustify($(e.target).parents('.editorContainer').find('.figure').has("img.focused")[0]).auto();
        }
    });

    function parseElement(innerHTML) {
        var div = document.createElement('div');
        div.innerHTML = innerHTML;
        return div.firstElementChild;
    }

    function imageJustify(focusedImgContainer) {
        var _imageJustify = {
            left: left,
            right: right,
            center: center,
            auto: auto
        };

        //var focusedImgContainer = $(e.target).parents('.editorContainer').find('.figure').has("img.focused")[0];
        return _imageJustify;

        function left() {
            if (!focusedImgContainer) return;

            $(focusedImgContainer).removeClass('justifyRight justifyCenter').addClass('justifyLeft');
            focusedImgContainer.querySelector('img').click();
        }

        function right() {
            if (!focusedImgContainer) return;

            $(focusedImgContainer).removeClass('justifyCenter justifyLeft').addClass('justifyRight');
            focusedImgContainer.querySelector('img').click();
        }

        function center() {
            if (!focusedImgContainer) return;

            $(focusedImgContainer).removeClass('justifyRight justifyLeft').addClass('justifyCenter');
            focusedImgContainer.querySelector('img').click();
        }

        function auto() {
            if (!focusedImgContainer) return;
            if ($(focusedImgContainer).hasClass('justifyLeft')) center();else if ($(focusedImgContainer).hasClass('justifyCenter')) right();else if ($(focusedImgContainer).hasClass('justifyRight')) left();
        }
    }
}

module.exports = exports['default'];

},{"./formatTextM":8,"./helper/EventListener.js":9,"./helper/helper":10,"./linkingM":11}],8:[function(require,module,exports){
/**
 * Created by chuso_000 on 19/9/2015.
 */

'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _helperHelper = require('./helper/helper');

var _helperHelper2 = _interopRequireDefault(_helperHelper);

exports['default'] = function () {
    var classAppliers;
    if (rangy.supported && rangy.modules.ClassApplier && rangy.modules.ClassApplier.supported) {
        classAppliers = {
            bold: rangy.createClassApplier('bold', {
                tagNames: ['span']
            }),
            highlight: rangy.createClassApplier('highlighted', {
                tagNames: ['span', 'b']
            }),
            blockquote: rangy.createClassApplier('blockquote', {
                elementTagName: 'blockquote'
            }),
            textAlignCenter: rangy.createClassApplier('alignCenter', {
                tagNames: ['p']
            })
        };
    }

    var justify = {
        center: function center() {
            document.execCommand('justifyCenter');
        },
        left: function left() {
            document.execCommand('justifyLeft');
        },
        right: function right() {
            document.execCommand('justifyRight');
        },
        auto: function auto() {
            if (document.queryCommandState('justifyLeft')) this.center();else if (document.queryCommandState('justifyCenter')) this.right();else if (document.queryCommandState('justifyRight')) this.left();
        }
    };
    return {
        bold: bold,
        highlight: highlight,
        justify: justify,
        replacePWith: replacePWith,
        blockquote: blockquote,
        h1: h1,
        h2: h2
    };

    ////
    function bold() {
        document.execCommand('bold');
    }

    function highlight() {
        classAppliers.highlight.toggleSelection();
        //document.execCommand('backColor', true, 'yellow');
    }

    function replacePWith(nodeName) {
        var editor = $(rangy.getSelection().getRangeAt(0).commonAncestorContainer).closest('.editor')[0] || rangy.getSelection().getRangeAt(0).commonAncestorContainer;
        var _bookmark = rangy.getSelection().getBookmark(editor);

        var _rangy$getSelection$getRangeAt = rangy.getSelection().getRangeAt(0);

        var startContainer = _rangy$getSelection$getRangeAt.startContainer;
        var endContainer = _rangy$getSelection$getRangeAt.endContainer;

        var mainNodeTypes = "BLOCKQUOTE P H1 H2 PRE CODE".split(' ');

        /* Trying to assign startContainer to one of these parent nodes ["P",nodeName] */
        if (!_helperHelper2['default'].node(startContainer).isOneOfTheseNodes(mainNodeTypes)) {
            startContainer = _helperHelper2['default'].node(startContainer).parentOfTypes(mainNodeTypes);
            if (!startContainer) return;
        }

        /* Trying to assign endContainer to one of these parent nodes ["P",nodeName] */
        if (!_helperHelper2['default'].node(endContainer).isOneOfTheseNodes(mainNodeTypes)) {
            endContainer = _helperHelper2['default'].node(endContainer).parentOfTypes(mainNodeTypes);
            if (!endContainer) return;
        }

        /* startContainer must comes before endContainer, therefore to use nextUntil() */
        var parentContainer = startContainer.parentElement;
        if ($(parentContainer).index(startContainer) > $(parentContainer).index(endContainer)) {
            _helperHelper2['default'].swap(startContainer, endContainer);
        }

        /* Find elements in between in the selection */
        var elems = [startContainer];
        if (startContainer != endContainer) $(startContainer).nextUntil(endContainer).each(function (n) {
            elems.push(this);
        });
        if (startContainer != endContainer) elems.push(endContainer);

        /* If all elements is of type nodeName, replace them all with P nodes */
        if (_.all(elems, function (elem) {
            return elem.nodeName == nodeName;
        })) {
            elems.forEach(function (elem) {
                var newP = document.createElement('p');
                //let textContent = elem.innerHTML || document.createTextNode("<br>");
                //$(newP).html(textContent);
                var textContent = elem.childNodes || document.createTextNode("<br>");
                $(newP).append(textContent);
                $(elem).replaceWith(newP);
            });
        } else {
            // Replace those that are not of type nodeName with nodeName nodes
            elems.forEach(function (elem) {
                if (_helperHelper2['default'].node(elem).isOneOfTheseNodes(mainNodeTypes) && elem.nodeName.toUpperCase() != nodeName) {
                    var newBlockquote = document.createElement(nodeName);
                    //let textContent = elem.innerHTML || document.createTextNode("<br>");
                    //$(newBlockquote).html(textContent);
                    var textContent = elem.childNodes || document.createTextNode("<br>");
                    $(newBlockquote).append(textContent);
                    $(elem).replaceWith(newBlockquote);
                }
            });
        }

        rangy.getSelection().removeAllRanges();
        rangy.getSelection().moveToBookmark(_bookmark);
    }
    function blockquote() {
        replacePWith("BLOCKQUOTE");
    }
    function h1() {
        replacePWith("H1");
    }
    function h2() {
        replacePWith("H2");
    }
};

module.exports = exports['default'];

},{"./helper/helper":10}],9:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _csonSerializer = require('cson-serializer');

var _csonSerializer2 = _interopRequireDefault(_csonSerializer);

(function (Serializer, $) {
    function EventListener() {
        // this.listeners = [];
    }
    EventListener.listeners = [];
    // Saving and rebinding event handlers feature requires Serializer
    if (Serializer) {
        var elSerializer;
        EventListener.savedEventListeners = [];
        EventListener.saveEventListeners = function (rootNode) {
            if (!rootNode) {
                console.error('rootNode is undefined');
                return;
            }
            elSerializer = new Serializer(rootNode);
            EventListener.savedEventListeners = [];
            EventListener.listeners.forEach(function (listener, i) {
                /* Some how $(node).parents(node) == parents of node */
                if ($(rootNode).find(listener.node).length > 0) {
                    EventListener.savedEventListeners = [];
                    EventListener.savedEventListeners.push({
                        handler: listener.handler,
                        key: listener.key,
                        node: elSerializer.serializeNode(listener.node),
                        index: i
                    });
                }
            });
            return EventListener.savedEventListeners;
        };
        EventListener.restoreEventListeners = function (rootNode) {
            if (!elSerializer || elSerializer.rootNode != rootNode) {
                return console.error("You haven't save event listeners or you're trying to restore event listeners of elements that are not children of this rootNode");
            }
            // Remove the obsolete event listeners. They becomes redundant when the rootNode is overriden.
            for (var i = 0; i < EventListener.savedEventListeners.length; i++) {
                EventListener.listeners.splice(EventListener.savedEventListeners[i].index, 1);
            }
            EventListener.savedEventListeners.forEach(function (listener) {
                var nNode = elSerializer.deserializeNode(listener.node);
                if (nNode) {
                    // addEventListener AGAIN
                    var param = {};
                    param[listener.key] = listener.handler;
                    EventListener.addEventListener().on(nNode)['with'](param);
                }
            });
        };
    }

    EventListener.addEventListener = function () {
        var node;
        return {
            on: on
        };
        function on(_node) {
            node = _node;
            return {
                'with': With
            };
        }
        function With(content) {
            if (!node) {
                //console.error('EventListener.addEventListener().on([Node])... Parameter 1 in on() is not of type Node!');
                return;
            }
            var linesOfKey = Object.getOwnPropertyNames(content);
            linesOfKey.forEach(function (keyString) {
                var keys = typeof keyString == "string" ? keyString.split(' ') : keyString;
                keys.forEach(function (key) {
                    if (typeof content[keyString] == "function") {
                        node.addEventListener(key, content[keyString]);
                        if (/Firefox/.test(getBrowser())) {
                            switch (key) {
                                case 'blur':
                                    $(node).on(key, content[keyString]);
                                    break;
                                default:
                                    break;
                            }
                        }
                        EventListener.listeners.push({
                            node: node,
                            key: key,
                            handler: content[keyString]
                        });
                    } else if (typeof content[keyString] == "object") {
                        var valid = true;
                        if (content[keyString].valid == false) {
                            valid = false;
                        }
                        if (valid) {
                            node.addEventListener(key, content[keyString].action);
                            EventListener.listeners.push({
                                node: node,
                                key: key,
                                handler: content[keyString].action
                            });
                        }
                    }
                });
            });
        }
    };

    function getBrowser() {
        return (function () {
            var ua = navigator.userAgent,
                tem,
                M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
            if (/trident/i.test(M[1])) {
                tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
                return 'IE ' + (tem[1] || '');
            }
            if (M[1] === 'Chrome') {
                tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
                if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
            }
            M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
            if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
            return M.join(' ');
        })();
    }

    // AMD support
    if (typeof define === "function" && define.amd) {
        // Define as an anonymous module
        define(EventListener);
    } else if (typeof module != "undefined" && module.exports) {
        module.exports = EventListener;
    } else {
        this.EventListener = EventListener;
    }
    return EventListener;
}).call(undefined, _csonSerializer2['default'], $);

},{"cson-serializer":1}],10:[function(require,module,exports){
/**
 * Created by chuso_000 on 19/9/2015.
 */

"use strict";

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _FigureFigureJs = require('../Figure/Figure.js');

var _FigureFigureJs2 = _interopRequireDefault(_FigureFigureJs);

exports["default"] = (function () {
    return {
        decorateWithBeforeValidator: decorateWithBeforeValidator,
        decorateAfter: decorateAfter,
        node: node,
        isLineEmpty: isLineEmpty,
        swap: swap,
        isCurrentRangeInEditorContainer: isCurrentRangeInEditorContainer,
        testImageUrl: testImageUrl,
        moveCursorTo: moveCursorTo,
        assign: assign,
        getBrowser: getBrowser,
        isAtStartOfLine: isAtStartOfLine,
        isAtEndOfLine: isAtEndOfLine

    };
    function isAtStartOfLine(block, range) {
        //console.log('Testing isAtStartOfLine');
        var lR = rangy.createRange();
        //console.log(block);
        //console.log(range.endContainer);
        lR.selectNodeContents(block);
        lR.setEnd(range.endContainer, range.endOffset);
        //console.log($(lR.cloneContents()));
        return !lR.cloneContents().textContent;
    }
    function isAtEndOfLine(block, range) {
        //console.log('Testing isAtEndOfLine');
        var rR = rangy.createRange();
        rR.selectNodeContents(block);
        rR.setStart(range.startContainer, range.startOffset);
        return !rR.cloneContents().textContent;
    }
    function assign(dest, source) {
        if (typeof source != "object" || typeof dest != "object") return;
        Object.getOwnPropertyNames(source).forEach(function (souKey) {
            if (!dest[souKey]) dest[souKey] = source[souKey];
        });
    }
    function decorateWithBeforeValidator(sc, property, beforeValidator) {
        if (typeof property == "string") property = property.split(' ');

        // Ex: decorateWithBeforeValidator(scope, ['applyBold', 'doSomethingElse'], validator, [arguments of applyBold], [arguments of doSomethingElse]);
        property.forEach(function (p, i) {
            var afterCb = sc[p].bind(sc, arguments[i]);
            sc[p] = function () {
                if (beforeValidator()) {
                    afterCb();
                }
            };
        });
    }
    function decorateAfter(sc, property, afterCb) {
        if (typeof property == "string") property = property.split(' ');

        // Ex: decorateWithBeforeValidator(scope, ['applyBold', 'doSomethingElse'], validator, [arguments of applyBold], [arguments of doSomethingElse]);
        property.forEach(function (p, i) {
            var beforeCb = sc[p].bind(sc, arguments[i]);
            sc[p] = function () {
                beforeCb();
                afterCb();
            };
        });
    }
    function moveCursorTo(_ref) {
        var startContainer = _ref.startContainer;
        var collapse = _ref.collapse;
        var startOffset = _ref.startOffset;
        var endContainer = _ref.endContainer;
        var endOffset = _ref.endOffset;

        startOffset = startOffset || 0;
        endOffset = endOffset || 0;
        var newR = rangy.createRange();
        if (collapse !== undefined) {
            var lastTN = _.last(node(startContainer).findTextNodes());
            newR.selectNodeContents(lastTN || startContainer);
            newR.collapse(collapse);
            rangy.getSelection().removeAllRanges();
            rangy.getSelection().addRange(newR);
            return;
        }
        if (startOffset) newR.setStart(startContainer, startOffset);
        if (endOffset) newR.setEnd(endContainer, endOffset);else {
            endContainer = startContainer;
            endOffset = startOffset;
        }
        if (startContainer) {
            rangy.getSelection().removeAllRanges();
            rangy.getSelection().addRange(newR);
        }
    }

    function getBrowser() {
        return (function () {
            var ua = navigator.userAgent,
                tem,
                M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
            if (/trident/i.test(M[1])) {
                tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
                return 'IE ' + (tem[1] || '');
            }
            if (M[1] === 'Chrome') {
                tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
                if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
            }
            M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
            if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
            return M.join(' ');
        })();
    }
    function node(_node) {
        return {
            isChildOf: isChildOf,
            findSibling: findSibling,
            isOneOfTheseNodes: isOneOfTheseNodes,
            parentOfTypes: parentOfTypes,
            removeAttributes: removeAttributes,
            editorFormat: editorFormat,
            after: after, //deprecated
            split: split,
            findTextNodes: findTextNodes,
            isFirstNodeIn: isFirstNodeIn,
            isLastNodeIn: isLastNodeIn,
            nodeChildLoop: nodeChildLoop
        };

        function isChildOf(parent) {
            if (typeof _node == "string") return $(_node).parents(parent).length > 0;
            if (typeof _node == "object") return $(parent).find(_node).length > 0;
        }
        function findSibling(sibling) {
            return {
                "in": In
            };
            function In(parent) {
                return $(_node).parents(parent).find(sibling)[0];
            }
        }
        function isOneOfTheseNodes(nodes) {
            if (typeof nodes == "string") nodes = nodes.split(' ');
            return nodes.indexOf(_node.nodeName.toUpperCase()) > -1;
        }

        function parentOfTypes(types) {
            if (typeof types == "string") types = types.split(' ');
            if (types.indexOf(_node.nodeName.toUpperCase()) > -1) return _node;
            for (var i = 0; i < types.length; i++) {
                if ($(_node).parents(types[i]).length > 0) return $(_node).parents(types[i])[0];
            }
            return null;
        }
        function removeAttributes() {
            if (!_node.nodeName && _node.length && _node.length > 0) {
                _.forEach(_node, function (n) {
                    if (n.nodeName.toUpperCase() != "#TEXT" && n.nodeName.toUpperCase() != "#COMMENT") node(n).removeAttributes();
                });
            } else {
                if (_node.attributes.length > 0) {
                    var attributesToDelete = _.map(_node.attributes, function (attr) {
                        return attr.nodeName;
                    });
                    if (_node.nodeName.toUpperCase() == "IMG" && _.indexOf(attributesToDelete, "src") > -1) {
                        _.remove(attributesToDelete, function (n) {
                            return n == "src";
                        });
                    }
                    if (_node.nodeName.toUpperCase() == "A" && _.indexOf(attributesToDelete, "href") > -1) {
                        _.remove(attributesToDelete, function (n) {
                            return n == "href";
                        });
                    }

                    _.forEach(attributesToDelete, function (a) {
                        _node.removeAttribute(a);
                    });
                }
                if (_node.hasChildNodes()) node(_node.childNodes).removeAttributes();
            }
        }
        function editorFormat() {
            var elementBlocks = "P BLOCKQUOTE H1 H2 H3 PRE".split(' ');
            $(_node).find('div').children().unwrap("div");
            $(_node).find('span').each(function () {
                $(this.childNodes).unwrap();
            });

            //
            _.forEach(_node.childNodes, function (n) {
                if (_.indexOf(elementBlocks, n.nodeName) == -1 && n.nodeName.toUpperCase() != "IMG") {
                    $(n).wrap("<p></p>");
                }
            });

            // Normalize text nodes
            _node.normalize();

            //console.log(_node.innerHTML);
            node(_node).nodeChildLoop(function (n) {
                var $imgs = n.nodeName.toUpperCase() == "IMG" ? $(n) : $(n).find('img');
                if ($imgs.length > 0) {
                    _.forEach($imgs, function (img) {
                        //console.log('Adding new Figure');
                        $(n).before(new _FigureFigureJs2["default"](img.attributes.src.value).elements.container);
                    });
                    $imgs.remove();
                }
            });

            // Clean up #comment, empty #text nodes and empty node
            for (var i = 0; i < _node.childNodes.length; i++) {
                var _nodeS = _node.childNodes[i];
                if (_nodeS.nodeName.toUpperCase() == "#COMMENT" || _nodeS.nodeName.toUpperCase() == "#TEXT" && _nodeS.textContent.trim() == "") {
                    _nodeS.remove();
                    i--;
                }
                if (_nodeS.nodeName.toUpperCase() != "IMG" && !_nodeS.querySelectorAll('img').length && !_nodeS.textContent.trim()) {
                    _nodeS.remove();
                    i--;
                }
            }

            // If an figure is an the end, append a <p><br/></p> after it!
            if (_node.lastChild && _node.lastChild.nodeName.toUpperCase() == "DIV" && /figure/i.test(_node.lastChild.className)) {
                $(_node).append("<p></p>");

                //let nP = document.createElement('p');
                //let nTN = document.createTextNode("");
                //$(nP).append('<br/>');
                //nP.appendChild(nTN);
                //$(_node).append(nP);
            }
        }

        // Deprecated
        function after(elements) {
            if (elements.length > 0) {
                $(_node).after(elements[0]);
                for (var i = 1; i < elements.length; i++) {
                    $(elements[i - 1]).after(elements[i]);
                }
            }
        }

        function findTextNodes() {
            var textNodes = [];
            if (_node.childNodes && _node.childNodes.length) {
                for (var i = 0; i < _node.childNodes.length; i++) {
                    var child = _node.childNodes[i];
                    //console.log(child);
                    //console.log('Before:',textNodes);
                    //console.log(node(child).findTextNodes());
                    textNodes = textNodes.concat(node(child).findTextNodes());
                    //console.log('After: ',textNodes);
                }
            } else {
                    if (_node.nodeName.toUpperCase() == "#TEXT") textNodes.push(_node);
                }
            return textNodes;
        }

        function isFirstNodeIn(rootNode) {
            if (!isChildOf(rootNode)) return false;
            var vNode = _node;
            //if (rangy.dom.getNodeIndex(vNode) !== 0) return false;
            while (vNode != rootNode) {
                if (rangy.dom.getNodeIndex(vNode) !== 0) return false;
                vNode = vNode.parentNode;
            }
            return true;
        }
        function isLastNodeIn(rootNode) {
            if (!isChildOf(rootNode)) return false;
            var vNode = _node;
            //if (rangy.dom.getNodeIndex(vNode) !== 0) return false;
            while (vNode != rootNode) {
                if (rangy.dom.getNodeIndex(vNode) !== rangy.dom.getNodeLength(vNode.parentNode) - 1) return false;
                vNode = vNode.parentNode;
            }
            return true;
        }

        /* If there's a new child in the rootNode during the loop, nodeChildLoop will ignore that. */
        function nodeChildLoop(cb) {
            var _rootNodeV = [];
            _.forEach(_node.childNodes, function (cn) {
                _rootNodeV.push(cn);
            });

            _.forEach(_rootNodeV, function (_nodeV) {
                cb(_nodeV);
            });
        }

        function split(node, offset) {
            var blockL = document.createElement(_node.nodeName),
                blockR = document.createElement(_node.nodeName);

            var rangeL = rangy.createRange();
            rangeL.setStart(_node.firstChild, 0);
            rangeL.setEnd(node, offset);

            var rangeR = rangy.createRange();
            rangeR.setStart(node, offset);
            rangeR.setEnd(_node.lastChild, rangy.dom.getNodeLength(_node.lastChild));

            var contentL = rangeL.extractContents(),
                contentR = rangeR.extractContents();

            while (contentL.firstChild) blockL.appendChild(contentL.firstChild);
            while (contentR.firstChild) blockR.appendChild(contentR.firstChild);

            _node.parentNode.insertBefore(blockL, _node);
            _node.parentNode.insertBefore(blockR, _node);

            _node.remove();

            return [blockL, blockR];
        }
    }

    function isLineEmpty(pContainer) {
        if (!pContainer || !pContainer.textContent) {
            //console.log(`This bitch don't even have textContent: `, pContainer);
            return true;
        }
        return !pContainer.textContent.trim();
    }
    function swap(v1, v2) {
        var c = v1;
        v1 = v2;
        v2 = c;
    }
    function isCurrentRangeInEditorContainer(editorContainer) {
        var _rangy$getNativeSelection = rangy.getNativeSelection();

        var baseNode = _rangy$getNativeSelection.baseNode;
        var extentNode = _rangy$getNativeSelection.extentNode;

        return $(editorContainer).has($(baseNode)).length > 0 && $(editorContainer).has($(extentNode)).length > 0;
    }
    function testImageUrl(url, callback, timeout) {
        timeout = timeout || 5000;
        var timedOut = false,
            timer;
        var img = new Image();
        img.onerror = img.onabort = function () {
            if (!timedOut) {
                clearTimeout(timer);
                callback(url, "error");
            }
        };
        img.onload = function () {
            if (!timedOut) {
                clearTimeout(timer);
                callback(url, "success");
            }
        };
        img.src = url;
        timer = setTimeout(function () {
            timedOut = true;
            callback(url, "timeout");
        }, timeout);
    }
})();

module.exports = exports["default"];

},{"../Figure/Figure.js":5}],11:[function(require,module,exports){
/**
 * Created by chuso_000 on 19/9/2015.
 */

'use strict';

exports.__esModule = true;

exports['default'] = function (editorContainer) {
    var bookmark = undefined;
    var $editor = $(editorContainer).find('.editor');
    //let linkingStuffDiv = $(editorContainer).find('.linkingStuff')[0];
    //let linkBtn = editorContainer.querySelector('.linkBtn');
    //let unlinkBtn = editorContainer.querySelector('.unlinkBtn');
    //let linkInput = $(editorContainer).find('input[name="linkAttached"]')[0];
    //let confirmBtn = editorContainer.querySelector('button.confirmLinkBtn');

    function saveBookmarkBeforeLinking() {
        var linkInput = $(editorContainer).find('input[name="linkAttached"]')[0];
        bookmark = rangy.getSelection().getBookmark($editor[0]);
        enableLinking();
        //scope.$apply();
        setTimeout(function () {
            linkInput.select();
            linkInput.focus();
        }, 0);
    }
    function confirm() {
        var linkInput = $(editorContainer).find('input[name="linkAttached"]')[0];
        $editor.focus();
        if (!bookmark) return;
        var bookmarkContainerNode = bookmark.rangeBookmarks[0].containerNode;
        if ($(editorContainer).has(bookmarkContainerNode).length > 0) {
            if (bookmark) {
                rangy.getSelection().moveToBookmark(bookmark);
                document.execCommand("CreateLink", false, linkInput.value);
                disableLinking();

                //console.log("Confirmed");
            }
        }
        disableAddLink();
    }

    ///* This function will be deprecated */
    //function enableAddLink(){
    //    var nativeSelection = rangy.getNativeSelection();
    //    if (!nativeSelection.isCollapsed) return ; //Terminate this action if there's no selection.
    //    //console.log(nativeSelection);
    //
    //    disableLinking();
    //    bookmark=null;
    //
    //}
    function enableLinking() {
        var linkingStuffDiv = $(editorContainer).find('.linkingStuff')[0];
        var confirmBtn = editorContainer.querySelector('button.confirmLinkBtn');
        var linkInput = $(editorContainer).find('input[name="linkAttached"]')[0];
        //linkingStuffDiv.style.visibility = "hidden";
        //linkingStuffDiv.style.visibility = "visible";
        $(linkingStuffDiv).addClass('show');
        linkInput.removeAttribute('disabled');
        confirmBtn.removeAttribute('disabled');
    }
    function disableLinking() {
        var linkingStuffDiv = $(editorContainer).find('.linkingStuff')[0];
        var linkBtn = editorContainer.querySelector('.linkBtn');
        var confirmBtn = editorContainer.querySelector('button.confirmLinkBtn');
        var linkInput = $(editorContainer).find('input[name="linkAttached"]')[0];
        //linkingStuffDiv.style.visibility = "hidden";
        $(linkingStuffDiv).removeClass('show');
        linkInput.setAttribute('disabled', 'disabled');
        confirmBtn.setAttribute('disabled', 'disabled');
    }
    function unlink() {
        document.execCommand('unlink');
        enableAddLink();
    }

    /* When selection does NOT contain a link, show the linkBtn and hide the unlinkBtn */
    function enableAddLink() {
        var linkBtn = editorContainer.querySelector('.linkBtn');
        var unlinkBtn = editorContainer.querySelector('.unlinkBtn');
        linkBtn.style.display = "inline-block";
        unlinkBtn.style.display = "none";
    }
    /* When selection contains a link, hide the linkBtn and show the unlinkBtn */
    function disableAddLink() {
        var linkBtn = editorContainer.querySelector('.linkBtn');
        var unlinkBtn = editorContainer.querySelector('.unlinkBtn');
        linkBtn.style.display = "none";
        unlinkBtn.style.display = "inline-block";
    }
    return {
        saveBookmarkBeforeLinking: saveBookmarkBeforeLinking,
        confirm: confirm,
        //enableAddLink: enableAddLink,
        enableLinking: enableLinking,
        disableLinking: disableLinking,
        enableAddLink: enableAddLink,
        disableAddLink: disableAddLink,
        unlink: unlink
    };
};

module.exports = exports['default'];

},{}]},{},[3]);
