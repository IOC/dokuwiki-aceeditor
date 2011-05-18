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

define(function() {
    var ace, container, doku, mode, toggle;
    var preview_marker, preview_timer;

    var disable = function() {
        var selection = ace.get_selection();

        doku.enable();
        container.hide();
        toggle.off();

        doku.set_value(ace.get_value());

        doku.set_selection(selection.start, selection.end);
        doku.set_cookie("aceeditor", "off");
    };

    var enable = function() {
        var selection = doku.get_selection();

        doku.disable();
        container.set_height(doku.inner_height());
        container.show();
        toggle.on();

        ace.set_value(doku.get_value());
        ace.resize();
        ace.focus();

        ace.set_selection(selection.start, selection.end);
        doku.set_cookie("aceeditor", "on");
    };

    var init = function() {
        // Setup elements
        doku = require("doku")({
            get_selection: function() {
                return ace.get_selection();
            },
            get_text: function(start, end) {
                return ace.get_value().substring(start, end);
            },
            get_value: function() {
                return ace.get_value();
            },
            paste_text: function(start, end, text) {
                ace.replace(start, end, text);
                ace.set_selection(start, end);
                ace.focus();
            },
            on_resize: function() {
                container.on_resize();
                ace.resize();
            },
            set_selection: function(start, end) {
                ace.set_selection(start, end);
                ace.focus();
            },
            set_wrap: function(value) {
                ace.set_wrap_mode(value);
                ace.focus();
            },
            size_ctl: function(value) {
                container.incr_height(value);
                ace.resize();
                ace.focus();
            }
        });

        container = require("container")();

        // Setup toggle
        toggle = require("toggle")({
            on_enable: enable,
            on_disable: disable
        });

        mode = require("mode")({
            latex: JSINFO.plugin_aceeditor.latex
        });

        // Initialize Ace
        ace = require("ace")({
            colortheme: JSINFO.plugin_aceeditor.colortheme,
            element: container.element(),
            next_line_indent: mode.next_line_indent,
            on_cursor_change: function() {
                preview_trigger();
            },
            on_document_change: function() {
                doku.text_changed();
                preview_trigger();
            },
            readonly: doku.get_readonly(),
            tokenizer_rules: mode.tokenizer_rules(),
            wraplimit: JSINFO.plugin_aceeditor.wraplimit,
            wrapmode: doku.get_wrap()
        });


        // LaTeX preview

        var preview_show = function() {
            var pos = ace.get_cursor_position();
            var token = token_at_pos(pos);
            preview_timer = null;
            preview_hide();

            if (token && /^latex-.*$/.test(token.type)) {
                preview_latex(token);
            }
        };

        var preview_latex = function(token) {
            var url = DOKU_BASE + "lib/plugins/aceeditor/preview.php";
            jQuery.getJSON(url, { text: token.value }, function (data) {
                var renderer = function(spec) {
                    var top = (spec.top > spec.screen_height - spec.bottom ?
                               spec.top - data.height - 12 : spec.bottom);
                    return ('<div class="ace_preview" style="padding:5px; '
                            + 'position:absolute; left:' + spec.left + 'px; top:' + top  + 'px; '
                            + 'width:' + data.width  + 'px; height:' + data.height + 'px;">'
                            + '<img src="' + encodeURI(data.url) + '"/></div>');
                };
                if (data && !preview_timer) {
                    preview_marker = ace.add_marker({
                        start_row: token.start_row,
                        start_column: token.start_column,
                        end_row: token.end_row,
                        end_column: token.end_column,
                        klass: "preview",
                        on_render: renderer
                    });
                }
            });
        };

        var preview_hide = function() {
             if (preview_marker) {
                 ace.remove_marker(preview_marker);
             }
        };

        var preview_trigger = function() {
            if (preview_timer) {
                clearTimeout(preview_timer);
                preview_timer = null;
            }
            preview_hide();
            preview_timer = setTimeout(preview_show, 1000);
        };

        if (doku.get_cookie("aceeditor") !== "off") {
            enable();
        }
    };

    var token_at_pos = function(pos) {
        var i, tokens, regexp;
        var result = {
            type: null,
            value: "",
            start_row: pos.row,
            start_column: 0,
            end_row: pos.row,
            end_column: 0
        };

        tokens = ace.get_tokens(pos.row);
        while (tokens.length === 0) {
            if (result.start_row === 0) {
                return;
            }
            result.start_row -= 1;
            tokens = ace.get_tokens(start_row);
        }

        for (i = 0; i < tokens.length; i += 1) {
            result.end_column += tokens[i].value.length;
            if (pos.column < result.end_column || i === tokens.length - 1) {
                result.value = tokens[i].value;
                result.type = tokens[i].type;
                regexp = new RegExp("^(start|table)-" + result.type + "$");
                break;
            }
            result.start_column = result.end_column;
        }

        while (i >= tokens.length - 1 &&
               regexp.test(tokens.state) &&
               result.end_row + 1 < ace.get_length()) {
            result.end_row += 1;
            result.end_column = 0;
            result.value += "\n";
            tokens = ace.get_tokens(result.end_row);
            for (i = 0; i < tokens.length; i += 1) {
                result.end_column += tokens[i].value.length;
                result.value += tokens[i].value;
                if (pos.column < result.end_column) {
                    break;
                }
            }
        }

        while (result.start_row > 0 && result.start_column === 0) {
            tokens = ace.get_tokens(result.start_row - 1);
            if (!regexp.test(tokens.state)) {
                break;
            }
            result.start_row -= 1;
            for (i = 0; i < tokens.length - 1; i += 1) {
                result.start_column += tokens[i].value.length;
            }
            result.value = tokens[i].value + "\n" + result.value;
        }

        return result;
    };

    // initialize editor after Dokuwiki
    var modules =  ["ace", "ace/editor", "ace/mode/text", "ace/range", "ace/tokenizer",
                    "ace/virtual_renderer", "container", "doku", "mode", "toggle"];
    require(modules, function() {
        require.ready(function() {
            setTimeout(function() {
                if ($("wiki__text") && window.jQuery && window.JSINFO) {
                    init();
                }
            }, 0);
        });
    });
});
