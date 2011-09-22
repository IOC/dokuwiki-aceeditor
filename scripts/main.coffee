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

define (require) ->
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
    return unless $('wiki__text') and window.jQuery and window.JSINFO

    require 'pilot/fixoldbrowsers'
    require 'underscore'

    doku = require('doku')
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

    container = require('container')()

    toggle = require('toggle')
      on_enable: enable
      on_disable: disable

    mode = require('mode')
      latex: JSINFO.plugin_aceeditor.latex

    ace = require('ace')
      colortheme: JSINFO.plugin_aceeditor.colortheme
      element: container.element()
      next_line_indent: mode.next_line_indent
      on_cursor_change: ->
        preview.trigger()
        commands.hide_menu()
      on_document_change: ->
        if user_editing
          doku.text_changed()
          preview.trigger()
          commands.hide_menu()
      readonly: doku.get_readonly()
      tokenizer_rules: mode.tokenizer_rules()
      wraplimit: JSINFO.plugin_aceeditor.wraplimit
      wrapmode: doku.get_wrap()

    preview = require('preview') ace: ace

    commands = require('commands') ace: ace

    enable() if doku.get_cookie('aceeditor') isnt 'off'

  require.ready ->
    # initialize editor after Dokuwiki
    setTimeout init, 0
