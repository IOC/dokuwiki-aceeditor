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

        var element, groups = {};

        var init = function() {
            var i;

            element = jQuery("<div>")
                .addClass("ace-menu")
                .css("position", "absolute")
                .css("z-index", 100)
                .hide()
                .appendTo("body");

            spec.items = spec.items || [];
            for (i = 0; i < spec.items.length; i += 1) {
                that.append(spec.items[i]);
            };
        };

        that.append = function(spec) {
            spec.group = spec.group || "default";

            if (!groups[spec.group]) {
                groups[spec.group] = jQuery("<div>").appendTo(element);
            }

            jQuery("<a>")
                .attr("href", "#")
                .addClass("ace-menu-item")
                .html("<strong>" + spec.key + "</strong>"
                      + "&nbsp;&nbsp;" + spec.label)
                .click(function() {
                    spec.exec();
                    that.hide();
                })
                .appendTo(groups[spec.group]);
        };

        that.hide = function() {
            element.hide();
            spec.on_hide();
        };

        that.show = function(pos, group) {
            var name, top, left;

            group = group || "default";
            for (name in groups) {
                groups[name].hide();
            }
            groups[group].show();

            left = pos.x + jQuery(window).scrollLeft();
            top = pos.y + jQuery(window).scrollTop();
            if (pos.y + element.height() > jQuery(window).height()) {
                top -= element.height();
            }

            element.css("left", left + "px");
            element.css("top", top + "px");
            element.show();
        };

        init();

        return that;
    }
});
