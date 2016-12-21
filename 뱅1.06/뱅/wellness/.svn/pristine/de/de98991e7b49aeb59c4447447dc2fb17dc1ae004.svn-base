
(function(window, undefined) {

window.class_to_global = true;
window.debug_enabled = true;
window.debug_type = "console";

var 
thisFileName = "mcore.extends.js",
importFiles = [
    "libs/jquery/jquery.js",
    "libs/jquery/jquery.easing.1.3.js",
    "libs/instance/instance.ui.js",
    "ui/model.js",
    "ui/fit.manager.js",
    "ui/view.js",
    "ui/controller.js",
    "ui/common.js"
];

M.ScriptLoader.writeScript( importFiles, M.ScriptLoader.scriptPath(thisFileName), function( path, error ) {
  M.tool.log( "error", error );
});

window.onerror = function(msg, url, line, col, error) {
   // Note that col & error are new to the HTML 5 spec and may not be 
   // supported in every browser.  It worked for me in Chrome.
   var extra = !col ? '' : '\ncolumn: ' + col;
   extra += !error ? '' : '\nerror: ' + error;

   // You can view the information in an alert to see things working like this:
   M.tool.log("error", "Error: " + msg + "\nurl: " + url + "\nline: " + line + extra);
};

})(window);