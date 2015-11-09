/**
 * Created by chuso_000 on 24/9/2015.
 */
export default `
<div class="editorContainer">
    <div class="editor editorPlaceholder"></div>
    <div class="editorMenu hidden"></div>

    <div class="editorInlineTooltip hidden">
        <button class="btn expandInsertToolbarBtn" >+</button>
        <div class="content">
            <button class="btn addImgBtn">Img</button>
            <div class="addImgOptions">
                <button class="btn pasteBtn" style="width:100px">Paste an url</button>
                <form><input type="text" name="pastedImgUrl"/></form>
            </div>


        </div>
    </div>

    <div class="menu figureMenu"></div>
    <div class="editor article" editor contenteditable="true" data-placeholder="Enter text...">
        <p><br/></p>
    </div>

</div>
`;