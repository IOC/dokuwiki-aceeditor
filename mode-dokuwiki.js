/* AceEditor plugin for Dokuwiki
 * Copyright © 2011 Institut Obert de Catalunya
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * Ths program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

define("mode-dokuwiki", function(require, exports, module) {

var oop = require("pilot/oop");
var TextMode = require("ace/mode/text").Mode;
var Tokenizer = require("ace/tokenizer").Tokenizer;
var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

var DokuwikiHighlightRules = function() {

    var that = this;
    this.$rules = {};

    var rule = function(state, token, regex, next) {
        var rule = {token: token, regex: regex};
        if (next) {
            rule.next = next;
        }
        that.$rules[state] = that.$rules[state] || [];
        that.$rules[state].push(rule);
    }

    var block = function(token, open, close) {
        rule("start", token, open, token);
        rule(token, token, ".*?" + close, "start");
        rule(token, token, ".+$");
    };

    var inline = function(states, token, regex) {
        var i;
        for (i = 0; i < states.length; i++) {
            rule(states[i], token, regex);
        };
    }

    var format = function(states, token, open, close) {
        var i;
        for (i = 0; i < states.length; i++) {
            rule(states[i], token, open, states[i] + "-" + token);
            rule(states[i] + "-" + token, token, ".*?" + close, states[i]);
            rule(states[i] + "-" + token, token, ".+$");
        };
    };

    rule("start", "listblock", "^(?: {2,}|\t{1,})[\-\\*]"); // sort 10
    rule("start", "preformatted", "^(?:  |\t).+$"); // sort 20
    rule("start", "notoc", "~~NOTOC~~"); // sort 30
    rule("start", "nocache", "~~NOCACHE~~"); // sort 40
    rule("start", "header", "[ \t]*={2,}.+={2,}[ \t]*$"); // sort 50
    rule("start", "table", "^[\\||\\^](?=.*[\\||\\^][ \t]*$)", "table"); // sort 60
    rule("table", "table", "[\\|\\^][ \t]*$", "start");
    rule("table", "table", "[\\|\\^]");
    rule("table", "table", ":::(?=[ \t]*[\\|\\^])");
    format(["start", "table"], "strong", "\\*\\*", "\\*\\*"); // sort 70
    format(["start", "table"], "emphasis", "//", "//"); // sort 80
    format(["start", "table"], "underline", "__", "__"); // sort 90
    format(["start", "table"], "monospace", "''", "''"); // sort 100
    format(["start", "table"], "subscript", "<sub>", "</sub>"); // sort 110
    format(["start", "table"], "superscript", "<sup>", "</sup>"); // sort 120
    format(["start", "table"], "deleted", "<del>", "</del>"); // sort 130
    inline(["start", "table"], "linebreak", "\\\\"); // sort 140
    format(["start", "table"], "footnote", "\\(\\(", "\\)\\)"); // sort 150
    rule("start", "hr", "^[ \t]*-{4,}[ \t]*$") // sort 160
    format(["start", "table"], "unformatted", "<nowikI>", "</nowikI>"); // sort 170
    format(["start", "table"], "unformattedalt", "%%", "%%"); // sort 170
    format(["start", "table"], "php", "<php>", "</php>"); // sort 180
    format(["start", "table"], "html", "<html>", "</html>"); // sort 190
    format(["start", "table"], "code", "<code.*?>", "</code>"); // sort 200
    format(["start", "table"], "file", "<file.*?>", "</file>"); // sort 210
    rule("start", "quote", "^>{1,}"); // sort 220
    inline(["start", "table"], "internallink", "\\[\\[.+?\\]\\]"); // sort 300
    inline(["start", "table"], "media", "\\{\\{.+?\\}\\}"); // sort 320
    inline(["start", "table"], "externallink", "(?:(?:https?|telnet|gopher|wais|ftp|ed2k|irc)://[\\w/\\#~:.?+=&%@!\\-.:?\\-;,]+?(?=[.:?\\-;,]*[^\\w/\\#~:.?+=&%@!\\-.:?\\-;,]|$)|(?:www|ftp)\\.[\\w.:?\\-;,]+?\\.[\\w.:?\\-;,]+?[\\w/\\#~:.?+=&%@!\\-.:?\\-;,]+?(?=[.:?\\-;,]*[^\\w/\\#~:.?+=&%@!\\-.:?\\-;,]|$))"); // sort 33
    inline(["start", "table"], "email", "<[0-9a-zA-Z!#$%&'*+\/=?^_`{|}~-]+(?:\\.[0-9a-zA-Z!#$%&'*+\\/=?^_`{|}~-]+)*@(?:[0-9a-zA-Z][0-9a-zA-Z-]*\\.)+(?:[a-zA-Z]{2,4}|museum|travel)>"); // sort 340

};

oop.inherits(DokuwikiHighlightRules, TextHighlightRules);

var Mode = function(highlight) {
    this.$tokenizer = new Tokenizer(highlight ?
                                    new DokuwikiHighlightRules().getRules():
                                    new TextHighlightRules().getRules());

    this.$nextLineIndentRules = new RegExp("^(?:" + ([
        "(?: {2,}|\t{1,})[\\*\\-][ \t]*", // listblock
        "(?:  |\t)(?=.)", // preformatted
        "[\\||\\^][ \t]*(?=.*[\\||\\^][ \t]*$)", // table
        ">{1,}[ \t]*", // quote
    ]).join("|") + ")");
};
oop.inherits(Mode, TextMode);

(function() {

    this.getNextLineIndent = function(state, line, tab) {
        var match = this.$nextLineIndentRules.exec(line);
        if (match) {
            return match[0];
        }
        return "";
    }
}).call(TextMode.prototype);

exports.Mode = Mode;
});
