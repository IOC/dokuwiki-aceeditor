
define(function() {

    return function(spec) {
        var that = {};

        var Range = require("ace/range").Range;
        var editor, session;

        var init = function() {
            var Editor = require("ace/editor").Editor;
            var Renderer = require("ace/virtual_renderer").VirtualRenderer;
            var TextMode = require("ace/mode/text").Mode;
            var Tokenizer = require("ace/tokenizer").Tokenizer;

            var theme = {cssClass: 'ace-doku-' + spec.colortheme};
            var renderer = new Renderer(spec.element, theme)
            var mode = new TextMode();

            editor = new Editor(renderer);
            editor.setReadOnly(spec.readonly);
            session = editor.getSession();
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
                if (!editor.getReadOnly()) {
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

        that.add_marker = function(spec) {
            var range = new Range(spec.start_row, spec.start_column,
                                  spec.end_row, spec.end_column);
            var renderer = function(html, range, left, top, config) {
                var i, right = 0;
                range = range.clipRows(config.firstRow, config.lastRow).toScreenRange(session);
                for (i = range.start.row; i <= range.end.row; i += 1) {
                    right = Math.max(right, Math.round(range.end.column * config.characterWidth));
                }
                html.push(spec.on_render({
                    left: (range.start.row < range.end.row ? 0 :
                           Math.round(range.start.column * config.characterWidth)),
                    top: (range.start.row - config.firstRowScreen) * config.lineHeight,
                    right: right,
                    bottom: (range.end.row - config.firstRowScreen + 1) * config.lineHeight,
                    screen_height: config.height,
                    screen_width: config.width
                }));
            };
            return session.addMarker(range, spec.klass, renderer, true);
        };

        that.focus = function() {
            editor.focus();
        };

        that.get_cursor_position = function() {
            return editor.getCursorPosition();
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

        that.remove_marker = function(marker_id) {
            session.removeMarker(marker_id);
        };

        that.replace = function(start, end, text) {
            var range = Range.fromPoints(offset_to_pos(start), offset_to_pos(end));
            session.replace(range, text);
        };

        that.resize = function() {
            editor.resize();
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
