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

define [
  'ace'
  'commands'
  'container'
  'doku'
  'preview'
  'toggle'
  'ace/lib/fixoldbrowsers'
  'underscore'
], (deps...) ->
  [new_ace,
   new_commands
   new_container
   new_doku
   new_preview
   new_toggle] = deps

  ace = container = doku = toggle = null
  user_editing = false

  disable = ->
    selection = ace.get_selection()
    user_editing = false
    doku.set_cookie 'aceeditor', 'off'
    container.hide()
    toggle.off()
    doku.enable()
    doku.set_value ace.get_value()
    doku.set_selection selection.start, selection.end
    doku.focus()

  enable = ->
    selection = doku.get_selection()
    doku.disable()
    container.set_height doku.inner_height()
    container.show()
    toggle.on()
    ace.set_value doku.get_value()
    ace.resize()
    ace.focus()
    ace.set_selection selection.start, selection.end
    user_editing = true
    doku.set_cookie 'aceeditor', 'on'

  init = ->
    return unless navigator.userAgent.indexOf('MSIE') is -1
    return unless window.JSINFO and document.getElementById 'wiki__text'

    doku = new_doku
      get_selection: -> ace.get_selection()
      get_text: (start, end) -> ace.get_value().substring start, end
      get_value: -> ace.get_value()
      paste_text: (start, end, text) ->
        ace.replace start, end, text
        ace.set_selection start, end
        ace.focus()
      on_resize: ->
        container.on_resize()
        ace.resize()
      set_selection: (start, end) ->
        ace.set_selection start, end
        ace.focus()
      set_wrap: (value) ->
        ace.set_wrap_mode(value)
        ace.focus()
      size_ctl: (value) ->
        container.incr_height(value)
        ace.resize()
        ace.focus()

    container = new_container()

    toggle = new_toggle
      on_enable: enable
      on_disable: disable

    ace = new_ace
      colortheme: JSINFO.plugin_aceeditor.colortheme
      element: container.element()
      latex: JSINFO.plugin_aceeditor.latex
      on_cursor_change: ->
        preview.trigger()
        commands.hide_menu()
      on_document_change: ->
        if user_editing
          doku.text_changed()
          preview.trigger()
          commands.hide_menu()
      readonly: doku.get_readonly()
      wraplimit: JSINFO.plugin_aceeditor.wraplimit
      wrapmode: doku.get_wrap()

    preview = new_preview ace: ace

    commands = new_commands ace: ace

    enable() if doku.get_cookie('aceeditor') isnt 'off'

  # initialize editor after Dokuwiki
  jQuery?(document).ready -> _.defer init
