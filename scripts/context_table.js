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

        var new_cell = function(spec) {
            var that = {};

            var trimmed_content = function() {
                return spec.content.replace(/^ +/, "").replace(/ +$/, "");
            };

            var update_layout = function(layout, offset) {
                var i, min_length, space, target_length = 0;
                var padding = {left: 1, right: 1};

                if (spec.align === "center") {
                    padding.left = padding.right = 2;
                } else if (spec.align === "right") {
                    padding.left = 2;
                }

                min_length = (trimmed_content().length + spec.colspan +
                              padding.left + padding.right);

                for (i = offset; i < offset + spec.colspan; i += 1) {
                    layout[i] = layout[i] || 0;
                    target_length += layout[i];
                }

                if (min_length < target_length) {
                    space = target_length - min_length;
                    if (spec.align === "center") {
                        padding.left += Math.floor(space / 2);
                        padding.right += Math.ceil(space / 2);
                    } else if (spec.align === "right") {
                        padding.left += space;
                    } else {
                        padding.right += space;
                    }
                } else {
                    space = min_length - target_length;
                    for (i = 0; i < spec.colspan; i += 1) {
                        layout[offset + i] += Math.floor(space / spec.colspan);
                    }
                    for (i = 0; i < space % spec.colspan; i += 1) {
                        layout[offset + i] += 1;
                    }
                }

                return padding;
            };

            that.cursor_position = function() {
                return 1 + Math.max(1, spec.content.replace(/ +$/, "").length);
            };

            that.colspan = function() {
                return spec.colspan;
            };

            that.format = function(layout, offset, pass) {
                var padding;
                if (pass >= 2 || spec.colspan === 1) {
                    padding = update_layout(layout, offset);
                }
                if (pass >= 3) {
                    spec.content = (new Array(padding.left + 1).join(" ") +
                                    trimmed_content() +
                                    new Array(padding.right + 1).join(" "));
                }
            };

            that.is_header = function() {
                return spec.is_header;
            };

            that.length = function() {
                return 1 + spec.content.length;
            };

            that.toggle_header = function() {
                spec.is_header = !spec.is_header;
            };

            that.set_align = function(value) {
                spec.align = value;
            };

            that.value = function() {
                var sep = spec.is_header ? "^" : "|";
                return sep + spec.content + new Array(spec.colspan).join(sep);
            };

            return that;
        };

        var new_row = function(cells) {
            var that = {};

            that.align_cell = function(index, align) {
                cells[index].set_align(align);
            };

            that.columns = function() {
                var i, result = 0;
                for (i = 0; i < cells.length; i += 1) {
                    result += cells[i].colspan();
                }
                return result;
            }

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

            that.fill = function(columns) {
                var i, is_header = false;
                if (cells.length > 0) {
                    is_header = cells[cells.length - 1].is_header();
                }
                for (i = that.columns(); i < columns; i += 1) {
                    cells.push(new_cell({
                        align: "left",
                        colspan: 1,
                        content: "  ",
                        is_header: is_header
                    }));
                }
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

            that.format = function(layout, pass) {
                var i, offset = 0;
                for (i = 0; i < cells.length; i += 1) {
                    cells[i].format(layout, offset, pass);
                    offset += cells[i].colspan();
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
                var i, layout = [], lines = [], pass;
                normalize();
                for (pass = 1; pass <= 3; pass += 1) {
                    for (i = 0; i < rows.length; i += 1) {
                        rows[i].format(layout, pass);
                    }
                }
                update();
            };

            var has_colspans = function() {
                var i;
                for (i = 0; i < rows.length; i += 1) {
                    if (rows[i].length() !== rows[i].columns()) {
                        return true;
                    }
                }
                return false;
            };

            var normalize = function() {
                var columns = 0, i;
                for (i = 0; i < rows.length; i += 1) {
                    columns = Math.max(columns, rows[i].columns());
                }
                for (i = 0; i < rows.length; i += 1) {
                    rows[i].fill(columns);
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
            };

            that.move_column_left = function() {
                var i;
                normalize();
                if (!has_colspans() && cursor_cell > 0) {
                    for (i = 0; i < rows.length; i += 1) {
                        rows[i].move_cell_left(cursor_cell);
                    }
                    cursor_cell -= 1;
                }
                format();
            };

            that.move_column_right = function() {
                var i;
                normalize();
                if (!has_colspans() && cursor_cell < rows[cursor_row].length() - 1) {
                    for (i = 0; i < rows.length; i += 1) {
                        rows[i].move_cell_right(cursor_cell);
                    }
                    cursor_cell += 1;
                }
                format();
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
            };

            that.next_row = function() {
                cursor_row += 1;
                if (cursor_row === rows.length) {
                    rows.push(new_row([]));
                }
                format();
            };

            that.previous_cell = function() {
                if (cursor_cell > 0) {
                    cursor_cell -= 1;
                } else if (cursor_row > 0) {
                    cursor_row -= 1;
                    cursor_cell = rows[cursor_row].length() - 1;
                }
                format();
            };

            that.previous_row = function() {
                if (cursor_row > 0) {
                    cursor_row -= 1;
                }
                format();
            };

            that.remove_column = function() {
                var i;
                normalize();
                if (!has_colspans() && rows[0].length() > 1) {
                    for (i = 0; i < rows.length; i += 1) {
                        rows[i].remove_cell(cursor_cell);
                    }
                    if (cursor_cell === rows[0].length()) {
                        cursor_cell -= 1;
                    }
                }
                format();
            };

            that.toggle_header = function() {
                rows[cursor_row].toggle_header(cursor_cell);
                format();
            };

            return that;
        };

        var parse_row = function(row) {
            var cells = [], content = null, i, is_header, tokens;

            var push_cell = function(colspan) {
                var align;
                if (content !== null) {
                    align = (/^  +[^ ]/.test(content) ?
                             (/[^ ] + $/.test(content) ? "center" : "right") :
                             "left");
                    cells.push(new_cell({
                        align: align,
                        colspan: colspan,
                        content: content,
                        is_header: is_header
                    }));
                }
            }

            var parse_table_token = function(token) {
                var i, colspan;

                var is_separator = function(i) {
                    return token[i] === "|" || token[i] === "^";
                }

                for (i = 0; i < token.length; i += 1) {
                    if (is_separator(i)) {
                        for (colspan = 1; is_separator(i + 1); colspan += 1) {
                            i += 1;
                        }
                        push_cell(colspan);
                        is_header = (token[i] === "^");
                        content = "";
                    } else {
                        content += token[i];
                    }
                }
            };

            tokens = spec.ace.get_tokens(row);
            if (tokens.length === 0 || tokens[0].type !== "table") {
                return;
            }

            for (i = 0; i < tokens.length; i += 1) {
                if (tokens[i].type === "table") {
                    parse_table_token(tokens[i].value);
                } else {
                    content += tokens[i].value;
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

        that.commands = {
            alt_left:  function(table) {
                table.move_column_left();
            },
            alt_right: function(table) {
                table.move_column_right();
            },
            ctrl_shift_d: function(table) {
                table.remove_column();
            },
            menu_c: function(table) {
                table.align_cell("center");
            },
            menu_l: function(table) {
                table.align_cell("left");
            },
            menu_r: function(table) {
                table.align_cell("right");
            },
            menu_t: function (table) {
                table.toggle_header();
            },
            return: function(table) {
                table.next_row();
            },
            shift_return: function(table) {
                table.previous_row();
            },
            shift_tab: function(table) {
                table.previous_cell();
            },
            tab: function(table) {
                table.next_cell();
            }
        };

        that.menu = [{
            key: "t",
            label: "Toggle type",
        }, {
            key: "l",
            label: "Align to left",
        }, {
            key: "c",
            label: "Align to center",
        }, {
            key: "r",
            label: "Align to right",
        }];

        that.name = "table";

        that.parse = function() {
            return parse_table();
        };

        return that;
    };
});
