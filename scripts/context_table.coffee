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

  new_cell = (spec) ->

    text = -> spec.content.replace(/^\ +/, '').replace(/\ +$/, '')

    update_layout = (layout, offset) ->
      padding = switch spec.align
        when 'left' then left: 1, right: 1
        when 'center' then left: 2, right: 2
        when 'right' then left: 2, right: 1
      min_length = text().length + spec.colspan + padding.left + padding.right
      target_length = 0

      for i in [0...spec.colspan]
        layout[offset+i] or= 0
        target_length += layout[offset+i]

      if min_length < target_length
        space = target_length - min_length
        switch spec.align
          when 'left'
            padding.right += space
          when 'right'
            padding.left += space
          when 'center'
            padding.left += Math.floor space / 2
            padding.right += Math.ceil space / 2
      else
        space = min_length - target_length
        for i in [0...spec.colspan]
          layout[offset+i] += Math.floor space / spec.colspan
        for i in [0...space % space.colspan]
          layout[offset+i] += 1

      padding

    cursor_position: -> 1 + Math.max 1, spec.content.replace(/\ +$/, '').length

    colspan: -> spec.colspan

    format: (layout, offset, pass) ->
      if pass >= 2 or spec.colspan == 1
        padding = update_layout layout, offset
      if pass >= 3
        space = (n) -> new Array(n + 1).join ' '
        spec.content = space(padding.left) + text() + space(padding.right)

    is_header: -> spec.is_header

    length: -> 1 + spec.content.length

    toggle_header: -> spec.is_header = not spec.is_header

    set_align: (value) -> spec.align = value

    value: ->
      sep = if spec.is_header then '^' else '|'
      sep + spec.content + new Array(spec.colspan).join sep

  new_row = (cells) ->

    columns = ->
      iterator = (memo, cell) -> memo + cell.colspan()
      _.reduce cells, iterator, 0

    align_cell: (index, align) -> cells[index].set_align align

    columns: columns

    cursor_position: (index) ->
      iterator = (memo, cell) -> memo + cell.length()
      _.reduce cells[0...index], iterator, cells[index].cursor_position()

    cursor_cell: (column) ->
      length = 0
      for cell, i in cells
        length += cell.length()
        return i if column < length
      cells.length - 1

    fill: (n_columns) ->
      for i in [columns()...n_columns]
        cells.push new_cell
          align: 'left'
          colspan: 1
          content: '  '
          is_header: _.last(cells)?.is_header()

    format: (layout, pass) ->
      offset = 0
      for cell in cells
        cell.format layout, offset, pass
        offset += cell.colspan()

    length: -> cells.length

    move_cell_left: (index) ->
      if 1 <= index < cells.length
        cells[index-1..index] = cells[index-1..index].reverse()

    move_cell_right: (index) ->
      if 0 <= index < cells.length - 1
        cells[index..index+1] = cells[index..index+1].reverse()

    remove_cell: (index) -> cells.splice index, 1

    toggle_header: (index) -> cells[index].toggle_header()

    value: ->
      last_sep = if _.last(cells).is_header() then '^' else '|'
      (cell.value() for cell in cells).join('') + last_sep

  new_table = (rows, start_row, end_row, cursor_pos) ->

    cursor_row = cursor_pos.row - start_row
    cursor_cell = rows[cursor_row].cursor_cell cursor_pos.column

    cursor_position = ->
      row: start_row + cursor_row
      column: rows[cursor_row].cursor_position cursor_cell

    format = ->
      layout = []
      normalize()
      for pass in [1..3]
        row.format layout, pass for row in rows
      update()

    has_colspans = -> _.any rows, (row) -> row.length() != row.columns()

    normalize = ->
      iterator = (memo, row) -> Math.max memo, row.columns()
      columns = _.reduce rows, iterator, 0
      row.fill columns for row in rows
      cursor_cell = Math.min cursor_cell, rows[cursor_row].length() - 1

    update = ->
      lines = (row.value() for row in rows)
      spec.ace.replace_lines start_row, end_row, lines
      spec.ace.navigate cursor_position()

    align_cell: (align) ->
      rows[cursor_row].align_cell cursor_cell, align
      format()

    insert_row: (before) ->
      cursor_row += 1 unless before
      rows.splice cursor_row, 0, new_row []
      cursor_cell = 0
      format()

    move_column_left: ->
      normalize()
      if not has_colspans() and cursor_cell > 0
        row.move_cell_left cursor_cell for row in rows
        cursor_cell -= 1
      format()

    move_column_right: ->
      normalize()
      if not has_colspans() and cursor_cell < rows[cursor_row].length() - 1
        row.move_cell_right cursor_cell for row in rows
        cursor_cell += 1
      format()

    next_cell: ->
      cursor_cell += 1
      if cursor_cell == rows[cursor_row].length()
        cursor_cell = 0
        cursor_row += 1
        rows.push new_row [] if cursor_row == rows.length
      format()

    next_row: ->
      cursor_row += 1
      rows.push new_row [] if cursor_row == rows.length
      format()

    previous_cell: ->
      if cursor_cell > 0
        cursor_cell -= 1
      else if cursor_row > 0
        cursor_row -= 1
        cursor_cell = Infinity
      format()

    previous_row: ->
      cursor_row -= 1 if cursor_row > 0
      format()

    remove_column: ->
      normalize()
      if not has_colspans() and rows[0].length() > 1
        row.remove_cell cursor_cell for row in rows
      format()

    toggle_header: ->
      rows[cursor_row].toggle_header cursor_cell
      format()

  parse_row = (row) ->
    line = spec.ace.get_line row
    return unless /^[\||\^].*[\||\^][ \t]*$/.test line

    cells = []
    contents = []
    separators = []

    for state in spec.ace.get_line_states row
      text = line[state.start...state.end]
      if state.name in ['start', 'table-start']
        words = text.split /([\^\|]+)/
        contents.push contents.pop() + words[0] if words[0]
        contents.push word for word in words[2..] by 2
        separators.push word for word in words[1..] by 2
      else
        contents.push (contents.pop() or '') + text

    return if separators.length is 0

    for index in [0...contents.length-1]
      content = contents[index]
      is_header = _.last(separators[index]) == '^'
      colspan = separators[index+1].length
      align = if not /^  +[^ ]/.test content then 'left'
      else if /[^ ]  +$/.test content then 'center'
      else 'right'
      cells.push new_cell {align, colspan, content, is_header}

    new_row cells

  parse_table = ->
    pos = spec.ace.cursor_position()
    start_row = pos.row
    end_row = pos.row
    rows = []

    row = parse_row pos.row
    return unless row
    rows.push row

    for i in [pos.row-1..0]
      row = parse_row i
      break unless row
      rows.push row
      start_row = i

    rows.reverse()

    for i in [pos.row+1...spec.ace.get_length()]
      row = parse_row i
      break unless row
      rows.push row
      end_row = i

    new_table rows, start_row, end_row, pos

  commands:
    alt_left: (table) -> table.move_column_left()
    alt_return: (table) -> table.insert_row()
    alt_right: (table) -> table.move_column_right()
    alt_shift_return: (table) -> table.insert_row true
    ctrl_shift_d: (table) -> table.remove_column()
    menu_c: (table) -> table.align_cell 'center'
    menu_l: (table) -> table.align_cell 'left'
    menu_r: (table) -> table.align_cell 'right'
    menu_t:  (table) -> table.toggle_header()
    return: (table) -> table.next_row()
    shift_return: (table) -> table.previous_row()
    shift_tab: (table) -> table.previous_cell()
    tab: (table) -> table.next_cell()

  menu: [
    {key: 't', label: 'Toggle type'}
    {key: 'l', label: 'Align to left'}
    {key: 'c', label: 'Align to center'}
    {key: 'r', label: 'Align to right'}
  ]

  name: 'table'

  parse: parse_table
