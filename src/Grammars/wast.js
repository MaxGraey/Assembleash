ace.define(function (acequire, exports, module) {
	"use strict";

	var oop = acequire("ace/lib/oop");
	var TextMode = acequire("ace/mode/text").Mode;
	var WastHighlightRules = acequire("ace/mode/wast_highlight_rules").WastHighlightRules;

	var Mode = function () {
		this.HighlightRules = WastHighlightRules;
		this.$behaviour = this.$defaultBehaviour;
	};

	oop.inherits(Mode, TextMode);

	(function() {
		//this.lineCommentStart = ";";
		this.$id = "ace/mode/wast";
	}).call(Mode.prototype);

	exports.Mode = Mode;
});
