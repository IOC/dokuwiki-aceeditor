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
  'ace/mode/text'
  'ace/tokenizer'
], (deps...) -> (spec) ->
  [{Mode}
   {Tokenizer}] = deps

  tokenizer_rules = []
  containers = ['start', 'table']

  indent_regex = /// ^(?:
    (?:\x20{2,}|\t{1,})[\*\-][\x20\t]* # listblock
    | (?:\x20{2}|\t)(?=.) # preformatted
    | [\||\^][\x20\t]*(?=.*[\||\^][\x20\t]*$) # table
    | >{1,}[\x20\t]* # quote
  ) ///


  add_rule = (state, token, regex, next) ->
    rule = {token, regex, next, merge: true}
    tokenizer_rules[state] or= []
    tokenizer_rules[state].push rule

  create_rules = (prefix, names) ->
    _.sortBy names, (name) -> modes[name]?.sort or 1000
    for name in names
      if mode = modes[name]
        state = prefix + '-' + name
        add_rule prefix, name, mode.special if mode.special
        if mode.entry and mode.exit
          add_rule prefix, name, mode.entry, state
          add_rule state, name, mode.exit, prefix
          add_rule state, name, mode.pattern if mode.pattern
          create_rules state, mode.modes if mode.modes

  container_modes = ['listblock', 'table', 'quote', 'hr']
  formatting_modes = [
    'strong', 'emphasis', 'underline', 'monospace', 'subscript', 'superscript'
    'deleted', 'footnote', 'internallink', 'media', 'externallink', 'linebreak'
    'emaillink', 'notoc', 'nocache', 'preformatted', 'code', 'file',
    'html', 'htmlblock',  'php', 'phpblock', 'unformatted', 'unformattedalt'
    'latex-latex', 'latex-ddollar', 'latex-dollar', 'latex-displaymath'
    'latex-equation', 'latex-equationstar',
    'latex-eqnarray', 'latex-eqnarraystar'
    ]

  modes =
    listblock:
      sort: 10
      special: '^(?: {2,}|\t{1,})[\-\\*]'
      modes: formatting_modes
    preformatted:
      sort: 20
      special: '^(?:  |\t).+$'
    notoc:
      sort: 30
      special: '~~NOTOC~~'
    nocache:
      sort: 40
      special: '~~NOCACHE~~'
    header:
      sort: 50
      special: '[ \t]*={2,}.+={2,}[ \t]*$'
    table:
      sort: 60
      entry : '^[\\||\\^](?=.*[\\||\\^][ \t]*$)'
      exit: '[\\|\\^][ \t]*$'
      pattern: '[\\|\\^]|:::(?=[ \t]*[\\|\\^])'
      modes: formatting_modes
    strong:
      sort: 70
      entry: '\\*\\*'
      exit: '\\*\\*'
      pattern: '.'
    emphasis:
      sort: 80
      entry: '//'
      exit: '//'
      pattern: '.'
    underline:
      sort: 90
      entry: '__'
      exit: '__'
      pattern: '.'
    monospace:
      sort: 100
      entry: "''"
      exit: "''"
      pattern: '.'
    subscript:
      sort: 110
      entry: '<sub>'
      exit: '</sub>'
      pattern: '.'
    superscript:
      sort: 120
      entry: '<sup>'
      exit: '</sup>'
      pattern: '.'
    deleted:
      sort: 130
      entry: '<del>'
      exit: '</del>'
      pattern: '.'
    linebreak:
      sort: 140
      special: '\\\\\\\\'
    footnote:
      sort: 150
      entry: '\\(\\('
      exit: '\\)\\)'
      pattern: '.'
    hr:
      sort: 160
      special: '^[ \t]*-{4,}[ \t]*$'
    unformatted:
      sort: 170
      entry: '<nowiki>'
      exit: '</nowiki>'
      pattern: '.'
    unformattedalt:
      sort: 170
      entry: '%%'
      exit: '%%'
      pattern: '.'
    php:
      sort: 180
      entry: '<php>'
      exit: '</php>'
      pattern: '.'
    phpblock:
      sort: 180
      entry: '<PHP>'
      exit: '</PHP>'
      pattern: '.'
    html:
      sort: 190
      entry: '<html>'
      exit: '</html>'
      pattern: '.'
    htmlblock:
      sort: 190
      entry: '<HTML>'
      exit: '</HTML>'
      pattern: '.'
    code:
      sort: 200
      entry: '<code.*?>'
      exit: '</code>'
      pattern: '.'
    file:
      sort: 210
      entry: '<file.*?>'
      exit: '</file>'
      pattern: '.'
    quote:
      sort: 220
      special: '^>{1,2}'
      modes: formatting_modes
    internallink:
      sort: 300
      special: '\\[\\[.+?\\]\\]'
    media:
      sort: 320
      special: '\\{\\{.+?\\}\\}'
    externallink:
      sort: 330
      special: '(?:(?:https?|telnet|gopher|wais|ftp|ed2k|irc)://' +
        '[\\w/\\#~:.?+=&%@!\\-.:?\\-;,]+?(?=[.:?\\-;,]*' +
        '[^\\w/\\#~:.?+=&%@!\\-.:?\\-;,]|$)|(?:www|ftp)\\.' +
        '[\\w.:?\\-;,]+?\\.[\\w.:?\\-;,]+?' +
        '[\\w/\\#~:.?+=&%@!\\-.:?\\-;,]+?' +
        '(?=[.:?\\-;,]*[^\\w/\\#~:.?+=&%@!\\-.:?\\-;,]|$))'
    emaillink:
      sort: 340
      special: '<[0-9a-zA-Z!#$%&\'*+\/=?^_`{|}~-]+' +
        '(?:\\.[0-9a-zA-Z!#$%&\'*+\\/=?^_`{|}~-]+)*' +
        '@(?:[0-9a-zA-Z][0-9a-zA-Z-]*\\.)+' +
        '(?:[a-zA-Z]{2,4}|museum|travel)>'

  latex_modes =
    latex_latex:
      sort: 100
      entry: '<latex>'
      exit: '</latex>'
      pattern: '.'
    latex_ddollar:
      sort: 300
      entry: '\\$\\$'
      exit: '\\$\\$'
      pattern: '.'
    latex_dollar:
      sort: 405
      entry: '\\$'
      exit: '\\$'
      pattern: '.'
    latex_displaymath:
      sort: 405
      entry: '\\\\begin\\{displaymath\\}'
      exit: '\\\\end\\{displaymath\\}'
      pattern: '.'
    latex_equation:
      sort: 405
      entry: '\\\\begin\\{equation\\}'
      exit: '\\\\end\\{equation\\}'
      pattern: '.'
    latex_equationstar:
      sort: 405
      entry: '\\\\begin\\{equation\\*\\}'
      exit: '\\\\end\\{equation\\*\\}'
      pattern: '.'
    latex_eqnarray:
      sort: 405
      entry: '\\\\begin\\{eqnarray\\}'
      exit: '\\\\end\\{eqnarray\\}'
      pattern: '.'
    latex_eqnarraystar:
      sort: 405
      entry: '\\\\begin\\{eqnarray\\*\\}'
      exit: '\\\\end\\{eqnarray\\*\\}'
      pattern: '.'

  if spec.latex
    modes[name] = mode for name, mode of latex_modes
  create_rules 'start', _.keys(modes)
  doku_mode = new Mode()
  doku_mode.$tokenizer = new Tokenizer tokenizer_rules
  doku_mode.getNextLineIndent = (state, line, tab) ->
    indent_regex.exec(line)?[0] or ''
  doku_mode
