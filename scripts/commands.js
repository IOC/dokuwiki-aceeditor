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

        var new_cell = function(is_header, align, content) {
            var that = {};

            that.set_align = function(value) {
                align = value;
            };

            that.cursor_position = function() {
                return 1 + Math.max(1, content.replace(/ +$/, "").length);
            };

            that.format = function(length) {
                var padding, padding_left, padding_right;

                content = content.replace(/^ +/, "").replace(/ +$/, "");
                padding = length - content.length - 1;

                if (align === "right") {
                    padding = Math.max(3, padding);
                    padding_left = padding - 1;
                    padding_right = 1;
                } else if (align === "center") {
                    padding = Math.max(4, padding);
                    padding_left = Math.floor(padding / 2);
                    padding_right = Math.ceil(padding / 2);
                } else {
                    padding = Math.max(2, padding);
                    padding_left = 1;
                    padding_right = padding - 1;
                }

                content = (new Array(padding_left + 1).join(" ") +
                           content +
                           new Array(padding_right + 1).join(" "));
            };

            that.is_header = function() {
                return is_header;
            };

            that.length = function() {
                return 1 + content.length;
            };

            that.toggle_header = function() {
                is_header = !is_header;
            };

            that.value = function() {
                return (is_header ? "^" : "|") + content;
            };

            return that;
        };

        var new_row = function(cells) {
            var that = {};

            that.align_cell = function(index, align) {
                cells[index].set_align(align);
            };

            that.cursor_position = function(cell) {
                var i, position = 0;
                for (i = 0; i < cell; i += 1) {
                    position += cells[i].length();
                }
                return position + cells[cell].cursor_position();
            };

            that.cursor_cell = function(column) {
                var i, length = 0;
                for (i = 0; i < cells.length; i += 1) {
                    length += cells[i].length();
                    if (column < length) {
                        return i;
                    }
                };
                return cells.length - 1;
            };

            that.move_cell_left = function(index) {
                if (index > 0 && index < cells.length) {
                    cells.splice(index - 1, 2, cells[index], cells[index - 1]);
                }
            };

            that.move_cell_right = function(index) {
                if (index >= 0 && index < cells.length - 1) {
                    cells.splice(index, 2, cells[index + 1], cells[index]);
                }
            };

            that.format = function(column_lengths) {
                var i, is_header;
                for (i = 0; i < cells.length; i += 1) {
                    column_lengths[i] = column_lengths[i] || 0;
                    cells[i].format(column_lengths[i]);
                    column_lengths[i] = Math.max(column_lengths[i], cells[i].length());
                };
                is_header = cells.length > 0 ? cells[cells.length - 1].is_header() : false;
                for (i = cells.length; i < column_lengths.length; i += 1) {
                    cells.push(new_cell(is_header, "left", ""));
                    cells[i].format(column_lengths[i]);
                };
            };

            that.length = function() {
                return cells.length;
            };

            that.remove_cell = function(index) {
                cells.splice(index, 1);
            };

            that.toggle_header = function(index) {
                cells[index].toggle_header();
            };

            that.value = function() {
                var i, values = [];
                for (i = 0; i < cells.length; i += 1) {
                    values.push(cells[i].value());
                }
                values.push(cells[cells.length - 1].is_header() ? "^" : "|");
                return values.join("");
            };

            return that;
        };

        var new_table = function(rows, start_row, end_row, cursor_pos) {
            var that = {};
            var cursor_row = cursor_pos.row - start_row;
            var cursor_cell = rows[cursor_row].cursor_cell(cursor_pos.column);

            var cursor_position = function() {
                return {
                    row: start_row + cursor_row,
                    column: rows[cursor_row].cursor_position(cursor_cell)
                };
            };

            var format = function() {
                var i, column_lengths = [], lines = [];
                for (i = 0; i < rows.length; i += 1) {
                    rows[i].format(column_lengths);
                }
                for (i = 0; i < rows.length; i += 1) {
                    rows[i].format(column_lengths);
                }
            };

            var update = function() {
                var i, lines = [];
                for (i = 0; i < rows.length; i += 1) {
                    lines.push(rows[i].value());
                }
                spec.ace.replace_lines(start_row, end_row, lines);
                spec.ace.navigate(cursor_position());
            };

            that.align_cell = function(align) {
                rows[cursor_row].align_cell(cursor_cell, align);
                format();
                update();
            };

            that.move_row_left = function() {
                var i;
                format();
                if (cursor_cell > 0) {
                    for (i = 0; i < rows.length; i += 1) {
                        rows[i].move_cell_left(cursor_cell);
                    }
                    cursor_cell -= 1;
                }
                update();
            };

            that.move_row_right = function() {
                var i;
                format();
                if (cursor_cell < rows[cursor_row].length() - 1) {
                    for (i = 0; i < rows.length; i += 1) {
                        rows[i].move_cell_right(cursor_cell);
                    }
                    cursor_cell += 1;
                }
                update();
            };

            that.next_cell = function() {
                cursor_cell += 1;
                if (cursor_cell === rows[cursor_row].length()) {
                    cursor_cell = 0;
                    cursor_row += 1;
                    if (cursor_row === rows.length) {
                        rows.push(new_row([]));
                    }
                }
                format();
                update();
            };

            that.next_row = function() {
                cursor_row += 1;
                if (cursor_row === rows.length) {
                    rows.push(new_row([]));
                }
                format();
                update();
            };

            that.previous_cell = function() {
                if (cursor_cell > 0) {
                    cursor_cell -= 1;
                } else if (cursor_row > 0) {
                    cursor_row -= 1;
                    cursor_cell = rows[cursor_row].length() - 1;
                }
                format();
                update();
            };

            that.previous_row = function() {
                if (cursor_row > 0) {
                    cursor_row -= 1;
                }
                format();
                update();
            };

            that.remove_column = function() {
                var i;
                format();
                if (rows[0].length() > 1) {
                    for (i = 0; i < rows.length; i += 1) {
                        rows[i].remove_cell(cursor_cell);
                    }
                    if (cursor_cell === rows[0].length()) {
                        cursor_cell -= 1;
                    }
                }
                update();
            };

            that.toggle_header = function() {
                rows[cursor_row].toggle_header(cursor_cell);
                update();
            };

            return that;
        };

        var parse_row = function(row, column) {
            var cells = [], i, is_header, value;
            var tokens = spec.ace.get_tokens(row);

            if (tokens.length === 0 || tokens[0].type !== "table") {
                return;
            }

            var push_cell = function() {
                var align;
                if (value !== undefined) {
                    align = (/^  +[^ ]/.test(value) ?
                             (/[^ ] + $/.test(value) ? "center" : "right") :
                             "left");
                    cells.push(new_cell(is_header, align, value));
                }
            }

            var parse_table_token = function(token) {
                var i, align;
                for (i = 0; i < token.length; i += 1) {
                    if (token[i] === "|" || token[i] === "^") {
                        push_cell();
                        is_header = (token[i] === "^");
                        value = "";
                    } else {
                        value += token[i];
                    }
                }
            };

            for (i = 0; i < tokens.length; i += 1) {
                if (tokens[i].type === "table") {
                    parse_table_token(tokens[i].value);
                } else {
                    value += tokens[i].value;
                }
            }

            return new_row(cells);
        };

        var parse_table = function() {
            var pos = spec.ace.cursor_position();
            var start_row = pos.row, end_row = pos.row;
            var i, row, rows = [];

            if (row = parse_row(pos.row)) {
                rows.push(row);
                for (i = pos.row - 1; i >= 0; i -= 1) {
                    if (row = parse_row(i)) {
                        rows.push(row);
                        start_row = i;
                    } else {
                        break;
                    }
                }

                rows.reverse();
                for (i = pos.row + 1; i < spec.ace.get_length(); i += 1) {
                    if (row = parse_row(i)) {
                        rows.push(row);
                        end_row = i;
                    } else {
                        break;
                    }
                };

                return new_table(rows, start_row, end_row, pos);
            }
        };

        spec.ace.add_command({
            name: "doku-tab",
            key_win: "Tab",
            key_mac: "Tab",
            exec: function() {
                var table = parse_table();
                if (table) {
                    table.next_cell();
                } else {
                    spec.ace.indent();
                }
            }
        });

        spec.ace.add_command({
            name: "doku-shift-tab",
            key_win: "Shift-Tab",
            key_mac: "Shift-Tab",
            exec: function() {
                var table = parse_table();
                if (table) {
                    table.previous_cell();
                } else {
                    spec.ace.outdent();
                }
            }
        });

        spec.ace.add_command({
            name: "doku-return",
            key_win: "Return",
            key_mac: "Return",
            exec: function() {
                var table = parse_table();
                if (table) {
                    table.next_row();
                } else {
                    spec.ace.insert("\n");
                };
            }
        });

        spec.ace.add_command({
            name: "doku-shift-return",
            key_win: "Shift-Return",
            key_mac: "Shift-Return",
            exec: function() {
                var table = parse_table();
                if (table) {
                    table.previous_row();
                } else {
                    spec.ace.insert("\n");
                };
            }
        });

        spec.ace.add_command({
            name: "doku-alt-left",
            key_win: "Alt-Left",
            key_mac: "Option-Left",
            exec: function() {
                var table = parse_table();
                if (table) {
                    table.move_row_left();
                } else {
                    spec.ace.navigate_line_start();
                }
            }
        });

        spec.ace.add_command({
            name: "doku-alt-right",
            key_win: "Alt-Right",
            key_mac: "Option-Right",
            exec: function() {
                var table = parse_table();
                if (table) {
                    table.move_row_right();
                } else {
                    spec.ace.navigate_line_end();
                }
            }
        });

        spec.ace.add_command({
            name: "doku-mode-t",
            exec: function() {
                var table = parse_table();
                if (table) {
                    table.toggle_header();
                }
            }
        });

        spec.ace.add_command({
            name: "doku-mode-l",
            exec: function() {
                var table = parse_table();
                if (table) {
                    table.align_cell("left");
                }
            }
        });

        spec.ace.add_command({
            name: "doku-mode-c",
            exec: function() {
                var table = parse_table();
                if (table) {
                    table.align_cell("center");
                }
            }
        });

        spec.ace.add_command({
            name: "doku-mode-r",
            exec: function() {
                var table = parse_table();
                if (table) {
                    table.align_cell("right");
                }
            }
        });

        spec.ace.add_command({
            name: "doku-ctrl-shift-d",
            key_win: "Ctrl-Shift-D",
            key_mac: "Command-Shift-D",
            exec: function() {
                var table = parse_table();
                if (table) {
                    table.remove_column();
                }
            }
        });

        spec.ace.set_keyboard_states({
            "start": [{
                key: "ctrl-space",
                then: "doku-mode",
            }],
            "doku-mode": [{
                key: "t",
                exec: "doku-mode-t",
                then: "start",
            }, {
                key: "l",
                exec: "doku-mode-l",
                then: "start",
            }, {
                key: "c",
                exec: "doku-mode-c",
                then: "start",
            }, {
                key: "r",
                exec: "doku-mode-r",
                then: "start",
            }]
        });

        return that;
    };
});
