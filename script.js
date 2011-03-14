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

var init = function() {
    var Range = require("ace/range").Range;
    var DokuwikiMode = require("mode-dokuwiki").Mode;

    var enabled = false;
    var textarea, container, editor, session, toggle;

    textarea = $("wiki__text");

    var enable = function() {
        var selection = getSelection(textarea);

        element.style.height = container.style.height = textarea.offsetHeight + "px";
        textarea.style.display = "none";
        container.style.display = "block";
        toggle.className = "enabled";

        session.setValue(textarea.value);
        editor.navigateTo(0);
        editor.resize();
        editor.focus();

        enabled = true;
        setSelection(selection);
        DokuCookie.setValue("aceeditor", "on");
    }

    var disable = function() {
        var selection = getSelection(textarea);

        textarea.style.display = "block";
        container.style.display = "none";
        toggle.className = "";

        textarea.value = session.getValue();

        enabled = false;
        setSelection(selection);
        DokuCookie.setValue("aceeditor", "off");
    };

    if (textarea && window.JSINFO) {

        // Setup elements
        container = document.createElement("div");
        textarea.parentNode.insertBefore(container, textarea);
        element = document.createElement("div");
        container.appendChild(element);
        element.style.width = container.offsetWidth + 'px';
        container.style.display = "none";
        addEvent(window, "resize", function(event) {
            if (enabled) {
                element.style.width = container.offsetWidth + 'px';
            }
        });

        // Setup toggle
        toggle = document.createElement("div");
        toggle.id = "ace-toggle";
        toggle.textContent = "Ace";
        $('wiki__editbar').insertBefore(toggle, $("size__ctl").nextSibling);
        addEvent($("ace-toggle"), "click", function() {
            if (enabled) {
                disable();
            } else {
                enable();
            }
        });

        // Initialize Ace
        editor = ace.edit(element);
        session = editor.getSession();
        editor.setReadOnly(textarea.getAttribute("readonly") === "readonly");

        // Setup Dokuwiki mode and theme
        session.setMode(new DokuwikiMode(JSINFO.plugin_aceeditor.highlight));
        editor.setTheme({cssClass: 'ace-doku'});

        // Setup wrap mode
        session.setUseWrapMode(textarea.getAttribute('wrap') !== "off");
        editor.setShowPrintMargin(textarea.getAttribute('wrap') !== "off");
        session.setWrapLimitRange(null, JSINFO.plugin_aceeditor.wraplimit);
        editor.setPrintMarginColumn(JSINFO.plugin_aceeditor.wraplimit);

        // Notify Dokuwiki of text changes
        session.getDocument().on("change", function() {
            textChanged = true;
            summaryCheck();
        });

        // Patch Dokuwiki functions

        var pos_to_offset = function(pos) {
            var i, offset = pos.column;
            for (i = 0; i < pos.row; i++) {
                offset += session.getLine(i).length + 1;
            }
            return offset;
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

        var doku_submit_handler = textarea.form.onsubmit;
        addEvent(textarea.form, "submit", function(event) {
            if (enabled) {
                textarea.value = session.getValue();
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
                if (enabled && selection.obj === textarea) {
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
            if (enabled && obj === textarea) {
                range = editor.getSelection().getRange();
                selection = new selection_class();
                selection.obj = textarea;
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
            if (enabled && selection.obj === textarea) {
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
            if (enabled && selection.obj === textarea) {
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
            if (enabled && textarea === $(edid)) {
                element.style.height = container.style.height = (element.clientHeight + val) + "px";
                editor.resize();
                editor.focus();
            }
        };

        var doku_set_wrap = setWrap;
        setWrap = function(obj, value) {
            doku_set_wrap(obj, value);
            if (obj === textarea) {
                editor.setShowPrintMargin(value !== "off");
                session.setUseWrapMode(value !== "off");
                editor.focus();
            }
        };

        if (DokuCookie.getValue("aceeditor") !== "off") {
            enable();
        }
    }
};

addInitEvent(function() {
    // initialize editor after Dokuwiki
    setTimeout(init, 0);
});
