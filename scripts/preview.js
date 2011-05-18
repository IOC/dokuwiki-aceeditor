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

        var marker, timer;

        var remove = function() {
            if (marker) {
                spec.ace.remove_marker(marker);
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

            tokens = spec.ace.get_tokens(pos.row);
            while (tokens.length === 0) {
                if (result.start_row === 0) {
                    return;
                }
                result.start_row -= 1;
                tokens = spec.ace.get_tokens(result.start_row);
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
                   result.end_row + 1 < spec.ace.get_length()) {
                result.end_row += 1;
                result.end_column = 0;
                result.value += "\n";
                tokens = spec.ace.get_tokens(result.end_row);
                for (i = 0; i < tokens.length; i += 1) {
                    result.end_column += tokens[i].value.length;
                    result.value += tokens[i].value;
                    if (pos.column < result.end_column) {
                        break;
                    }
                }
            }

            while (result.start_row > 0 && result.start_column === 0) {
                tokens = spec.ace.get_tokens(result.start_row - 1);
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

        var update = function() {
            var pos = spec.ace.get_cursor_position();
            var token = token_at_pos(pos);
            timer = null;
            remove();

            if (token && /^latex-.*$/.test(token.type)) {
                update_latex(token);
            }
        };

        var update_latex = function(token) {
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
                if (data && !timer) {
                    marker = spec.ace.add_marker({
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

        that.trigger = function() {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            remove();
            timer = setTimeout(update, 1000);
        };

        return that;
    };
});
