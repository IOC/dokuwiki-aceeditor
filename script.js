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

addInitEvent(function() {
    var editor, session, enabled = false;
    var $textarea, $container, $editor, $toggle_on, $toggle_off;

    var disable = function() {
        var selection = getSelection($textarea.get(0));

        $textarea.show();
        $container.hide();
        $toggle_on.hide();
        $toggle_off.show();

        $textarea.val(session.getValue());

        enabled = false;
        setSelection(selection);
        DokuCookie.setValue("aceeditor", "off");
    };

    var enable = function() {
        var selection = getSelection($textarea.get(0));

        $editor.css("height", $textarea.outerHeight() + "px");
        $container.css("height", $textarea.outerHeight() + "px");
        $textarea.hide();
        $container.show();
        $toggle_on.show();
        $toggle_off.hide();

        session.setValue($textarea.val());
        editor.navigateTo(0);
        editor.resize();
        editor.focus();

        enabled = true;
        setSelection(selection);
        DokuCookie.setValue("aceeditor", "on");
    }

    var init = function() {
        var $ = jQuery;
        var Range = require("ace/range").Range;
        var DokuwikiMode = require("mode-dokuwiki").Mode;

        // Setup elements
        $textarea = $("#wiki__text");
        $container = $("<div>").insertBefore($textarea);
        $editor = $("<div>")
            .addClass("ace-doku")
            .css("width", $container.width())
            .appendTo($container);
        $container.hide();
        addEvent(window, "resize", function(event) {
            if (enabled) {
                $editor.css("width", $container.width());
            }
        });

        // Setup toggle
        $toggle_on = $("<img>")
            .addClass("ace-toggle")
            .attr("src", DOKU_BASE + "lib/plugins/aceeditor/toggle_on.png")
            .insertAfter($("#size__ctl"))
            .click(disable);
        $toggle_off = $("<img>")
            .addClass("ace-toggle")
            .attr("src", DOKU_BASE + "lib/plugins/aceeditor/toggle_off.png")
            .insertAfter($("#size__ctl"))
            .click(enable)
            .hide();

        // Initialize Ace
        editor = ace.edit($editor.get(0));
        session = editor.getSession();
        editor.setReadOnly($textarea.attr("readonly") === "readonly");

        // Setup Dokuwiki mode and theme
        session.setMode(new DokuwikiMode(JSINFO.plugin_aceeditor.highlight));
        editor.setTheme({cssClass: 'ace-doku-' + JSINFO.plugin_aceeditor.colortheme});

        // Setup wrap mode
        session.setUseWrapMode($textarea.attr('wrap') !== "off");
        editor.setShowPrintMargin($textarea.attr('wrap') !== "off");
        session.setWrapLimitRange(null, JSINFO.plugin_aceeditor.wraplimit);
        editor.setPrintMarginColumn(JSINFO.plugin_aceeditor.wraplimit);

        // Notify Dokuwiki of text changes
        session.getDocument().on("change", function() {
            if (!editor.getReadOnly()) {
                textChanged = true;
                summaryCheck();
            }
        });

        // Patch Dokuwiki functions

        var doku_submit_handler = $textarea.get(0).form.onsubmit;
        addEvent($textarea.get(0).form, "submit", function(event) {
            if (enabled) {
                $textarea.val(session.getValue());
                if (doku_submit_handler && doku_submit_handler !== handleEvent) {
                    // submit handler is not set with addEvent
                    // in older versions of Dokuwiki
                    return doku_submit_handler(event);
                }
            }
        });

        var doku_selection_class = selection_class;
        selection_class = function() {
            var selection = new doku_selection_class();
            var doku_get_text = selection.getText;
            selection.getText = function() {
                var value;
                if (enabled && selection.obj === $textarea.get(0)) {
                    value = session.getValue();
                    return value.substring(selection.start, selection.end);
                } else {
                    return doku_get_text();
                }
            };
            return selection;
        };

        var doku_get_selection = getSelection;
        getSelection = function(obj) {
            var selection, range;
            if (enabled && obj === $textarea.get(0)) {
                range = editor.getSelection().getRange();
                selection = new selection_class();
                selection.obj = $textarea.get(0);
                selection.start = pos_to_offset(range.start);
                selection.end = pos_to_offset(range.end);
                return selection;
            } else {
                return doku_get_selection(obj);
            }
        };

        var doku_set_selection = setSelection;
        setSelection = function(selection) {
            var range;
            if (enabled && selection.obj === $textarea.get(0)) {
                range = Range.fromPoints(offset_to_pos(selection.start),
                                         offset_to_pos(selection.end));
                editor.getSelection().setSelectionRange(range);
                editor.focus();
            } else {
                return doku_set_selection(selection);
            }
        };

        var doku_paste_text = pasteText;
        pasteText = function(selection, text, opts) {
            var value;
            if (enabled && selection.obj === $textarea.get(0)) {
                opts = opts || {};
                value = session.getValue();
                session.setValue(value.substring(0, selection.start) + text +
                                 value.substring(selection.end, value.length));
                selection.end = selection.start + text.length - (opts.endofs || 0);
                selection.start = (opts.nosel ? selection.end :
                                   selection.start + (opts.startofs || 0));
                setSelection(selection);
            } else {
                doku_paste_text(selection, text, opts);
            }
        };

        var doku_size_ctl = sizeCtl;
        sizeCtl = function(edid, val) {
            doku_size_ctl(edid, val);
            if (enabled && $textarea.attr("id") === edid) {
                $editor.css("height", ($editor.height() + val) + "px");
                $container.css("height", $editor.height() + "px");
                editor.resize();
                editor.focus();
            }
        };

        var doku_set_wrap = setWrap;
        setWrap = function(obj, value) {
            doku_set_wrap(obj, value);
            if (obj === $textarea.get(0)) {
                editor.setShowPrintMargin(value !== "off");
                session.setUseWrapMode(value !== "off");
                editor.focus();
            }
        };

        if (DokuCookie.getValue("aceeditor") !== "off") {
            enable();
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

    // initialize editor after Dokuwiki
    setTimeout(function() {
        if ($("wiki__text") && window.jQuery && window.JSINFO) {
            init();
        }
    }), 0;
});
