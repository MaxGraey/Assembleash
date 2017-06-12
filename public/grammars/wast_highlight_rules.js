ace.define('ace/mode/wast_highlight_rules', function (acequire, exports, module) {
    "use strict";

    var oop = acequire("ace/lib/oop");
    var TextHighlightRules = acequire("ace/mode/text_highlight_rules").TextHighlightRules;

    var WastHighlightRules = function () {
        var keywords = ["global|local|type|memory|module|table|import|export|param|offset|start|code",
                        "data|segment|element|invoke|label"].join("|");

        var types    = "i32|i64|f32|f64|anyfunc|func|void";
        var operator = [
            "const|if|else|loop|block|br|br_if|br_table|drop|select|end|return|call|call_indirect|call_import",
            "current_memory|grow_memory|get_local|set_local|tee_local|get_global|set_global",
            "load|load8_s|load8_u|load16_s|load16_u|load32_s|load32_u|store|store8|store16|store32",
            "eqz|eq|ne|lt_s|lt_u|lt|gt_s|gt_u|gt|le_s|le_u|le|ge_s|ge_u|ge|clz|ctz|popcnt|add|sub",
            "mul|div_s|div_u|div|rem_s|rem_u|and|xor|or|shl|shr_s|shr_u|rotl|rotr|abs|neg|ceil|floor",
            "trunc|nearest|sqrt|min|max|copysign|wrap|trunc_s|trunc_u|extend_s|extend_u|convert_s",
            "convert_u|demote|promote|reinterpret|failure|switch|case|tableswitch|unreachable|nop|has_feature",
            "assert_invalid|assert_trap|assert_return_nan|assert_return"
        ].join("|");

        var keywordMapper = this.createKeywordMapper({
            "keyword.control":  keywords,
            "keyword.operator": operator,
            "support.function": types
        }, "identifier", true);

        this.$rules = {
            "start": [{
                token: "constant.numeric", // hex, float, octal, binary
                regex: /\\b(((\\+|-)?0(x|X)[0-9a-fA-F]+\\.?[0-9a-fA-F]*((p|P)(\\+|-)?[0-9]+)?)|(([0-9]+\\.?[0-9]*)|(\\.[0-9]+))((e|E)(\\+|-)?[0-9]+)?)\\b/
            }, {
                token: "constant.numeric",
                regex: '\\b(\\+|-)?(?i:infinity|inf|nan)\\b'
            }, {
                token: keywordMapper,
                regex: "[a-zA-Z_$][a-zA-Z_0-9.]*\\b"
            }, {
                token: "lparen",
                regex: "[[({]"
            }, {
                token: "rparen",
                regex: "[\\])}]"
            }, {
                token: "text",
                regex: "\\s+"
            }]
        };
    };

    oop.inherits(WastHighlightRules, TextHighlightRules);
    exports.WastHighlightRules = WastHighlightRules;
});
