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

define ['cs!context_table'], (new_context_table) -> (spec) ->

  contexts = [new_context_table ace: spec.ace]
  menu_marker = null

  add_menu_marker = (context) ->
    pos = spec.ace.cursor_position()
    menu_marker = spec.ace.add_marker
      start_row: pos.row
      start_column: pos.column
      end_row: pos.row
      end_column: pos.column + 1
      klass: 'menu'
      on_render: (spec) ->
        vertical_pos = if spec.top > spec.screen_height - spec.bottom
          "bottom: #{spec.container_height - spec.top}px;"
        else
          "top: #{spec.bottom}px;"
        style = "position: absolute; left: #{spec.left}px; #{vertical_pos}"
        attributes = "class=\"ace_menu\" style=\"#{style}\""
        items = for item in context.menu
          "<div><strong>#{item.key}</strong> #{item.label}</div>"
        "<div #{attributes}>#{items.join ''}</div>"

  callback = (name, fallback) -> ->
    for context in contexts
      if data = context.parse()
        context.commands[name]? data
        hide_menu()
        return
    fallback?()

  hide_menu = ->
    spec.ace.remove_marker menu_marker if menu_marker
    menu_marker = null

  show_menu = ->
    hide_menu()
    for context in contexts
      if context.parse()
        add_menu_marker context
        return

  spec.ace.add_command
    name: 'doku-alt-left'
    key_win: 'Alt-Left'
    key_mac: 'Option-Left'
    exec: callback('alt_left', spec.ace.navigate_line_start)

  spec.ace.add_command
    name: 'doku-alt-right'
    key_win: 'Alt-Right'
    key_mac: 'Option-Right'
    exec: callback('alt_right', spec.ace.navigate_line_end)

  spec.ace.add_command
    name: 'doku-ctrl-shift-d'
    key_win: 'Ctrl-Shift-D'
    key_mac: 'Command-Shift-D'
    exec: callback 'ctrl_shift_d'

  spec.ace.add_command
    name: 'doku-hide-menu'
    exec: hide_menu

  spec.ace.add_command
    name: 'doku-menu'
    exec: show_menu

  spec.ace.add_command
    name: 'doku-menu-c'
    exec: callback 'menu_c'

  spec.ace.add_command
    name: 'doku-menu-l'
    exec: callback 'menu_l'

  spec.ace.add_command
    name: 'doku-menu-r'
    exec: callback 'menu_r'

  spec.ace.add_command
    name: 'doku-menu-t'
    exec: callback 'menu_t'

  spec.ace.add_command
    name: 'doku-return'
    key_win: 'Return'
    key_mac: 'Return'
    exec: callback('return', -> spec.ace.insert '\n')

  spec.ace.add_command
    name: 'doku-shift-return'
    key_win: 'Shift-Return'
    key_mac: 'Shift-Return'
    exec: callback('shift_return', -> spec.ace.insert '\n')

  spec.ace.add_command
    name: 'doku-shift-tab'
    key_win: 'Shift-Tab'
    key_mac: 'Shift-Tab'
    exec: callback('shift_tab', spec.ace.outdent)

  spec.ace.add_command
    name: 'doku-tab'
    key_win: 'Tab'
    key_mac: 'Tab'
    exec: callback('tab', spec.ace.indent)

  spec.ace.set_keyboard_states
    'start': [key: 'ctrl-space', exec: 'doku-menu', then: 'doku-menu']
    'doku-menu': [
      {key: 'ctrl-space', exec: 'doku-menu'}
      {key: 'esc', exec: 'doku-hide-menu', next: 'start'}
      {key: 'c', exec: 'doku-menu-c', then: 'start'}
      {key: 'l', exec: 'doku-menu-l', then: 'start'}
      {key: 'r', exec: 'doku-menu-r', then: 'start'}
      {key: 't', exec: 'doku-menu-t', then: 'start'}
      {then: 'start'}
    ]

  {hide_menu}
