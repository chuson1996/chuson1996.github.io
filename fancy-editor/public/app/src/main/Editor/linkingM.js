/**
 * Created by chuso_000 on 19/9/2015.
 */


export default (function ($editorContainer) {
    let bookmark;
    let $editor = $editorContainer.find('.editor');
    let linkingStuffDiv = $editorContainer.find('.linkingStuff')[0];
    let linkBtn = $editorContainer[0].querySelector('.linkBtn');
    let unlinkBtn = $editorContainer[0].querySelector('.unlinkBtn');
    let linkInput = $editorContainer.find('input[name="linkAttached"]')[0];
    let confirmBtn = $editorContainer[0].querySelector('button.confirmLinkBtn');

    function saveBookmarkBeforeLinking(){
        bookmark = rangy.getSelection().getBookmark($editor[0]);
        enableLinking();
        //scope.$apply();
        setTimeout(()=>{
            linkInput.select();
            linkInput.focus();
        },0);

    }
    function confirm(){
        $editor.focus();
        if (!bookmark) return;
        var bookmarkContainerNode = bookmark.rangeBookmarks[0].containerNode;
        if ($editorContainer.has(bookmarkContainerNode).length > 0){
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
        linkingStuffDiv.style.visibility = "visible";
        linkInput.removeAttribute('disabled');
        confirmBtn.removeAttribute('disabled');
    }
    function disableLinking(){
        linkingStuffDiv.style.visibility = "hidden";
        linkInput.setAttribute('disabled','disabled');
        confirmBtn.setAttribute('disabled','disabled');
    }
    function unlink(){
        document.execCommand('unlink');
        enableAddLink();
    }

    /* When selection does NOT contain a link, show the linkBtn and hide the unlinkBtn */
    function enableAddLink(){
        linkBtn.style.display = "inline-block";
        unlinkBtn.style.display = "none";
    }
    /* When selection contains a link, hide the linkBtn and show the unlinkBtn */
    function disableAddLink(){
        linkBtn.style.display = "none";
        unlinkBtn.style.display = "inline-block";
    }
    return {
        saveBookmarkBeforeLinking: saveBookmarkBeforeLinking,
        confirm: confirm,
        //enableAddLink: enableAddLink,
        enableLinking,
        disableLinking,
        enableAddLink,
        disableAddLink,
        unlink
    }
});

