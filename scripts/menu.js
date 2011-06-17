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

        var element;

        var callback = function(index) {
            return function() {
                spec.items[index].exec();
                that.hide();
            };
        };

        var init = function() {
            var i, item;

            element = jQuery("<div>")
                .addClass("ace-menu")
                .hide()
                .appendTo("body");

            for (i = 0; i < spec.items.length; i += 1) {
                item = spec.items[i];
                jQuery("<a>")
                    .attr("href", "#")
                    .addClass("ace-menu-item")
                    .html("<strong>" + item.key + "</strong>"
                          + "&nbsp;&nbsp;" + item.label)
                    .click(callback(i))
                    .appendTo(element);
            }
        };

        that.hide = function() {
            element.hide();
            spec.on_hide();
        };

        that.show = function(pos) {
            element.css("left", pos.x + "px");
            if (pos.y + element.height() < jQuery(window).height()) {
                element.css("top", pos.y + "px");
            } else {
                element.css("top", pos.y - element.height());
            }
            element.show();
        };

        init();

        return that;
    }
});
