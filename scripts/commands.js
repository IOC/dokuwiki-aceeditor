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

        var contexts, menu_marker;

        var add_menu_marker = function(context) {
            var pos = spec.ace.cursor_position();
            var renderer = function(spec) {
                var i, html, top;
                html = ['<div class="ace_menu" style="position: absolute;' +
                        'left:' + spec.left + 'px;' +
                        (spec.top > spec.screen_height - spec.bottom ?
                         'bottom:' + (spec.container_height - spec.top) + 'px;">' :
                         'top:' + spec.bottom + 'px;">')];
                for (i = 0; i < context.menu.length; i += 1) {
                    html.push('<div><strong>' + context.menu[i].key
                              + '</strong> ' + context.menu[i].label + '</div>');
                }
                html.push('</div>');
                return html.join("");
            };
            menu_marker = spec.ace.add_marker({
                start_row: pos.row,
                start_column: pos.column,
                end_row: pos.row,
                end_column: pos.column + 1,
                klass: "menu",
                on_render: renderer
            });
        };

        var command_callback = function(name, fallback) {
            return function() {
                var i, context, data, exec;
                for (i = 0; i < contexts.length; i += 1) {
                    context = contexts[i];
                    if (data = context.parse()) {
                        if (exec = context.commands[name]) {
                            exec(data);
                        }
                        that.hide_menu();
                        return;
                    }
                }
                if (fallback) {
                    fallback();
                }
            }
        };

        var init = function() {
            contexts = [
                require("context_table")({
                    ace: spec.ace
                })
            ];
        };

        var show_menu = function() {
            var i;
            that.hide_menu();
            for (i = 0; i < contexts.length; i += 1) {
                if (contexts[i].parse()) {
                    add_menu_marker(contexts[i]);
                    return;
                }
            }
        };

        that.hide_menu = function() {
            if (menu_marker) {
                spec.ace.remove_marker(menu_marker);
                marker = null;
            }
        };

        spec.ace.add_command({
            name: "doku-alt-left",
            key_win: "Alt-Left",
            key_mac: "Option-Left",
            exec: command_callback("alt_left", function() {
                spec.ace.navigate_line_start();
            })
        });

        spec.ace.add_command({
            name: "doku-alt-right",
            key_win: "Alt-Right",
            key_mac: "Option-Right",
            exec: command_callback("alt_right", function() {
                spec.ace.navigate_line_end();
            })
        });

        spec.ace.add_command({
            name: "doku-ctrl-shift-d",
            key_win: "Ctrl-Shift-D",
            key_mac: "Command-Shift-D",
            exec: command_callback("ctrl_shift_d")
        });

        spec.ace.add_command({
            name: "doku-hide-menu",
            exec: that.hide_menu
        });

        spec.ace.add_command({
            name: "doku-menu",
            exec: show_menu
        });

        spec.ace.add_command({
            name: "doku-menu-c",
            exec: command_callback("menu_c")
        });

        spec.ace.add_command({
            name: "doku-menu-l",
            exec: command_callback("menu_l")
        });

        spec.ace.add_command({
            name: "doku-menu-r",
            exec: command_callback("menu_r")
        });

        spec.ace.add_command({
            name: "doku-menu-t",
            exec: command_callback("menu_t")
        });

        spec.ace.add_command({
            name: "doku-return",
            key_win: "Return",
            key_mac: "Return",
            exec: command_callback("return", function() {
                spec.ace.insert("\n");
            })
        });

        spec.ace.add_command({
            name: "doku-shift-return",
            key_win: "Shift-Return",
            key_mac: "Shift-Return",
            exec: command_callback("shift_return", function() {
                spec.ace.insert("\n");
            })
        });

        spec.ace.add_command({
            name: "doku-shift-tab",
            key_win: "Shift-Tab",
            key_mac: "Shift-Tab",
            exec: command_callback("shift_tab", function() {
                spec.ace.outdent();
            })
        });

        spec.ace.add_command({
            name: "doku-tab",
            key_win: "Tab",
            key_mac: "Tab",
            exec: command_callback("tab", function() {
                spec.ace.indent();
            })
        });

        spec.ace.set_keyboard_states({
            "start": [{
                key: "ctrl-space",
                exec: "doku-menu",
                then: "doku-menu"
            }],
            "doku-menu": [{
                key: "ctrl-space",
                exec: "doku-menu",
            }, {
                key: "esc",
                exec: "doku-hide-menu",
                next: "start",
            }, {
                key: "c",
                exec: "doku-menu-c",
                then: "start",
            }, {
                key: "l",
                exec: "doku-menu-l",
                then: "start",
            }, {
                key: "r",
                exec: "doku-menu-r",
                then: "start",
            }, {
                key: "t",
                exec: "doku-menu-t",
                then: "start",
            }, {
                then: "start",
            }]
        });

        init();

        return that;
    };
});
