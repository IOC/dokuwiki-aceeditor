# Ace editor plugin for Dokuwiki
# Copyright © 2011, 2012 Institut Obert de Catalunya
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# Ths program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

define -> ->

  textarea = jQuery '#wiki__text'
  wrapper = jQuery '<div>', class: 'ace-doku'
  element = jQuery '<div>'

  do ->
    properties = [
      'border', 'border-color', 'border-style', 'border-width'
      'border-top', 'border-top-color', 'border-top-style', 'border-top-width'
      'border-right', 'border-right-color', 'border-right-style', 'border-right-width'
      'border-bottom', 'border-bottom-color', 'border-bottom-style', 'border-bottom-width'
      'border-left', 'border-left-color', 'border-left-style', 'border-left-width'
      'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left'
    ]
    wrapper.css prop, textarea.css prop for prop in properties
    wrapper.append(element).insertAfter(textarea).hide()

  element: -> element.get 0

  hide: -> wrapper.hide()

  incr_height: (value) ->
    wrapper.css 'height', (wrapper.height() + value) + 'px'
    element.css 'height', wrapper.height() + 'px'

  on_resize: ->
    element.css 'width', wrapper.width() + 'px'

  set_height: (value) ->
    wrapper.css 'height', value + 'px'
    element.css 'height', wrapper.height() + 'px'

  show: ->
    wrapper.show()
    element.css 'width', wrapper.width() + 'px'
    element.css 'height', wrapper.height() + 'px'
