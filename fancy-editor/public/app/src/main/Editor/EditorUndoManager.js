/**
 * Created by chuso_000 on 28/9/2015.
 */
import UndoManager from 'undo-manager';
import hp from '../../helper/helper';
import Figure from './Figure/Figure.js';


export default class EditorUndoManager{
    constructor(editor){
        this.paraUndoManager = new UndoManager();
        this.editor = editor;
        this.editorStates = {};
        this.index = 0;
        this.paraSerializer = new Serializer(this.editor);
        //this.saveEditorState();
    }

    saveEditorState(){
        //let id = this.generateId();
        console.log('Saved');
        let id = this.index;
        let editorState = {
            innerHTML : this.editor.innerHTML,
        };
        //console.log(rangy.getSelection);

        if (document.getSelection().rangeCount)
            editorState.storedRange = this.paraSerializer.serializeRange(document.getSelection().getRangeAt(0));
        else{
            let defaultRange = document.createRange();
            defaultRange.setStart(this.editor.firstElementChild,0);
            //console.log(defaultRange);
            editorState.storedRange = this.paraSerializer.serializeRange(defaultRange);
        }

        //console.log(editorState);

        this.addEditorState(id, editorState);

        // make undo-able
        this.paraUndoManager.add({
            undo: ()=> {
                this.removeEditorState(id)
            },
            redo: ()=> {
                this.addEditorState(id, editorState);
            }
        });
    }

    addEditorState(id, editorState){
        this.editorStates[id] = editorState;
        this.index++;
    }
    removeEditorState(id){
        delete this.editorStates[id];
        this.index--;
    }
    hasUndo(){
        return this.paraUndoManager.hasUndo();
    }
    hasRedo(){
        return this.paraUndoManager.hasRedo();
    }
    undo(){
        if (!this.hasUndo()) return;
        //this.saveEditorState();
        //console.log(this.editorStates);

        this.paraUndoManager.undo();
        // Clear time out when undo
        this.restoreEditorState();
    }
    redo(){
        if (!this.hasRedo()) return;
        this.paraUndoManager.redo();
        //console.log(this.editorStates);
        // Clear time out when undo
        this.restoreEditorState();
    }

    restoreEditorState(){
        if (Object.getOwnPropertyNames(this.editorStates).length){
            let {innerHTML, storedRange} = this.editorStates[Object.getOwnPropertyNames(this.editorStates).length-1];
            //console.log(storedRange);

            if (this.editor) {
                EventListener.saveEventListeners(this.editor);
                //console.log(EventListener.savedEventListeners);
                this.editor.innerHTML = innerHTML;
                EventListener.restoreEventListeners(this.editor);
                /* !! You need to have a custom figure restoring function here !! */
                // Step 1: Find figure div and remove all event listeners from every child in it, including itself
                _.remove(EventListener.listeners, (listener)=> {
                    return (/figure/i.test(listener.node.className) || $(listener.node).parents('.figure').length);
                });

                // Step 2: Initialize them div
                $(this.editor).find('.figure').each(function(){
                    let nF = new Figure();
                    nF.reinitialize(this);
                });
            }


            if (storedRange) {
                let nR = this.paraSerializer.deserializeRange(storedRange);
                //console.log(nR);
                //console.log(storedRange);
                document.getSelection().removeAllRanges();
                //console.log(nR);
                document.getSelection().addRange(nR);

            }
            //else this.editor.focus();


        }
    }


    generateId(){
        let generatedNumber = Math.round(Math.random() * 10000000);
        if (_.indexOf(Object.getOwnPropertyNames(this.editorStates), generatedNumber) == -1)
            return generatedNumber;
        else this.generateId();
    }

}