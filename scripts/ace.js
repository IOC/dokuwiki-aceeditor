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

        var Range = require("ace/range").Range;
        var StateHandler = require("ace/keyboard/state_handler").StateHandler;
        var canon = require("pilot/canon");
        var editor, session;

        var init = function() {
            var Editor = require("ace/editor").Editor;
            var Renderer = require("ace/virtual_renderer").VirtualRenderer;
            var TextMode = require("ace/mode/text").Mode;
            var Tokenizer = require("ace/tokenizer").Tokenizer;
            var UndoManager = require("ace/undomanager").UndoManager;

            var theme = {cssClass: 'ace-doku-' + spec.colortheme};
            var renderer = new Renderer(spec.element, theme)
            var mode = new TextMode();

            editor = new Editor(renderer);
            editor.setReadOnly(spec.readonly);
            session = editor.getSession();
            session.setUndoManager(new UndoManager());
            session.setTabSize(2);
            mode.$tokenizer = new Tokenizer(spec.tokenizer_rules);
            mode.getNextLineIndent = function(state, line, tab) {
                return spec.next_line_indent(line);
            };
            session.setMode(mode);

            editor.setShowPrintMargin(spec.wrapmode);
            session.setUseWrapMode(spec.wrapmode);
            session.setWrapLimitRange(null, spec.wraplimit);
            editor.setPrintMarginColumn(spec.wraplimit);

            session.on("change", function() {
                if (!spec.readonly) {
                    spec.on_document_change();
                }
            });

            editor.getSelection().on("changeCursor", function() {
                spec.on_cursor_change();
            });
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

        that.add_command = function(spec) {
            var command = {
                name: spec.name,
                exec: function (env, args, request) {
                    spec.exec();
                }
            };
            if (spec.key_win || spec.key_mac) {
                command.bindKey = {
                     win: spec.key_win || null,
                     mac: spec.key_mac || null,
                     sender: "editor"
                };
            }
            canon.addCommand(command);
        };

        that.add_marker = function(spec) {
            var range = new Range(spec.start_row, spec.start_column,
                                  spec.end_row, spec.end_column);
            var renderer = function(html, range, left, top, config) {
                html.push(spec.on_render({
                    left: (range.start.row < range.end.row ? 0 :
                           Math.round(range.start.column * config.characterWidth)),
                    top: (range.start.row - config.firstRowScreen) * config.lineHeight,
                    bottom: (range.end.row - config.firstRowScreen + 1) * config.lineHeight,
                    screen_height: config.height,
                    screen_width: config.width,
                    container_height: config.minHeight
                }));
            };
            return session.addMarker(range, spec.klass, renderer, true);
        };

        that.cursor_coordinates = function() {
            var pos = editor.getCursorPosition();
            var screen = editor.renderer.textToScreenCoordinates(pos.row, pos.column);
            return {
                x: Math.round(screen.pageX),
                y: Math.round(screen.pageY + editor.renderer.lineHeight / 2),
            };
        };

        that.cursor_position = function() {
            return editor.getCursorPosition();
        };

        that.focus = function() {
            editor.focus();
        };

        that.get_length = function() {
            return session.getLength();
        };

        that.get_selection = function() {
            var range = editor.getSelection().getRange();
            return {start: pos_to_offset(range.start), end: pos_to_offset(range.end)};
        };

        that.get_tokens = function(row) {
            var tokens = session.getTokens(row, row)[0];
            var result = tokens.tokens;
            result.state = tokens.state;
            return result;
        };

        that.get_value = function() {
            return session.getValue();
        };

        that.indent = function() {
            editor.indent();
        };

        that.insert = function(text) {
            editor.insert(text);
        };

        that.navigate_line_end = function() {
            editor.navigateLineEnd();
        };

        that.navigate_line_start = function() {
            editor.navigateLineStart();
        };

        that.navigate = function(position) {
            editor.navigateTo(position.row, position.column);
        };

        that.outdent = function() {
            editor.blockOutdent();
        };

        that.remove_marker = function(marker_id) {
            session.removeMarker(marker_id);
        };

        that.replace = function(start, end, text) {
            var range = Range.fromPoints(offset_to_pos(start), offset_to_pos(end));
            session.replace(range, text);
        };

        that.replace_lines = function(start, end, lines) {
            var i, document = session.getDocument();
            var doc_length = end - start + 1;
            var min_length = Math.min(doc_length, lines.length);

            for (i = 0; i < min_length; i+= 1) {
                if (document.getLine(start + i) !== lines[i]) {
                    document.removeInLine(start + i, 0, Infinity);
                    document.insertInLine({row: start + i, column: 0}, lines[i]);
                }
            }

            if (doc_length > lines.length) {
                document.removeLines(start + lines.length, end);
            } else if (doc_length < lines.length) {
                document.insertLines(end + 1, lines.slice(doc_length));
            }
        };

        that.resize = function() {
            editor.resize();
        };

        that.set_keyboard_states = function(states) {
            editor.setKeyboardHandler(new StateHandler(states));
        };

        that.set_selection = function(start, end) {
            var range = Range.fromPoints(offset_to_pos(start), offset_to_pos(end));
            editor.getSelection().setSelectionRange(range);
        };

        that.set_value = function(value) {
            session.setValue(value);
        };

        that.set_wrap_mode = function(value) {
            editor.setShowPrintMargin(value);
            session.setUseWrapMode(value);
        };

        init();

        return that;
    };
});
