var editor = document.getElementById("editor");

var serializer = new Serializer(editor);

var savedRange;

/* Bind events for button  */
document.getElementById("saveRangeBtn").addEventListener('click',function(){
    savedRange = serializer.serializeRange(document.getSelection().getRangeAt(0));
    if (savedRange) document.getElementById("restoreRangeBtn").removeAttribute('disabled');
    console.log('savedRange: ', savedRange);
});
document.getElementById("overrideHTMLBtn").addEventListener('click', function(){
    overrideHTML();
});
document.getElementById("restoreRangeBtn").addEventListener('click', function(){
    /* Restore selection range */
    document.getSelection().removeAllRanges();
    document.getSelection().addRange(serializer.deserializeRange(savedRange));
});



/* After you've overriden the DOM, deserialize saved range and rebind event listeners */


function overrideHTML(){
    // Method 1    
    // editor.innerHTML = editor.innerHTML;
    var execCode = document.getElementById("execCode");
    var clone = editor.innerHTML;
    editor.innerHTML = "<h3>Its children are now kidnapped by the evil witch! <span style=\"color: darkorange;font-size: 36px;\">3s</span> to welcome the new born!</h3>";
    execCode.innerHTML='var clone = editor.innerHTML; editor.innerHTML = "";';
    setTimeout(function(){
        execCode.innerHTML='editor.innerHTML = clone;';
        editor.innerHTML = clone;
    },3000);
  
  // Method 2 using JQuery.clone()
  // var ow = $(editor).clone();
  // $(editor).empty();
  // $(editor).append(ow.children());
}