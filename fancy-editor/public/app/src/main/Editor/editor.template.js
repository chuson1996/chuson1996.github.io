/**
 * Created by chuso_000 on 24/9/2015.
 */
export default `
<div class="editorContainer">
    <div class="editorMenu hidden">
        <button class="btn h1Btn">H1</button>
        <button class="btn h2Btn">H2</button>
        <button class="btn boldBtn">B</button>
        <button class="btn highlightBtn"><span class="highlighted"><em>A</em></span></button>
        <button class="btn justifyLeftBtn">L</button>
        <button class="btn justifyCenterBtn">C</button>
        <button class="btn justifyRightBtn">R</button>
        <button class="btn linkBtn" >Link</button>
        <button class="btn unlinkBtn" style="display: none;">Unlink</button>
        <button class="btn blockquoteBtn">"</button>
        <!-- Linking stuff -->
        <div class="linkingStuff" style="visibility: hidden;">
            <input type="text" name="linkAttached" disabled/>
            <button class="btn confirmLinkBtn" disabled>OK</button>
        </div>

    </div>
    <div class="editorInsertToolbar hidden">
        <button class="btn expandInsertToolbarBtn" >+</button>
        <div class="content">
            <button class="btn addImgBtn">Img</button>
            <div class="addImgOptions" style="visibility: hidden;">
                <button class="btn enterImgUrlBtn">Paste an url</button>
                <form style="visibility: hidden;"><input type="text" name="pastedImgUrl" style="display: none;"/></form>
                <button class="btn uploadImgBtn">
                    Upload Image
                    <input type="file" accept="image/*" name="files[]" data-url="upload/" class="imageUploadInput"/>
                </button>
            </div>


        </div>
    </div>

    <div class="editor article" contenteditable="true">
        <blockquote>aasdgasdjghaksjdg</blockquote>
        <p><br/></p>
    </div>

</div>
`;