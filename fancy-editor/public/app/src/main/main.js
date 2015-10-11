/**
 * Created by chuso_000 on 14/9/2015.
 */





import Editor from './Editor/Editor.js';



rangy.init();
let editor = new Editor();
$('.editor').append(editor.elements.editorContainer);
