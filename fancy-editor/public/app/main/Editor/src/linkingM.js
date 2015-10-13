/**
 * Created by chuso_000 on 19/9/2015.
 */


export default (function (editorContainer) {
    let bookmark;
    let $editor = $(editorContainer).find('.editor');
    //let linkingStuffDiv = $(editorContainer).find('.linkingStuff')[0];
    //let linkBtn = editorContainer.querySelector('.linkBtn');
    //let unlinkBtn = editorContainer.querySelector('.unlinkBtn');
    //let linkInput = $(editorContainer).find('input[name="linkAttached"]')[0];
    //let confirmBtn = editorContainer.querySelector('button.confirmLinkBtn');

    function saveBookmarkBeforeLinking(){
        let linkInput = $(editorContainer).find('input[name="linkAttached"]')[0];
        bookmark = rangy.getSelection().getBookmark($editor[0]);
        enableLinking();
        //scope.$apply();
        setTimeout(()=>{
            linkInput.select();
            linkInput.focus();
        },0);

    }
    function confirm(){
        let linkInput = $(editorContainer).find('input[name="linkAttached"]')[0];
        $editor.focus();
        if (!bookmark) return;
        var bookmarkContainerNode = bookmark.rangeBookmarks[0].containerNode;
        if ($(editorContainer).has(bookmarkContainerNode).length > 0){
            if (bookmark){
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
    function enableLinking(){
        let linkingStuffDiv = $(editorContainer).find('.linkingStuff')[0];
        let confirmBtn = editorContainer.querySelector('button.confirmLinkBtn');
        let linkInput = $(editorContainer).find('input[name="linkAttached"]')[0];
        //linkingStuffDiv.style.visibility = "hidden";
        //linkingStuffDiv.style.visibility = "visible";
        $(linkingStuffDiv).addClass('show');
        linkInput.removeAttribute('disabled');
        confirmBtn.removeAttribute('disabled');
    }
    function disableLinking(){
        let linkingStuffDiv = $(editorContainer).find('.linkingStuff')[0];
        let linkBtn = editorContainer.querySelector('.linkBtn');
        let confirmBtn = editorContainer.querySelector('button.confirmLinkBtn');
        let linkInput = $(editorContainer).find('input[name="linkAttached"]')[0];
        //linkingStuffDiv.style.visibility = "hidden";
        $(linkingStuffDiv).removeClass('show');
        linkInput.setAttribute('disabled','disabled');
        confirmBtn.setAttribute('disabled','disabled');
    }
    function unlink(){
        document.execCommand('unlink');
        enableAddLink();
    }

    /* When selection does NOT contain a link, show the linkBtn and hide the unlinkBtn */
    function enableAddLink(){
        let linkBtn = editorContainer.querySelector('.linkBtn');
        let unlinkBtn = editorContainer.querySelector('.unlinkBtn');
        linkBtn.style.display = "inline-block";
        unlinkBtn.style.display = "none";
    }
    /* When selection contains a link, hide the linkBtn and show the unlinkBtn */
    function disableAddLink(){
        let linkBtn = editorContainer.querySelector('.linkBtn');
        let unlinkBtn = editorContainer.querySelector('.unlinkBtn');
        linkBtn.style.display = "none";
        unlinkBtn.style.display = "inline-block";
    }
    return {
        saveBookmarkBeforeLinking,
        confirm,
        //enableAddLink: enableAddLink,
        enableLinking,
        disableLinking,
        enableAddLink,
        disableAddLink,
        unlink
    }
});

