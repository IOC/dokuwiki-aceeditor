# Ace editor plugin for Dokuwiki
# Copyright © 2011 Institut Obert de Catalunya
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

  token_at_pos = (pos) ->

    result =
      type: null
      value: ""
      start_row: pos.row
      start_column: 0
      end_row: pos.row
      end_column: 0

    tokens = spec.ace.get_tokens pos.row
    while tokens.length == 0
      return if result.start_row == 0
      result.start_row -= 1
      tokens = spec.ace.get_tokens result.start_row

    for token, i in tokens
      result.end_column += token.value.length
      if pos.column < result.end_column or i == tokens.length - 1
        result.value = token.value
        result.type = token.type
        regexp = new RegExp "^(start|table)-#{result.type}$"
        break
      result.start_column = result.end_column

    while (i >= tokens.length - 1 and
           regexp.test(tokens.state) and
           result.end_row + 1 < spec.ace.get_length())
      result.end_row += 1
      result.end_column = 0
      result.value += '\n'
      tokens = spec.ace.get_tokens result.end_row
      for token in tokens
        result.end_column += token.value.length
        result.value += token.value
        break if pos.column < result.end_column

    while result.start_row > 0 and result.start_column == 0
      tokens = spec.ace.get_tokens result.start_row - 1
      break unless regexp.test tokens.state
      result.start_row -= 1
      for i in [0 ... tokens.length - 1]
        result.start_column += tokens[i].value.length
      result.value = tokens[i].value + '\n' + result.value

    result

  update = ->
    token = token_at_pos spec.ace.cursor_position()
    update_latex token if token and /^latex_.*$/.test token.type

  update = _.debounce update, 1000

  update_latex = (token) ->
    url = DOKU_BASE + 'lib/plugins/aceeditor/preview.php'
    jQuery.getJSON url, text: token.value, (data) ->
      spec.ace.remove_marker marker
      return unless data
      marker = spec.ace.add_marker
        start_row: token.start_row
        start_column: token.start_column
        end_row: token.end_row
        end_column: token.end_column
        klass: 'preview'
        on_render: (spec) ->
          vertical_pos = if spec.top > spec.screen_height - spec.bottom
            "bottom: #{spec.container_height - spec.top}px;"
          else
            "top: #{spec.bottom}px;"
          style = "left: #{spec.left}px; #{vertical_pos}"
          attributes = "class=\"ace_preview\" style=\"#{style}\""
          "<div #{attributes}><img src=\"#{encodeURI data.url}\"/></div>"

  trigger: ->
    spec.ace.remove_marker marker
    update()
