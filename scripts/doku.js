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

        var patching = false;
        var textarea = $("wiki__text");
        var doku_current_headline_level = currentHeadlineLevel;
        var doku_get_selection = getSelection;
        var doku_paste_text = pasteText;
        var doku_selection_class = selection_class;
        var doku_set_selection = setSelection;
        var doku_set_wrap = setWrap;
        var doku_size_ctl = sizeCtl;
        var doku_submit_handler = textarea.form.onsubmit;

        that.disable = function() {
            patching = true;
            jQuery(textarea).hide();
        };

        that.enable = function() {
            patching = false;
            jQuery(textarea).show();
        };

        that.get_cookie = function(name) {
            return DokuCookie.getValue(name);
        };

        that.get_selection = function() {
            var selection = doku_get_selection(textarea);
            return {start: selection.start, end: selection.end};
        };

        that.inner_height = function() {
            return jQuery(textarea).innerHeight();
        };

        that.get_readonly = function() {
            return jQuery(textarea).attr("readonly");
        };

        that.get_value = function() {
            return jQuery(textarea).val();
        };

        that.set_cookie = function(name, value) {
            DokuCookie.setValue(name, value);
        };

        that.get_wrap = function() {
            return jQuery(textarea).attr('wrap') !== "off";
        };

        that.set_selection = function(start, end) {
            var selection = new doku_selection_class();
            selection.obj = textarea;
            selection.start = start;
            selection.end = end;
            doku_set_selection(selection);
        };

        that.set_value = function(value) {
            jQuery(textarea).val(value);
        };

        that.text_changed = function() {
            textChanged = true;
            summaryCheck();
        };

        currentHeadlineLevel = function(id) {
            if (id === textarea.id) {
                jQuery(textarea).val(spec.get_value());
            }
            return doku_current_headline_level(id);
        };

        getSelection = function(obj) {
            var selection, result;
            if (patching && obj === textarea) {
                result = spec.get_selection();
                selection = new selection_class();
                selection.obj = textarea;
                selection.start = result.start;
                selection.end = result.end;
                return selection;
            } else {
                return doku_get_selection(obj);
            }
        };

        pasteText = function(selection, text, opts) {
            if (patching && selection.obj === textarea) {
                opts = opts || {};
                spec.paste_text(selection.start, selection.end, text);
                selection.end = selection.start + text.length - (opts.endofs || 0);
                selection.start = (opts.nosel ? selection.end :
                                   selection.start + (opts.startofs || 0));
                spec.set_selection(selection.start, selection.end);
            } else {
                doku_paste_text(selection, text, opts);
            }
        };

        selection_class = function() {
            doku_selection_class.apply(this);
            this.doku_get_text = this.getText;
            this.getText = function() {
                if (patching && this.obj === textarea) {
                    return spec.get_text(this.start, this.end);
                } else {
                    return this.doku_get_text();
                }
            };
        };

        setSelection = function(selection) {
            if (patching && selection.obj === textarea) {
                spec.set_selection(selection.start, selection.end);
            } else {
                return doku_set_selection(selection);
            }
        };

        setWrap = function(obj, value) {
            doku_set_wrap(obj, value);
            if (obj === textarea) {
                spec.set_wrap(value !== "off");
            }
        };

        sizeCtl = function(edid, val) {
            doku_size_ctl(edid, val);
            if (patching && edid === textarea.id) {
                spec.size_ctl(val);
            }
        };

        addEvent(textarea.form, "submit", function(event) {
            if (patching) {
                jQuery(textarea).val(spec.get_value());
                if (doku_submit_handler && doku_submit_handler !== handleEvent) {
                    // submit handler is not set with addEvent
                    // in older versions of Dokuwiki
                    return doku_submit_handler(event);
                }
            }
        });

        addEvent(window, "resize", function(event) {
            if (patching) {
                spec.on_resize();
            }
        });

        return that;
    };
});