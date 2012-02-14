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

  patching = false
  textarea = document.getElementById 'wiki__text'

  patch = (name, func) ->
    obj = if dw_editor?[name]? then dw_editor else window
    orig_func = obj[name]
    obj[name] = (args...) -> func.call this, orig_func, args...
    orig_func

  patch 'currentHeadlineLevel', (func, id) ->
    jQuery(textarea).val spec.get_value() if id is textarea.id
    func id

  doku_get_selection = patch 'getSelection', (func, obj) ->
    if patching and obj is textarea
      result = spec.get_selection()
      selection = new selection_class()
      selection.obj = textarea
      selection.start = result.start
      selection.end = result.end
      selection
    else
      func obj

  patch 'pasteText', (func, selection, text, opts={}) ->
    if patching and selection.obj is textarea
      spec.paste_text selection.start, selection.end, text
      selection.end = selection.start + text.length - (opts.endofs or 0)
      selection.start += opts.startofs or 0
      selection.start = selection.end if opts.nosel
      spec.set_selection selection.start, selection.end
    else
      func selection, text, opts

  doku_selection_class = patch 'selection_class', (func) ->
    func.apply this
    @doku_get_text = @getText
    @getText = ->
      if patching and @obj is textarea
        spec.get_text @start, @end
      else
        @doku_get_text()
    null

  doku_set_selection = patch 'setSelection', (func, selection) ->
    if patching and selection.obj is textarea
      spec.set_selection selection.start, selection.end
    else
      func selection

  patch 'setWrap', (func, obj, value) ->
    func obj, value
    spec.set_wrap value isnt 'off' if obj is textarea

  patch 'sizeCtl', (func, obj, value) ->
    func obj, value
    id = obj.attr?('id') or obj
    spec.size_ctl value if patching and id is textarea.id

  doku_submit_handler = textarea.form.onsubmit
  jQuery(textarea.form).submit (event) ->
    jQuery(textarea).val spec.get_value() if patching

  jQuery(window).resize (event) -> spec.on_resize() if patching

  disable: ->
    patching = true
    jQuery(textarea).hide()

  enable: ->
    patching = false
    jQuery(textarea).show()

  focus: -> jQuery(textarea).focus()

  get_cookie: (name) -> DokuCookie.getValue name

  get_readonly: -> jQuery(textarea).attr 'readonly'

  get_selection: ->
    selection = doku_get_selection textarea
    start: selection.start
    end: selection.end

  get_value: -> jQuery(textarea).val()

  get_wrap: -> jQuery(textarea).attr('wrap') isnt 'off'

  inner_height: -> jQuery(textarea).innerHeight()

  set_cookie: (name, value) -> DokuCookie.setValue name, value

  set_selection: (start, end) ->
    selection = new doku_selection_class()
    selection.obj = textarea
    selection.start = start
    selection.end = end
    doku_set_selection selection

  set_value: (value) -> jQuery(textarea).val value

  text_changed: ->
    window.textChanged = true
    summaryCheck()
