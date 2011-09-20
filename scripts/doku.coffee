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

define (require) -> (spec) ->

  patching = false
  textarea = $ 'wiki__text'

  doku_current_headline_level = window.currentHeadlineLevel
  window.currentHeadlineLevel = (id) ->
    jQuery(textarea).val spec.get_value() if id is textarea.id
    doku_current_headline_level id

  doku_get_selection = window.getSelection
  window.getSelection = (obj) ->
    if patching and obj is textarea
      result = spec.get_selection()
      selection = new selection_class()
      selection.obj = textarea
      selection.start = result.start
      selection.end = result.end
      selection
    else
      doku_get_selection obj

  doku_paste_text = window.pasteText
  window.pasteText = (selection, text, opts) ->
    if patching and selection.obj is textarea
      opts or= {}
      spec.paste_text selection.start, selection.end, text
      selection.end = selection.start + text.length - (opts.endofs or 0)
      selection.start = selection.end if opts.nosel
      selection.start += (opts.startofs or 0) unless opts.nosel
      spec.set_selection selection.start, selection.end
    else
      doku_paste_text selection, text, opts

  doku_selection_class = window.selection_class
  class window.selection_class extends doku_selection_class
    getText: ->
      if patching and @obj is textarea
        spec.get_text @start, @end
      else
        super()

  doku_set_selection = window.setSelection
  window.setSelection = (selection) ->
    if patching and selection.obj is textarea
      spec.set_selection selection.start, selection.end
    else
      doku_set_selection selection

  doku_set_wrap = window.setWrap
  window.setWrap = (obj, value) ->
    doku_set_wrap obj, value
    spec.set_wrap value isnt 'off' if obj is textarea

  doku_size_ctl = window.sizeCtl
  window.sizeCtl = (edid, val) ->
    doku_size_ctl edid, val
    spec.size_ctl val if patching and edid is textarea.id

  doku_submit_handler = textarea.form.onsubmit
  addEvent textarea.form, 'submit', (event) ->
    jQuery(textarea).val spec.get_value() if patching
    if doku_submit_handler and doku_submit_handler isnt handleEvent
      # submit handler is not set with addEvent
      # in older versions of Dokuwiki
      doku_submit_handler event

  addEvent window, 'resize', (event) -> spec.on_resize() if patching

  disable: ->
    patching = true
    jQuery(textarea).hide()

  enable: ->
    patching = false
    jQuery(textarea).show()

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
