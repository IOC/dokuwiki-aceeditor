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

define(function(require) {
    var Range = require("ace/range").Range;
    var DokuwikiMode = require("mode").Mode;
    var Editor = require("ace/editor").Editor;
    var Renderer = require("ace/virtual_renderer").VirtualRenderer;

    var editor, session;
    var $container, $editor, doku, toggle;
    var preview_marker, preview_timer;

    var set_selection = function(start, end) {
        var range = Range.fromPoints(offset_to_pos(start), offset_to_pos(end));
        editor.getSelection().setSelectionRange(range);
        editor.focus();
    };

    var get_selection = function() {
        var range = editor.getSelection().getRange();
        return {start: pos_to_offset(range.start), end: pos_to_offset(range.end)};
    };

    var disable = function() {
        var selection = get_selection();

        doku.enable();
        $container.hide();
        toggle.off();

        doku.set_value(session.getValue());

        doku.set_selection(selection.start, selection.end);
        doku.set_cookie("aceeditor", "off");
    };

    var enable = function() {
        var selection = doku.get_selection();

        doku.disable();
        $container.show();
        $editor.css("width", $container.width() + "px");
        $container.css("height", doku.inner_height() + "px");
        $editor.css("height", $container.height() + "px");
        toggle.on();

        session.setValue(doku.get_value());
        editor.navigateTo(0, 0);
        editor.resize();
        editor.focus();

        set_selection(selection.start, selection.end);
        doku.set_cookie("aceeditor", "on");
    };

    var init = function() {
        var $ = jQuery;
        var theme;

        // Setup elements
        doku = require("doku")({
            get_selection: get_selection,
            get_text: function(start, end) {
                return session.getValue().substring(start, end);
            },
            get_value: function() {
                return session.getValue();
            },
            paste_text: function(start, end, text) {
                var range;
                range = Range.fromPoints(offset_to_pos(start), offset_to_pos(end));
                session.replace(range, text);
                set_selection(start, end);

            },
            on_resize: function() {
                $editor.css("width", $container.width() + "px");
                editor.resize();
            },
            set_selection: set_selection,
            set_wrap: function(value) {
                editor.setShowPrintMargin(value);
                session.setUseWrapMode(value);
                editor.focus();
            },
            size_ctl: function(value) {
                $container.css("height", ($container.height() + value) + "px");
                $editor.css("height", $container.height() + "px");
                editor.resize();
                editor.focus();
            }
        });
        $container = $("<div>")
            .addClass("ace-doku")
            .insertBefore(jQuery("#wiki__text"));
        $editor = $("<div>")
            .css("width", $container.width() + "px")
            .appendTo($container);
        $container.hide();

        // Setup toggle
        toggle = require("toggle")({
            on_enable: enable,
            on_disable: disable
        });

        // Initialize Ace
        theme = {cssClass: 'ace-doku-' + JSINFO.plugin_aceeditor.colortheme};
        editor = new Editor(new Renderer($editor.get(0), theme));
        editor.setReadOnly(doku.get_readonly());
        session = editor.getSession();
        session.setMode(new DokuwikiMode(JSINFO.plugin_aceeditor));

        // Setup wrap mode
        session.setUseWrapMode(doku.get_wrap());
        editor.setShowPrintMargin(doku.get_wrap());
        session.setWrapLimitRange(null, JSINFO.plugin_aceeditor.wraplimit);
        editor.setPrintMarginColumn(JSINFO.plugin_aceeditor.wraplimit);

        // Notify Dokuwiki of text changes
        session.getDocument().on("change", function() {
            if (!editor.getReadOnly()) {
                doku.text_changed();
            }
        });


        // LaTeX preview

        var preview_show = function() {
            var pos = editor.getCursorPosition();
            var token = token_at_pos(pos);
            preview_timer = null;
            preview_hide();

            if (token && /^latex-.*$/.test(token.type)) {
                preview_latex(token);
            }
        };

        var preview_latex = function(token) {
            var url = DOKU_BASE + "lib/plugins/aceeditor/preview.php";
            $.getJSON(url, { text: token.value }, function (data) {
                var renderer = function(html, range, left, top, config) {
                    var left, top, top_range, bottom_range;
                    range = token.range.clipRows(config.firstRow, config.lastRow);
                    range = range.toScreenRange(session);
                    range_top = (range.start.row - config.firstRowScreen) * config.lineHeight;
                    range_bottom = (range.end.row - config.firstRowScreen + 1) * config.lineHeight;
                    top = (range_top > config.height - range_bottom ?
                           range_top - data.height - 12 : range_bottom);
                    left = (range.start.row < range.end.row ? 0 :
                            Math.round(range.start.column * config.characterWidth));
                    html.push('<div class="ace_preview" style="padding:5px; '
                              + 'position:absolute; left:' + left + 'px; top:' + top  + 'px; '
                              + 'width:' + data.width  + 'px; height:' + data.height + 'px;">'
                              + '<img src="' + encodeURI(data.url) + '"/></div>');
                };
                if (data && !preview_timer) {
                    preview_marker = session.addMarker(token.range, "preview", renderer, true);
                }
            });
        };

        var preview_hide = function() {
             if (preview_marker) {
                 session.removeMarker(preview_marker);
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

        session.on("change", preview_trigger);
        editor.getSelection().on("changeCursor", preview_trigger);

        if (doku.get_cookie("aceeditor") !== "off") {
            enable();
            editor.navigateTo(0, 0);
        }
    };

    var offset_to_pos = function(offset) {
        var pos = {row: 0, column: 0};
        while (offset > session.getLine(pos.row).length) {
            offset -= session.getLine(pos.row).length + 1;
            pos.row += 1;
        }
        pos.column = offset;
        return pos;
    };

    var pos_to_offset = function(pos) {
        var i, offset = pos.column;
            for (i = 0; i < pos.row; i++) {
                offset += session.getLine(i).length + 1;
            }
        return offset;
    };

    var token_at_pos = function(pos) {
        var i, tokens, regexp, next = true;
        var regexp, type, range = new Range(pos.row, 0, pos.row, 0);
        var get_tokens = function(row) {
            tokens = session.getTokens(row, row)[0];
        };

        get_tokens(range.end.row);
        while (tokens.tokens.length === 0) {
            if (range.start.row === 0) {
                return;
            }
            range.start.row -= 1;
            get_tokens(range.start.row);
        }

        for (i = 0; i < tokens.tokens.length; i += 1) {
            range.end.column += tokens.tokens[i].value.length;
            if (pos.column < range.end.column || i === tokens.tokens.length - 1) {
                type = tokens.tokens[i].type;
                regexp = new RegExp("^(start|table)-" + type + "$");
                break;
            }
            range.start.column = range.end.column;
        }

        while (i >= tokens.tokens.length - 1 &&
               regexp.test(tokens.state) &&
               range.end.row + 1 < session.getLength()) {
            range.end.row += 1;
            range.end.column = 0;
            get_tokens(range.end.row);
            for (i = 0; i < tokens.tokens.length; i += 1) {
                range.end.column += tokens.tokens[i].value.length;
                if (pos.column < range.end.column) {
                    break;
                }
            }
        }

        while (range.start.row > 0 && range.start.column === 0) {
            get_tokens(range.start.row - 1);
            if (!regexp.test(tokens.state)) {
                break;
            }
            range.start.row -= 1;
            for (i = 0; i < tokens.tokens.length - 1; i += 1) {
                range.start.column += tokens.tokens[i].value.length;
            }
        }

       return {type: type,
               value: session.getTextRange(range),
               range: range};
    };

    // initialize editor after Dokuwiki
    require.ready(function() {
        setTimeout(function() {
            if ($("wiki__text") && window.jQuery && window.JSINFO) {
                init();
            }
        }, 0);
    });
});
