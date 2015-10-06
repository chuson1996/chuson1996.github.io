(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Created by chuso_000 on 19/9/2015.
 */

'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mainEditorFigureFigure = require('../main/Editor/Figure/Figure');

var _mainEditorFigureFigure2 = _interopRequireDefault(_mainEditorFigureFigure);

exports['default'] = (function () {
    return {
        decorateWithBeforeValidator: decorateWithBeforeValidator,
        decorateAfter: decorateAfter,
        addEventListener: addEventListener,
        node: node,
        isLineEmpty: isLineEmpty,
        swap: swap,
        isCurrentRangeInEditorContainer: isCurrentRangeInEditorContainer,
        testImageUrl: testImageUrl

    };
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
    function addEventListener() {
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
            var linesOfKey = Object.getOwnPropertyNames(content);
            linesOfKey.forEach(function (keyString) {
                var keys = typeof keyString == "string" ? keyString.split(' ') : keyString;
                keys.forEach(function (key) {
                    if (typeof content[keyString] == "function") node.addEventListener(key, content[keyString]);else if (typeof content[keyString] == "object") {
                        var valid = true;
                        if (content[keyString].valid == false) {
                            valid = false;
                        }
                        if (valid) node.addEventListener(key, content[keyString].action);
                    }
                });
            });
        }
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
                'in': In
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
            //console.log(_node);
            if (!_node.nodeName && _node.length && _node.length > 0) {
                _.forEach(_node, function (n) {
                    if (n.nodeName.toUpperCase() != "#TEXT" && n.nodeName.toUpperCase() != "#COMMENT") node(n).removeAttributes();
                    //if (n.nodeName.toUpperCase() == "#TEXT" && !n.textContent.trim())
                    //{
                    //    console.log(_node);
                    //    _node.remove(n);
                    //}
                    //if (n.nodeName.toUpperCase() == "#COMMENT")
                    //{
                    //    console.log(_node);
                    //    _node.remove(n);
                    //}
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
                        //console.log(`attributesToDelete: `, attributesToDelete);
                        _.forEach(attributesToDelete, function (a) {
                            //console.log(`Removing ${a} from `, $(_node));
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
                //else if (n.nodeName == "IMG"){
                //    var nImg = new Figure(n.attributes.src.value);
                //    $(n).after(nImg.elements.container);
                //    n.remove();
                //}
            });

            // Normalize text nodes
            _node.innerHTML = _node.innerHTML;

            node(_node).nodeChildLoop(function (n) {
                var $imgs = n.nodeName.toUpperCase() == "IMG" ? $(n) : $(n).find('img');
                //console.log($imgs.length);
                if ($imgs.length > 0) {
                    _.forEach($imgs, function (img) {
                        //console.log('Adding new Figure');
                        $(n).before(new _mainEditorFigureFigure2['default'](img.attributes.src.value).elements.container);
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
                if (_nodeS.nodeName.toUpperCase() != "IMG" && !_nodeS.innerText.trim()) {
                    _nodeS.remove();
                    i--;
                }
            }

            // If an figure is an the end, append a <p><br/></p> after it!
            if (_node.lastChild.nodeName.toUpperCase() == "DIV" && /figure/i.test(_node.lastChild.className)) {
                $(_node).append("<p>&nbsp;</p>");
                //var newP = document.createElement('p');
                //newP.appendChild(document.createTextNode(""));
                //_node.appendChild(newP);
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
        if (!pContainer || !pContainer.innerText) {
            //console.log(`This bitch don't even have innerText: `, pContainer);
            return true;
        }
        return !pContainer.innerText.trim();
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

module.exports = exports['default'];

},{"../main/Editor/Figure/Figure":4}],2:[function(require,module,exports){
//import CustomEvents from '../../helper/customEvents';
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helperHelper = require('../../helper/helper');

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

var Paragraph = (function () {
    function Paragraph() {
        _classCallCheck(this, Paragraph);

        this.template = _editorTemplateJs2['default'];

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

        this.linking = _linkingM2['default']($(this.editorContainer));
        this.formatText = _formatTextM2['default']();

        this.options = {};
        this.options.prototype = {
            pasteAsText: true,
            inlineMode: false
        };

        //this.customEvents = new CustomEvents(this.editorContainer);

        this.bindCustomEvents();
        this.bindEvents();
        this.bindImageUploadHandler();

        this.paragraphUndoManager = new _EditorUndoManagerJs2['default'](this.elements.editor);
        this.paragraphUndoManager.saveEditorState();
    }

    Paragraph.prototype.bindCustomEvents = function bindCustomEvents() {
        var _this = this;

        EventListener.addEventListener().on(this.editor)['with']({
            'mouseup keyup focusout': function mouseupKeyupFocusout() {
                // Text highlighted ?
                if (!rangy.getNativeSelection().isCollapsed) _this.showEditorMenu();else _this.hideEditorMenu();

                // Cursor at an empty paragraph ?
                if (rangy.getSelection().anchorNode && rangy.getSelection().anchorNode.nodeName == "P" && rangy.getSelection().focusNode && rangy.getSelection().focusNode.nodeName == "P" && !rangy.getSelection().anchorNode.innerText.trim() && rangy.getSelection().rangeCount == 1) _this.showInsertToolbar();else _this.hideInsertToolbar();
            },
            'mouseup keyup': function mouseupKeyup() {
                // Selection contains link ?
                var selectionContainsLink = (function () {
                    if (!rangy.getSelection() || rangy.getSelection().isCollapsed) return false;
                    var cloneContent = rangy.getSelection().getRangeAt(0).cloneContents();
                    return $(cloneContent).find('a').length > 0;
                }).call(_this);
                if (selectionContainsLink) _this.linking.disableAddLink();else _this.linking.enableAddLink();
            }
        });
    };

    Paragraph.prototype.bindEvents = function bindEvents() {
        var _this2 = this;

        /* Events on this.editor */
        EventListener.addEventListener().on(this.editor)['with']({
            'paste': function paste(e) {
                /* Prevent pasting formatted text */
                e.preventDefault();

                var curRange = rangy.getSelection().getRangeAt(0);
                var cbData = document.createElement('div');
                var block = _helperHelper2['default'].node(curRange.endContainer).parentOfTypes("P BLOCKQUOTE H1 H2 H3 PRE");
                $(cbData).append($(e.clipboardData.getData('text/html')));
                _helperHelper2['default'].node(cbData).removeAttributes();
                _helperHelper2['default'].node(cbData).editorFormat();
                console.log(cbData.childNodes);

                if (!rangy.getSelection().isCollapsed) document.execCommand('delete');

                //rangeStartContainer = hp.node(cbData).findTextNodes()[hp.node(cbData).findTextNodes().length-1];

                var rangeStartContainer = undefined;
                var rangeStartOffset = undefined;

                if (_helperHelper2['default'].node(cbData.lastChild).findTextNodes().length) {
                    console.log('Found some text nodes: ', _helperHelper2['default'].node(cbData.lastChild).findTextNodes());
                    rangeStartContainer = _helperHelper2['default'].node(cbData.lastChild).findTextNodes()[_helperHelper2['default'].node(cbData.lastChild).findTextNodes().length - 1];
                    rangeStartOffset = rangy.dom.getNodeLength(rangeStartContainer);
                } else {
                    rangeStartContainer = curRange.startContainer;
                    rangeStartOffset = curRange.startOffset;
                    console.log('No text nodes found in the clipboard! new startContainer: ', rangeStartContainer);
                }

                /* Check if cursor is at the first or end of the block */
                if (_helperHelper2['default'].node(curRange.startContainer).isFirstNodeIn(block) && curRange.startOffset == 0 || !block.innerText.trim()) {
                    console.log('Prepend to the block');

                    if (cbData.lastChild.nodeName.toUpperCase() == "P" || cbData.lastChild.nodeName == block.nodeName) {
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

                    //console.log(rangeStartContainer);

                    //rangeStartContainer = hp.node(block).findTextNodes()[0] || block;
                    //rangeStartOffset = 0;
                } else if (_helperHelper2['default'].node(curRange.startContainer).isLastNodeIn(block) && curRange.startOffset == rangy.dom.getNodeLength(curRange.startContainer)) {
                        console.log('Append to block');
                        if (cbData.firstChild.nodeName.toUpperCase() == "P" || cbData.firstChild.nodeName == block.nodeName) {
                            // Merge the first node to block
                            $(block).append(cbData.firstChild.childNodes);
                            block.normalize();
                            rangeStartContainer = _helperHelper2['default'].node(block).findTextNodes()[_helperHelper2['default'].node(block).findTextNodes().length - 1];
                            //console.log(rangeStartContainer);
                            rangeStartOffset = rangy.dom.getNodeLength(rangeStartContainer);

                            cbData.firstChild.remove();
                        }
                        if (cbData.childNodes.length) {
                            //rangeStartContainer = hp.node(cbData.lastChild).findTextNodes()[hp.node(cbData.lastChild).findTextNodes().length-1];
                            //console.log(rangeStartContainer);
                            //rangeStartOffset = rangy.dom.getNodeLength(rangeStartContainer);

                            //console.log();
                            $(block).after(cbData.childNodes);
                            cbData.remove();
                        }
                        //rangeStartContainer = hp.node(block).findTextNodes()[hp.node(block).findTextNodes().length-1] || block;
                        //rangeStartOffset = rangy.dom.getNodeLength(rangeStartContainer);
                    } else {
                            console.log('Split and insert in the middle!');

                            var _hp$node$split = _helperHelper2['default'].node(block).split(curRange.startContainer, curRange.startOffset);

                            var blockL = _hp$node$split[0];
                            var blockR = _hp$node$split[1];

                            if (cbData.firstChild.nodeName.toUpperCase() == "P" || cbData.firstChild.nodeName == blockL.nodeName) {
                                $(blockL).append(cbData.firstChild.childNodes);
                                blockL.normalize();
                                rangeStartContainer = _helperHelper2['default'].node(blockL).findTextNodes()[_helperHelper2['default'].node(blockL).findTextNodes().length - 1];
                                rangeStartOffset = rangy.dom.getNodeLength(rangeStartContainer);

                                cbData.firstChild.remove();
                            } else {}
                            //console.log(cbData.children);
                            if (!cbData.children.length) {
                                //console.log('Merge blockR to blockL');
                                $(blockL).append(blockR.childNodes);
                                blockL.normalize();
                                //rangeStartContainer = hp.node(blockL).findTextNodes()[hp.node(blockL).findTextNodes().length-1];
                                //rangeStartOffset = rangy.dom.getNodeLength(rangeStartContainer);

                                blockR.remove();
                            } else if (cbData.lastChild.nodeName.toUpperCase() == "P" || cbData.lastChild.nodeName == blockR.nodeName) {
                                // Merge the rest of the copied content to blockR
                                $(blockR).prepend(cbData.lastChild.childNodes);
                                blockR.normalize();
                                cbData.lastChild.remove();
                            }
                            if (cbData.childNodes.length) {
                                $(blockL).after(cbData.childNodes);
                            }
                            //rangeStartContainer = hp.node(blockR).findTextNodes()[0];
                            //rangeStartOffset = rangy.dom.getNodeLength(rangeStartContainer);
                        }

                var newRange = rangy.createRange();
                console.log(rangeStartContainer, rangeStartOffset);
                newRange.setStart(rangeStartContainer, rangeStartOffset);

                rangy.getSelection().removeAllRanges();
                rangy.getSelection().addRange(newRange);

                //console.log(cbData.innerHTML);
                //document.execCommand('insertHTML', false, cbData.innerHTML);

                //$(hp.node(curRange.endContainer).parentOfTypes("P BLOCKQUOTE H1 H2 H3")).after($(cbData).children());
            },
            'mouseup keyup': function mouseupKeyup(e) {
                /* Guarantee that the editor must always contain at least 1 "P" node. If not, "#TEXT" node will take place. */
                if (!_this2.elements.editor.innerHTML) {
                    _this2.elements.editor.innerHTML = "<p><br/></p>";
                    var nR = rangy.getSelection().getRangeAt(0);
                    nR.setStart(_this2.elements.editor.firstElementChild, 0);
                    rangy.getSelection().removeAllRanges();
                    rangy.getSelection().addRange(nR);
                }

                //console.log(rangy.getSelection().getRangeAt(0));
                setTimeout(function () {
                    /* Disable or hide linking stuff */
                    _this2.linking.disableLinking();

                    _this2.insertToolbarState().initial.call(_this2);
                }, 0);
            },
            'focusout': function focusout(e) {
                /* If users focus out of the container, all ranges must be removed.
                 * editorMenu + insertToolbar must be hidden.
                 * This line below prevents scenarios when user click extensions like editorMenu or insertToolbar*/
                if (!($(_this2.editorContainer).has($(e.relatedTarget)).length > 0)) {
                    rangy.getSelection().removeAllRanges();
                }
            },
            'keydown': function keydown(e) {
                /* Disable undo default shortcut for windows */
                if (e.ctrlKey && e.keyCode == 90) {
                    e.preventDefault();
                    // If timer is still running, terminate it and saveEditorState
                    if (saving) {
                        //console.log('TTTTTerminate');
                        //console.log(saving);
                        clearTimeout(timer);
                        saving = false;
                        _this2.paragraphUndoManager.saveEditorState();
                    }
                    if (e.shiftKey) {
                        _this2.paragraphUndoManager.redo();
                    } else {
                        _this2.paragraphUndoManager.undo();
                    }
                    startValue = _this2.getEditorContent();
                    //console.log(this.paragraphUndoManager.editorStates);
                }
                /* Remain a br tag within a paragraph when editor is emptied. */
                if (e.keyCode == 8 && $(_this2.elements.editor).find('p, blockquote, h1, h2, h3').length == 1 && (!$(_this2.elements.editor).text() || _this2.elements.editor.innerText == document.createElement("br").innerText)) e.preventDefault();

                if (e.keyCode == 13 && _this2.options.mode == "inline") {
                    e.preventDefault();
                    return;
                }
                if (e.keyCode == 13 && !e.shiftKey) {
                    var selectionRange = rangy.getSelection().getRangeAt(0);
                    var block = _helperHelper2['default'].node(selectionRange.commonAncestorContainer).parentOfTypes("BLOCKQUOTE H1 H2 H3 PRE");
                    if (block) {
                        // if ($(selectionRange.commonAncestorContainer).parents("blockquote").length > 0) {
                        e.preventDefault();
                        _this2.exitBlockAfterLinebreak();
                    }
                }
            }
        });

        // Undo and Redo
        var timer,
            saving = false;
        var startValue = this.getEditorContent();

        EventListener.addEventListener().on(this.editor)['with']({
            'mouseup keyup drag paste': function mouseupKeyupDragPaste(e) {
                if (e.type == "keyup" && e.ctrlKey && e.keyCode == 90) {
                    return;
                }

                //console.log(e);
                saveEditorState.call(_this2);
            }
        });

        /* In order to save the editor's state after clicking formatting-text buttons, decorate those function with an after function: this.paragraphUndoManager.saveEditorState*/
        _helperHelper2['default'].decorateAfter(this.formatText, 'bold h1 h2 blockquote highlight', saveEditorState.bind(this));
        _helperHelper2['default'].decorateAfter(this.formatText.justify, 'center left right', saveEditorState.bind(this));
        _helperHelper2['default'].decorateAfter(this.linking, 'confirm', saveEditorState.bind(this));

        function saveEditorState() {
            var _this3 = this;

            clearTimeout(timer);
            saving = true;
            timer = setTimeout(function () {
                saving = false;
                var newValue = _this3.getEditorContent();
                if (startValue != newValue) {
                    //console.log(startValue);
                    //console.log(newValue);
                    _this3.paragraphUndoManager.saveEditorState();
                    startValue = newValue;
                }
            }, 250);
        }

        /* Events on buttons */
        EventListener.addEventListener().on(this.elements.boldBtn)['with']({
            'click': this.formatText.bold.bind(this)
        });

        /* After applying blockquote, I want the editorMenu to change its position  */
        _helperHelper2['default'].decorateAfter(this.formatText, 'h1 h2 blockquote', function () {
            setTimeout(function () {
                _this2.showEditorMenu();
            }, 0);
        });
        EventListener.addEventListener().on(this.elements.h1Btn)['with']({
            'click': this.formatText.h1.bind(this)
        });
        EventListener.addEventListener().on(this.elements.h2Btn)['with']({
            'click': this.formatText.h2.bind(this)
        });
        EventListener.addEventListener().on(this.elements.blockquoteBtn)['with']({
            'click': this.formatText.blockquote.bind(this)
        });
        EventListener.addEventListener().on(this.elements.justifyCenterBtn)['with']({
            'click': function click() {
                _this2.formatText.justify.center.call(_this2);
                setTimeout(function () {
                    _this2.showEditorMenu();
                }, 0);
            }
        });
        EventListener.addEventListener().on(this.elements.justifyLeftBtn)['with']({
            'click': function click() {
                _this2.formatText.justify.left.call(_this2);
                setTimeout(function () {
                    _this2.showEditorMenu();
                }, 0);
            }
        });
        EventListener.addEventListener().on(this.elements.justifyRightBtn)['with']({
            'click': function click() {
                _this2.formatText.justify.right.call(_this2);
                setTimeout(function () {
                    _this2.showEditorMenu();
                }, 0);
            }
        });
        EventListener.addEventListener().on(this.elements.highlightBtn)['with']({
            'click': this.formatText.highlight.bind(this)
        });
        EventListener.addEventListener().on(this.elements.linkBtn)['with']({
            'click': this.linking.saveBookmarkBeforeLinking.bind(this)
        });
        EventListener.addEventListener().on(this.elements.unlinkBtn)['with']({
            'click': this.linking.unlink.bind(this)
        });
        EventListener.addEventListener().on(this.elements.confirmLinkBtn)['with']({
            'click': this.linking.confirm.bind(this)
        });
        EventListener.addEventListener().on(this.elements.expandInsertToolbarBtn)['with']({
            'click': this.insertToolbarState.call(this).showOptions.bind(this)
        });
        EventListener.addEventListener().on(this.elements.addImgBtn)['with']({
            'click': this.insertToolbarState.call(this).addImg.bind(this)
        });
        EventListener.addEventListener().on(this.elements.editorInsertToolbar.querySelector(".enterImgUrlBtn"))['with']({
            'click': function click() {
                /* Save the cursor position before focusing on the text input */
                _this2.cursorAt = rangy.getSelection().saveRanges();

                _this2.insertToolbarState.call(_this2).addImg().pasteUrl();
                _this2.elements.editorInsertToolbar.querySelector('.addImgOptions form input[name="pastedImgUrl"]').focus();
            }
        });
        EventListener.addEventListener().on(this.elements.editorInsertToolbar.querySelector(".addImgOptions form"))['with']({
            'submit': function submit(e) {
                e.preventDefault();

                /* Restore the position of the cursor */
                if (_this2.cursorAt) rangy.getSelection().restoreRanges(_this2.cursorAt);

                setTimeout(function () {
                    _this2.insertImage(_this2.elements.editorInsertToolbar.querySelector('.addImgOptions form input[name="pastedImgUrl"]').value);
                    _this2.elements.editorInsertToolbar.querySelector('.addImgOptions form input[name="pastedImgUrl"]').value = "";
                }, 1);

                _this2.insertToolbarState().initial();
            }
        });
    };

    Paragraph.prototype.getEditorContent = function getEditorContent() {
        /* 1. Clone the editor
         * 2. Remove menus off the clone
         * 3. Get html */
        var $clone = $(this.editor).clone();
        /* Clicking on images results in adding classes on images and showing the figureMenus. Therefore I have to remove the "class" attributes on images and their figureMenus.
         * However this is a very DIRTY way to do! What if the type of nodes varies, they display identically but have different class set on them? */
        $clone.find(".menu").remove();
        $clone.find("img").removeAttr('class');
        return $clone.html();
    };

    Paragraph.prototype.bindImageUploadHandler = function bindImageUploadHandler() {
        var _this4 = this;

        this.uploadFileHandler($(this.editorContainer).find('.editorInsertToolbar .content input.imageUploadInput'), function (files) {
            var file = files[0];
            var imageUrl = '/uploads/' + file.name;
            //console.log(imageUrl);
            _this4.insertImage(imageUrl);
        });
    };

    Paragraph.prototype.uploadFileHandler = function uploadFileHandler(fileInput, _done, error) {
        $(fileInput).fileupload({
            dataType: 'json',
            disableImageResize: /Android(?!.*Chrome)|Opera/.test(window.navigator && navigator.userAgent),
            imageMaxWidth: 800,
            imageMaxHeight: 800,
            imageCrop: true, // Force cropped images
            add: function add(e, data) {
                // you can filter files in here
                var file = data.files[0];
                if (!/image/i.test(file.type)) {
                    console.log(file);
                    alert('Wrong type of file!');
                    return data.abort();
                }
                return data.submit();
            },
            progressall: function progressall(e, data) {
                var a = data.loaded / data.total;
                var progress = a * 100;
                //console.log(progress);
            },
            done: function done(e, data) {
                $.each(data.result.files, function (index, file) {
                    //$('<p/>').text(file.name).appendTo(document.body);
                    //console.log(file.name);
                });
                _done(data.result.files);
            }
        });
    };

    Paragraph.prototype.showEditorMenu = function showEditorMenu() {
        var editorMenu = this.elements.editorMenu;

        /*  Move editorMenu to a new position and show */
        var wholeSelRect = rangy.getSelection().getBoundingDocumentRect();
        var bodyWidth = $('body').width();
        editorMenu.style.top = (wholeSelRect.top - 39 - 20).toString() + "px";
        if (wholeSelRect.left < bodyWidth - 370) editorMenu.style.left = wholeSelRect.left + "px";else editorMenu.style.left = (wholeSelRect.right - 370).toString() + "px";
        $(editorMenu).removeClass('hidden');
        $(editorMenu).addClass('show');
    };

    Paragraph.prototype.hideEditorMenu = function hideEditorMenu() {
        $(this.elements.editorMenu).addClass('hidden').removeClass('show');
    };

    Paragraph.prototype.showInsertToolbar = function showInsertToolbar() {
        var selectionRange = rangy.getSelection().getRangeAt(0);
        var pContainer = _helperHelper2['default'].node(selectionRange.commonAncestorContainer).parentOfTypes("P");
        if (!pContainer) return;

        this.editorInsertToolbar.style.top = pContainer.offsetTop - 10 + "px";
        this.editorInsertToolbar.style.left = pContainer.offsetLeft - 40 + "px";
        $(this.editorInsertToolbar).removeClass('hidden').addClass('show');
    };

    Paragraph.prototype.hideInsertToolbar = function hideInsertToolbar() {
        /*  */
        $(this.editorInsertToolbar).removeClass('show').addClass('hidden');
    };

    Paragraph.prototype.insertImage = function insertImage(imgUrl) {
        var selectionRange = rangy.getSelection().getRangeAt(0);
        var pContainer = selectionRange.commonAncestorContainer.nodeName == 'P' ? selectionRange.commonAncestorContainer : $(selectionRange.commonAncestorContainer).parents('p')[0];
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
    };

    Paragraph.prototype.exitBlockAfterLinebreak = function exitBlockAfterLinebreak() {
        //let selectionRange = rangy.getSelection().getRangeAt(0);
        //let block = hp.node(selectionRange.commonAncestorContainer).parentOfTypes(blockName);
        //if (!rangy.getSelection().isCollapsed)
        //    document.execCommand('delete');
        //
        //let range2 = rangy.createRange();
        //range2.setStart(selectionRange.endContainer, selectionRange.endOffset);
        //range2.setEndAfter(block);
        //let copiedFrag = range2.extractContents();
        //let copiedContainer = copiedFrag.firstChild;
        //let copiedContent = $(copiedContainer).html();
        //
        //let newP = document.createElement('p');
        //if (copiedContent && copiedContainer.innerText)
        //    $(newP).html(copiedContent);
        //else
        //    $(newP).html('<br/>');
        //rangy.dom.insertAfter(newP, block);
        //block.normalize();
        //let newRange = rangy.createRange();
        //newRange.setStart(newP, 0);
        //rangy.getSelection().removeAllRanges();
        //rangy.getSelection().addRange(newRange);
        document.execCommand('insertParagraph');
        document.execCommand('formatBlock', false, "p");
        //console.log(blockName);
    };

    Paragraph.prototype.expandInsertToolbar = function expandInsertToolbar() {
        var $insertToolbarContent = $(this.editorInsertToolbar).find('.content');
        $insertToolbarContent.show();
    };

    Paragraph.prototype.narrowInsertToolbar = function narrowInsertToolbar() {
        var $insertToolbarContent = $(this.editorInsertToolbar).find('.content');
        //this.elements.addImgOptions.style.visibility = "hidden";
        $insertToolbarContent.hide();
    };

    Paragraph.prototype.insertToolbarState = function insertToolbarState() {
        var state = "initial";
        var contentDiv = $(this.elements.editorInsertToolbar).find('.content')[0];
        var addImgOptions = $(this.elements.editorInsertToolbar).find('.addImgOptions')[0];
        var addImgForm = $(this.elements.editorInsertToolbar).find('.addImgOptions form')[0];
        var inputText = $(this.elements.editorInsertToolbar).find('.addImgOptions form input[name="pastedImgUrl"]')[0];
        return {
            state: state,
            initial: initial,
            showOptions: showOptions,
            addImg: addImg
        };

        function initial() {
            state = "initial";
            contentDiv.style.display = "none";
        }

        function showOptions() {
            state = "showOptions";
            /* Make sure no redundancy is shown */
            addImgOptions.style.visibility = "hidden";
            addImgForm.style.visibility = "hidden";
            /* ------ */
            $(contentDiv).show();
        }

        function addImg() {
            state = "addImg";
            addImgOptions.style.visibility = "visible";

            return {
                pasteUrl: pasteUrl
            };

            function pasteUrl() {
                addImgForm.style.visibility = "visible";
                inputText.style.display = "block";
            }
        }
    };

    return Paragraph;
})();

exports['default'] = Paragraph;
module.exports = exports['default'];

},{"../../helper/helper":1,"./EditorUndoManager.js":3,"./Figure/Figure":4,"./editor.template.js":5,"./formatTextM":6,"./linkingM":7}],3:[function(require,module,exports){
/**
 * Created by chuso_000 on 28/9/2015.
 */
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _undoManager = require('undo-manager');

var _undoManager2 = _interopRequireDefault(_undoManager);

var _helperHelper = require('../../helper/helper');

var _helperHelper2 = _interopRequireDefault(_helperHelper);

var _FigureFigureJs = require('./Figure/Figure.js');

var _FigureFigureJs2 = _interopRequireDefault(_FigureFigureJs);

var ParagraphUndoManager = (function () {
    function ParagraphUndoManager(editor) {
        _classCallCheck(this, ParagraphUndoManager);

        this.paraUndoManager = new _undoManager2['default']();
        this.editor = editor;
        this.editorStates = {};
        this.index = 0;
        this.paraSerializer = new Serializer(this.editor);
        //this.saveEditorState();
    }

    ParagraphUndoManager.prototype.saveEditorState = function saveEditorState() {
        var _this = this;

        //let id = this.generateId();
        console.log('Saved');
        var id = this.index;
        var editorState = {
            innerHTML: this.editor.innerHTML
        };
        //console.log(rangy.getSelection);

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
    };

    ParagraphUndoManager.prototype.addEditorState = function addEditorState(id, editorState) {
        this.editorStates[id] = editorState;
        this.index++;
    };

    ParagraphUndoManager.prototype.removeEditorState = function removeEditorState(id) {
        delete this.editorStates[id];
        this.index--;
    };

    ParagraphUndoManager.prototype.hasUndo = function hasUndo() {
        return this.paraUndoManager.hasUndo();
    };

    ParagraphUndoManager.prototype.hasRedo = function hasRedo() {
        return this.paraUndoManager.hasRedo();
    };

    ParagraphUndoManager.prototype.undo = function undo() {
        if (!this.hasUndo()) return;
        //this.saveEditorState();
        console.log(this.editorStates);

        this.paraUndoManager.undo();
        // Clear time out when undo
        this.restoreEditorState();
    };

    ParagraphUndoManager.prototype.redo = function redo() {
        if (!this.hasRedo()) return;
        this.paraUndoManager.redo();
        //console.log(this.editorStates);
        // Clear time out when undo
        this.restoreEditorState();
    };

    ParagraphUndoManager.prototype.restoreEditorState = function restoreEditorState() {
        if (Object.getOwnPropertyNames(this.editorStates).length) {
            var _editorStates = this.editorStates[Object.getOwnPropertyNames(this.editorStates).length - 1];
            var innerHTML = _editorStates.innerHTML;
            var storedRange = _editorStates.storedRange;

            //console.log(storedRange);

            if (this.editor) {
                EventListener.saveEventListeners(this.editor);
                //console.log(EventListener.savedEventListeners);
                this.editor.innerHTML = innerHTML;
                EventListener.restoreEventListeners(this.editor);
                /* !! You need to have a custom figure restoring function here !! */
                // Step 1: Find figure div and remove all event listeners from every child in it, including itself
                _.remove(EventListener.listeners, function (listener) {
                    return (/figure/i.test(listener.node.className) || $(listener.node).parents('.figure').length
                    );
                });

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
                console.log(nR);
                document.getSelection().addRange(nR);
            }
            //else this.editor.focus();
        }
    };

    ParagraphUndoManager.prototype.generateId = function generateId() {
        var generatedNumber = Math.round(Math.random() * 10000000);
        if (_.indexOf(Object.getOwnPropertyNames(this.editorStates), generatedNumber) == -1) return generatedNumber;else this.generateId();
    };

    return ParagraphUndoManager;
})();

exports['default'] = ParagraphUndoManager;
module.exports = exports['default'];

},{"../../helper/helper":1,"./Figure/Figure.js":4,"undo-manager":9}],4:[function(require,module,exports){
/**
 * Created by chuso_000 on 23/9/2015.
 */

'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helperHelper = require('../../../helper/helper');

var _helperHelper2 = _interopRequireDefault(_helperHelper);

var Figure = (function () {
    function Figure(imgUrl) {
        _classCallCheck(this, Figure);

        //this.imgUrl = imgUrl;
        if (imgUrl) {
            this.template = '<div class="figure" contenteditable="false"><div class="menu figureMenu"><button class="btn imageJustifyLeftBtn">L</button><button class="btn imageJustifyCenterBtn">C</button><button class="btn imageJustifyRightBtn">R</button></div><div class="aspectRatioPlaceholder"><img src="' + imgUrl + '" alt=""/><div class="figureCaption" contenteditable="true"><br/></div></div></div>';
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
        this.elements.figureMenu = this.elements.container.querySelector('.figureMenu');

        this.elements.img = this.elements.container.querySelector('img');
        this.elements.aspectRatioPlaceholder = this.elements.container.querySelector('.aspectRatioPlaceholder');
        this.elements.figureCaption = this.elements.container.querySelector('.figureCaption');
        this.elements.imageJustifyLeftBtn = this.elements.figureMenu.querySelector('.imageJustifyLeftBtn');
        this.elements.imageJustifyRightBtn = this.elements.figureMenu.querySelector('.imageJustifyRightBtn');
        this.elements.imageJustifyCenterBtn = this.elements.figureMenu.querySelector('.imageJustifyCenterBtn');
    };

    Figure.prototype.bindEvents = function bindEvents() {
        var _this2 = this;

        /* Events on image */
        EventListener.addEventListener().on(this.elements.img)['with']({
            'click': function click(e) {
                //console.log('c');
                $(_this2.elements.img).addClass('focused');
                var nRange = rangy.createRange();
                nRange.setStart(_this2.elements.figureCaption, 0);
                nRange.setEnd(_this2.elements.figureCaption, 0);
                rangy.getSelection().removeAllRanges();
                rangy.getSelection().addRange(nRange);
                _this2.showFigureMenu();
            },
            'dragstart': function dragstart(e) {
                // Disable dragging images
                e.preventDefault();
            }
        });

        /* Events on figureCaption */
        EventListener.addEventListener().on(this.elements.figureCaption)['with']({
            'keypress': function keypress(e) {
                /* Go to a line break after pressing enter in the figureCaption */
                if (e.keyCode == 13) {
                    e.preventDefault();
                    var newLine = document.createElement('p');
                    $(newLine).html('<br/>');

                    $(newLine).insertAfter(_this2.elements.container);

                    var newRange = rangy.createRange();
                    newRange.setStart(newLine, 0);
                    rangy.getSelection().removeAllRanges();
                    rangy.getSelection().addRange(newRange);
                }
            },
            'keydown': function keydown(e) {
                /* When hitting backspace at the first offset in figureCaption, delete this figure */
                if (e.keyCode == 8) {
                    if (rangy.getSelection().getRangeAt(0).startOffset == 0) {
                        e.preventDefault();
                        var nRange = rangy.createRange();
                        nRange.setStartBefore(_this2.elements.container);
                        nRange.setEndBefore(_this2.elements.container);
                        _this2.elements.container.parentNode.removeChild(_this2.elements.container);
                        rangy.getSelection().removeAllRanges();
                        rangy.getSelection().addRange(nRange);

                        /* Check if the new line is empty, show insertToolbar */
                        // ?
                    }
                }
            },
            'keyup': function keyup(e) {
                if (_this2.elements.figureCaption.innerText.trim() == "" && _this2.elements.figureCaption.innerHTML !== "<br>") {
                    _this2.elements.figureCaption.innerHTML = "<br>";
                }
            },
            'focusin': function focusin(e) {

                $(_this2.elements.img).removeClass('focused');
                $(_this2.elements.img).addClass('focused');

                //focusoutImage(){
                //    $(this.editor.querySelector('img')).removeClass('focused');
                //}
            },
            'focusout': function focusout(e) {
                $(_this2.elements.img).removeClass('focused');
                _this2.hideFigureMenu();
            },
            'paste': function paste(e) {
                /* Prevent pasting format text */
                e.preventDefault();
                var text = e.clipboardData.getData("text/plain");
                var url = e.clipboardData.getData("url");
                document.execCommand("insertHTML", false, text);
            }
        });

        /* Events on buttons */
        EventListener.addEventListener().on(this.elements.imageJustifyLeftBtn)['with']({
            'click': this.imageJustify.call(this).left
        });
        EventListener.addEventListener().on(this.elements.imageJustifyRightBtn)['with']({
            'click': this.imageJustify.call(this).right
        });
        EventListener.addEventListener().on(this.elements.imageJustifyCenterBtn)['with']({
            'click': this.imageJustify.call(this).center
        });
    };

    Figure.prototype.imageJustify = function imageJustify() {
        var _this = this;
        var whereCursorAt = rangy.getSelection().getBookmark();
        var _imageJustify = {
            left: left,
            right: right,
            center: center
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
    };

    Figure.prototype.showFigureMenu = function showFigureMenu() {
        var imgWidth = this.elements.img.width;
        var figureMenuWidth = 215;
        this.elements.figureMenu.style.marginLeft = (this.elements.aspectRatioPlaceholder.clientWidth - figureMenuWidth) / 2 + "px";
        $(this.elements.figureMenu).addClass('show');
    };

    Figure.prototype.hideFigureMenu = function hideFigureMenu() {
        $(this.elements.figureMenu).removeClass('show');
    };

    return Figure;
})();

exports['default'] = Figure;
module.exports = exports['default'];

},{"../../../helper/helper":1}],5:[function(require,module,exports){
/**
 * Created by chuso_000 on 24/9/2015.
 */
"use strict";

exports.__esModule = true;
exports["default"] = "\n<div class=\"editorContainer\">\n    <div class=\"editorMenu hidden\">\n        <button class=\"btn h1Btn\">H1</button>\n        <button class=\"btn h2Btn\">H2</button>\n        <button class=\"btn boldBtn\">B</button>\n        <button class=\"btn highlightBtn\"><span class=\"highlighted\"><em>A</em></span></button>\n        <button class=\"btn justifyLeftBtn\">L</button>\n        <button class=\"btn justifyCenterBtn\">C</button>\n        <button class=\"btn justifyRightBtn\">R</button>\n        <button class=\"btn linkBtn\" >Link</button>\n        <button class=\"btn unlinkBtn\" style=\"display: none;\">Unlink</button>\n        <button class=\"btn blockquoteBtn\">\"</button>\n        <!-- Linking stuff -->\n        <div class=\"linkingStuff\" style=\"visibility: hidden;\">\n            <input type=\"text\" name=\"linkAttached\" disabled/>\n            <button class=\"btn confirmLinkBtn\" disabled>OK</button>\n        </div>\n\n    </div>\n    <div class=\"editorInsertToolbar hidden\">\n        <button class=\"btn expandInsertToolbarBtn\" >+</button>\n        <div class=\"content\">\n            <button class=\"btn addImgBtn\">Img</button>\n            <div class=\"addImgOptions\" style=\"visibility: hidden;\">\n                <button class=\"btn enterImgUrlBtn\">Paste an url</button>\n                <form style=\"visibility: hidden;\"><input type=\"text\" name=\"pastedImgUrl\" style=\"display: none;\"/></form>\n                <button class=\"btn uploadImgBtn\">\n                    Upload Image\n                    <input type=\"file\" accept=\"image/*\" name=\"files[]\" data-url=\"upload/\" class=\"imageUploadInput\"/>\n                </button>\n            </div>\n\n\n        </div>\n    </div>\n\n    <div class=\"editor article\" contenteditable=\"true\">\n        <blockquote>aasdgasdjghaksjdg</blockquote>\n        <p><br/></p>\n    </div>\n\n</div>\n";
module.exports = exports["default"];

},{}],6:[function(require,module,exports){
/**
 * Created by chuso_000 on 19/9/2015.
 */

'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _helperHelper = require('../../helper/helper');

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
        var _bookmark = rangy.getSelection().getBookmark();

        var _rangy$getSelection$getRangeAt = rangy.getSelection().getRangeAt(0);

        var startContainer = _rangy$getSelection$getRangeAt.startContainer;
        var endContainer = _rangy$getSelection$getRangeAt.endContainer;

        var mainNodeTypes = "BLOCKQUOTE P H1 H2".split(' ');

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
                var textContent = elem.innerHTML || document.createTextNode("<br>");
                $(newP).html(textContent);
                $(elem).replaceWith(newP);
            });
        } else {
            // Replace those that are not of type nodeName with nodeName nodes
            elems.forEach(function (elem) {
                if (_helperHelper2['default'].node(elem).isOneOfTheseNodes(mainNodeTypes) && elem.nodeName.toUpperCase() != nodeName) {
                    var newBlockquote = document.createElement(nodeName);
                    var textContent = elem.innerHTML || document.createTextNode("<br>");
                    $(newBlockquote).html(textContent);
                    $(elem).replaceWith(newBlockquote);
                }
            });
        }

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

},{"../../helper/helper":1}],7:[function(require,module,exports){
/**
 * Created by chuso_000 on 19/9/2015.
 */

'use strict';

exports.__esModule = true;

exports['default'] = function ($editorContainer) {
    var bookmark = undefined;
    var $editor = $editorContainer.find('.editor');
    var linkingStuffDiv = $editorContainer.find('.linkingStuff')[0];
    var linkBtn = $editorContainer[0].querySelector('.linkBtn');
    var unlinkBtn = $editorContainer[0].querySelector('.unlinkBtn');
    var linkInput = $editorContainer.find('input[name="linkAttached"]')[0];
    var confirmBtn = $editorContainer[0].querySelector('button.confirmLinkBtn');

    function saveBookmarkBeforeLinking() {
        bookmark = rangy.getSelection().getBookmark($editor[0]);
        enableLinking();
        //scope.$apply();
        setTimeout(function () {
            linkInput.select();
            linkInput.focus();
        }, 0);
    }
    function confirm() {
        $editor.focus();
        if (!bookmark) return;
        var bookmarkContainerNode = bookmark.rangeBookmarks[0].containerNode;
        if ($editorContainer.has(bookmarkContainerNode).length > 0) {
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
        linkingStuffDiv.style.visibility = "visible";
        linkInput.removeAttribute('disabled');
        confirmBtn.removeAttribute('disabled');
    }
    function disableLinking() {
        linkingStuffDiv.style.visibility = "hidden";
        linkInput.setAttribute('disabled', 'disabled');
        confirmBtn.setAttribute('disabled', 'disabled');
    }
    function unlink() {
        document.execCommand('unlink');
        enableAddLink();
    }

    /* When selection does NOT contain a link, show the linkBtn and hide the unlinkBtn */
    function enableAddLink() {
        linkBtn.style.display = "inline-block";
        unlinkBtn.style.display = "none";
    }
    /* When selection contains a link, hide the linkBtn and show the unlinkBtn */
    function disableAddLink() {
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

},{}],8:[function(require,module,exports){
/**
 * Created by chuso_000 on 14/9/2015.
 */

'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _EditorEditorJs = require('./Editor/Editor.js');

var _EditorEditorJs2 = _interopRequireDefault(_EditorEditorJs);

rangy.init();
var editor = new _EditorEditorJs2['default']();
$('.editor').append(editor.editorContainer);

},{"./Editor/Editor.js":2}],9:[function(require,module,exports){
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

},{}]},{},[8]);
