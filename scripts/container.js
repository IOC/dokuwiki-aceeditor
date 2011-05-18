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

define(function() {
    return function() {
        var that = {};
        var element, wrapper;

        that.element = function() {
            return element.get(0);
        };

        that.hide = function() {
            wrapper.hide();
        };

        that.incr_height = function(value) {
            that.set_height(wrapper.height() + value);
        };

        that.on_resize = function() {
            element.css("width", wrapper.width() + "px");
        };

        that.set_height = function(value) {
            wrapper.css("height", value + "px");
            element.css("height", wrapper.height() + "px");
        };

        that.show = function() {
            wrapper.show();
            element.css("width", wrapper.width() + "px");
            element.css("height", wrapper.height() + "px");
        };

        wrapper = jQuery("<div>")
            .addClass("ace-doku")
            .insertBefore(jQuery("#wiki__text"))
            .hide();
        element = jQuery("<div>")
            .appendTo(wrapper);

        return that;
    };
});
