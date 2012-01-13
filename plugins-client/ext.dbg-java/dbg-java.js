/**
 * node debugger Module for the Cloud9 IDE
 *
 * @copyright 2010, Ajax.org B.V.
 * @license GPLv3 <http://www.gnu.org/licenses/gpl.txt>
 */

/*global mdlDbgSources mdlDbgBreakpoints mdlDbgStack ide */

define(function(require, exports, module) {

var ide = require("core/ide");
var oop = require("ace/lib/oop");
var v8DebugClient = require("ext/dbg-node/dbg-node");
var extDebugger = require("ext/debugger/debugger");

var JavaV8DebugClient = function() {
    this.runner = "java";
};

oop.inherits(JavaV8DebugClient, v8DebugClient);

(function() {

    this.$handleDebugBreak = function(remoteBreakpoints) {
        if (!this.$v8dbg)
            return;
        this.continueScript();
    };

    this.changeLive = function(scriptId, newSource, previewOnly, callback) {
        var _self = this;

        var node = mdlDbgSources.queryNode("//file[@scriptid='" + scriptId + "']");
        ide.addEventListener("projectbuilt", function projectBuilt(e) {
            var scriptName = node.getAttribute("scriptname");
            if (!scriptName || scriptName === "anonymous")
                return;
            if (e.errors.length > 0)
                return console.error("Project built with errors !");

            var replaceScript;
            if (e.srcPostfix) {
                replaceScript = scriptName.replace(e.srcPath, e.binPath)
                    .replace(new RegExp("\." + (e.srcPostfix) + "$") , "." + (e.binPostfix));
            } else {
                replaceScript = scriptName;
            }
            dbg.redefine(scriptName, replaceScript, function (e) {
               console.log("redefined: ", e);
               callback(e);
            });

            ide.removeEventListener("projectbuilt", projectBuilt);
        });
        ide.dispatchEvent("buildproject");
    };

}).call(JavaV8DebugClient.prototype);

JavaV8DebugClient.handlesRunner = function(runner) {
    return /java/.test(runner);
};

extDebugger.registerDebugHandler(JavaV8DebugClient);

});
