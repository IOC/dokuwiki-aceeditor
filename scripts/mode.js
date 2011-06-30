/* Ace editor plugin for Dokuwiki
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

define(function(require) {
    return function(spec) {
        var that = {};

        var tokenizer_rules = [];
        var containers = ["start", "table"];
        var indent_regex = new RegExp("^(?:" + ([
            "(?: {2,}|\t{1,})[\\*\\-][ \t]*", // listblock
            "(?:  |\t)(?=.)", // preformatted
            "[\\||\\^][ \t]*(?=.*[\\||\\^][ \t]*$)", // table
            ">{1,}[ \t]*", // quote
        ]).join("|") + ")");

        var add_rule = function(state, token, regex, next) {
            var rule = {token: token, regex: regex};
            if (next) {
                rule.next = next;
            }
            tokenizer_rules[state] = tokenizer_rules[state] || [];
            tokenizer_rules[state].push(rule);
        }

        var create_rules = function(prefix, names) {
            var i, mode, state;
            names.sort(function (a, b) {
                var sort_a = modes[a] ? modes[a].sort : 1000;
                var sort_b = modes[b] ? modes[b].sort : 1000;
                return sort_a - sort_b;
            });
            for (i = 0; i < names.length; i += 1) {
                if (mode = modes[names[i]]) {
                    state = prefix + "-" + names[i];
                    if (mode.special) {
                        add_rule(prefix, names[i], mode.special);
                    }
                    if (mode.entry && mode.exit) {
                        add_rule(prefix, names[i], mode.entry, state);
                        add_rule(state, names[i], mode.exit, prefix);
                        if (mode.pattern) {
                            add_rule(state, names[i], mode.pattern);
                        }
                        if (mode.modes) {
                            create_rules(state, mode.modes);
                        }
                    }
                }
            }
        };

        var init = function() {
            var name, names = [];
            if (spec.latex) {
                for (name in latex_modes) {
                    modes[name] = latex_modes[name];
                }
            }
            for (name in modes) {
                names.push(name);
            }
            create_rules("start", names);
        };

        that.next_line_indent = function(line) {
            var match = indent_regex.exec(line);
            return match ? match[0] : "";
        };

        that.tokenizer_rules = function() {
            return tokenizer_rules;
        };

        var container_modes = ["listblock", "table", "quote", "hr"];
        var formatting_modes = ["strong", "emphasis", "underline", "monospace",
                                "subscript", "superscript", "deleted", "footnote",
                                "internallink", "media", "externallink", "linebreak",
                                "emaillink", "notoc", "nocache",
                                "preformatted", "code", "file", "php", "html",
                                "htmlblock", "phpblock", "unformatted", "unformattedalt",
                                "latex-latex", "latex-ddollar", "latex-dollar",
                                "latex-displaymath", "latex-equation",
                                "latex-equationstar", "latex-eqnarray",
                                "latex-eqnarraystar"];

        var modes = {
            "listblock": {
                sort: 10,
                special: "^(?: {2,}|\t{1,})[\-\\*]",
                modes: formatting_modes
            },
            "preformatted": {
                sort: 20,
                special: "^(?:  |\t).+$"
            },
            "notoc" : {
                sort: 30,
                special: "~~NOTOC~~"
            },
            "nocache" : {
                sort: 40,
                special: "~~NOCACHE~~"
            },
            "header": {
                sort: 50,
                special: "[ \t]*={2,}.+={2,}[ \t]*$"
            },
            "table": {
                sort: 60,
                entry : "^[\\||\\^](?=.*[\\||\\^][ \t]*$)",
                exit: "[\\|\\^][ \t]*$",
                pattern: "[\\|\\^]|:::(?=[ \t]*[\\|\\^])",
                modes: formatting_modes
            },
            "strong": {
                sort: 70,
                entry: "\\*\\*",
                exit: "\\*\\*",
                pattern: "."
            },
            "emphasis": {
                sort: 80,
                entry: "//",
                exit: "//",
                pattern: "."
            },
            "underline": {
                sort: 90,
                entry: "__",
                exit: "__",
                pattern: "."
            },
            "monospace": {
                sort: 100,
                entry: "''",
                exit: "''",
                pattern: "."
            },
            "subscript": {
                sort: 110,
                entry: "<sub>",
                exit: "</sub>",
                pattern: "."
            },
            "superscript": {
                sort: 120,
                entry: "<sup>",
                exit: "</sup>",
                pattern: "."
            },
            "deleted": {
                sort: 130,
                entry: "<del>",
                exit: "</del>",
                pattern: "."
            },
            "linebreak": {
                sort: 140,
                special: "\\\\\\\\"
            },
            "footnote": {
                sort: 150,
                entry: "\\(\\(",
                exit: "\\)\\)",
                pattern: "."
            },
            "hr": {
                sort: 160,
                special: "^[ \t]*-{4,}[ \t]*$",
            },
            "unformatted": {
                sort: 170,
                entry: "<nowiki>",
                exit: "</nowiki>",
                pattern: "."
            },
            "unformattedalt": {
                sort: 170,
                entry: "%%",
                exit: "%%",
                pattern: "."
            },
            "php": {
                sort: 180,
                entry: "<php>",
                exit: "</php>",
                pattern: "."
            },
            "phpblock": {
                sort: 180,
                entry: "<PHP>",
                exit: "</PHP>",
                pattern: "."
            },
            "html": {
                sort: 190,
                entry: "<html>",
                exit: "</html>",
                pattern: "."
            },
            "htmlblock": {
                sort: 190,
                entry: "<HTML>",
                exit: "</HTML>",
                pattern: "."
            },
            "code": {
                sort: 200,
                entry: "<code.*?>",
                exit: "</code>",
                pattern: "."
            },
            "file": {
                sort: 210,
                entry: "<file.*?>",
                exit: "</file>",
                pattern: "."
            },
            "quote": {
                sort: 220,
                special: "^>{1,2}",
                modes: formatting_modes
            },
            "internallink": {
                sort: 300,
                special: "\\[\\[.+?\\]\\]"
            },
            "media": {
                sort: 320,
                special: "\\{\\{.+?\\}\\}",
            },
            "externallink": {
                sort: 330,
                special: ("(?:(?:https?|telnet|gopher|wais|ftp|ed2k|irc)://" +
                          "[\\w/\\#~:.?+=&%@!\\-.:?\\-;,]+?(?=[.:?\\-;,]*" +
                          "[^\\w/\\#~:.?+=&%@!\\-.:?\\-;,]|$)|(?:www|ftp)\\." +
                          "[\\w.:?\\-;,]+?\\.[\\w.:?\\-;,]+?" +
                          "[\\w/\\#~:.?+=&%@!\\-.:?\\-;,]+?" +
                          "(?=[.:?\\-;,]*[^\\w/\\#~:.?+=&%@!\\-.:?\\-;,]|$))")
            },
            "emaillink": {
                sort: 340,
                special: ("<[0-9a-zA-Z!#$%&'*+\/=?^_`{|}~-]+" +
                          "(?:\\.[0-9a-zA-Z!#$%&'*+\\/=?^_`{|}~-]+)*" +
                          "@(?:[0-9a-zA-Z][0-9a-zA-Z-]*\\.)+" +
                          "(?:[a-zA-Z]{2,4}|museum|travel)>")
            },
        };

        var latex_modes = {
            "latex-latex": {
                sort: 100,
                entry: "<latex>",
                exit: "</latex>",
                pattern: "."
            },
            "latex-ddollar": {
                sort: 300,
                entry: "\\$\\$",
                exit: "\\$\\$",
                pattern: "."
            },
            "latex-dollar": {
                sort: 405,
                entry: "\\$",
                exit: "\\$",
                pattern: "."
            },
            "latex-displaymath": {
                sort: 405,
                entry: "\\\\begin\\{displaymath\\}",
                exit: "\\\\end\\{displaymath\\}",
                pattern: "."
            },
            "latex-equation": {
                sort: 405,
                entry: "\\\\begin\\{equation\\}",
                exit: "\\\\end\\{equation\\}",
                pattern: "."
            },
            "latex-equationstar": {
                sort: 405,
                entry: "\\\\begin\\{equation\\*\\}",
                exit: "\\\\end\\{equation\\*\\}",
                pattern: "."
            },
            "latex-eqnarray": {
                sort: 405,
                entry: "\\\\begin\\{eqnarray\\}",
                exit: "\\\\end\\{eqnarray\\}",
                pattern: "."
            },
            "latex-eqnarraystar": {
                sort: 405,
                entry: "\\\\begin\\{eqnarray\\*\\}",
                exit: "\\\\end\\{eqnarray\\*\\}",
                pattern: "."
            }
        };

        init();

        return that;
    };
});
