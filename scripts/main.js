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
    var ace, container, doku, toggle;

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
        var mode, preivew;

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

        toggle = require("toggle")({
            on_enable: enable,
            on_disable: disable
        });

        mode = require("mode")({
            latex: JSINFO.plugin_aceeditor.latex
        });

        ace = require("ace")({
            colortheme: JSINFO.plugin_aceeditor.colortheme,
            element: container.element(),
            next_line_indent: mode.next_line_indent,
            on_cursor_change: function() {
                preview.trigger();
            },
            on_document_change: function() {
                doku.text_changed();
                preview.trigger();
            },
            readonly: doku.get_readonly(),
            tokenizer_rules: mode.tokenizer_rules(),
            wraplimit: JSINFO.plugin_aceeditor.wraplimit,
            wrapmode: doku.get_wrap()
        });

        preview = require("preview")({
            ace: ace,
        });

        if (doku.get_cookie("aceeditor") !== "off") {
            enable();
        }
    };

    require.ready(function() {
        // initialize editor after Dokuwiki
        setTimeout(function() {
            $("wiki__text") && window.jQuery && window.JSINFO && init();
        }, 0);
    });
});
