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

define -> (spec) ->
  marker = null

  states_iterator = (pos, backwards, test) ->
    index = row = states = null
    ->
      if not index?
        row = pos.row
        states = spec.ace.get_line_states row
        for state, i in states
          index = i
          break if pos.column <= state.end
      else if backwards and index > 0
        index -= 1
      else if not backwards and index + 1 < states.length
        index += 1
      else if backwards and row > 0
        row -= 1
        states = spec.ace.get_line_states row
        index = states.length - 1
      else if not backwards and row + 1 < spec.ace.get_length()
        row += 1
        states = spec.ace.get_line_states row
        index = 0
      else
        return
      states[index].row = row
      states[index] if test states[index]

  update = ->
    pos = spec.ace.cursor_position()
    it = states_iterator pos, false, (state) -> /\blatex\b/.test state.name
    end_state = state while state = it()
    it = states_iterator pos, true, (state) -> /\blatex\b/.test state.name
    start_state = state while state = it()
    return unless start_state and end_state
    start = row: start_state.row, column: start_state.start
    end = row: end_state.row, column: end_state.end
    text = spec.ace.get_text_range start, end

    url = DOKU_BASE + 'lib/plugins/aceeditor/preview.php'
    jQuery.getJSON url, {text}, (data) ->
      spec.ace.remove_marker marker
      return unless data
      marker = spec.ace.add_marker
        start_row: start.row
        start_column: start.column
        end_row: end.row
        end_column: end.column
        klass: 'preview'
        on_render: (spec) ->
          vertical_pos = if spec.top > spec.screen_height - spec.bottom
            "bottom: #{spec.container_height - spec.top}px;"
          else
            "top: #{spec.bottom}px;"
          style = "left: #{spec.left}px; #{vertical_pos}"
          attributes = "class=\"ace_preview\" style=\"#{style}\""
          "<div #{attributes}><img src=\"#{encodeURI data.url}\"/></div>"

  update = _.debounce update, 1000

  trigger: ->
    spec.ace.remove_marker marker
    update()
