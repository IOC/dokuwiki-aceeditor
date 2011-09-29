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
  'ace/mode/html_highlight_rules'
  'ace/mode/latex_highlight_rules'
  'ace/mode/php_highlight_rules'
  'ace/mode/text_highlight_rules'
  'ace/mode/text'
  'ace/tokenizer'
], (deps...) -> (spec) ->
  [{HtmlHighlightRules}
   {LatexHighlightRules}
   {PhpHighlightRules}
   {TextHighlightRules}
   {Mode}
   {Tokenizer}] = deps

  indent_regex = /// ^(?:
    (?:\x20{2,}|\t{1,})[\*\-][\x20\t]* # listblock
    | (?:\x20{2}|\t)(?=.) # preformatted
    | [\||\^][\x20\t]*(?=.*[\||\^][\x20\t]*$) # table
    | >{1,}[\x20\t]* # quote
  ) ///

  highlighter = new TextHighlightRules
  highlighter.$rules = []

  inline_rules = []
  container_states = []

  def_rule = (state, regex, token, next) ->
    (highlighter.$rules[state] or= []).push {regex, token, next}

  def_base = (regex, token, next) ->
    def_rule 'start', regex, token, next

  def_inline = (regex, token, next) ->
    def_rule 'start', regex, token, next
    inline_rules.push _.last highlighter.$rules['start']

  def_format = (name, open_regex, close_regex, tag_token, content_token) ->
    tag_token ?= 'keyword.operator'
    content_token ?= 'text'
    def_inline open_regex, tag_token, name
    def_rule name, "(.*?)(#{close_regex})", [content_token, tag_token], 'start'
    def_rule name, '.+$', content_token

  def_block = (name, open_regex, close_regex, token, rules) ->
    if rules
      def_inline open_regex, token, "#{name}-start"
      highlighter.embedRules rules, "#{name}-",
        [{regex: close_regex, token, next: 'start'}]
    else
      def_inline open_regex, token, name
      def_rule name, close_regex, token, 'start'

  def_container = (name, regex, token) ->
    def_rule 'start', regex, token, "#{name}-start"
    container_states.push name

  # 10 listblock
  def_base '^(?: {2,}|\t{1,})[\-\\*]', 'markup.list'
  # 20 preformatted
  def_base '^(?:  |\t).+$', 'text'
  # 30 notoc
  def_inline '~~NOTOC~~', 'keyword'
  # 40 nocache
  def_inline '~~NOCACHE~~', 'keyword'
  # 50 header
  def_base '[ \t]*={2,}.+={2,}[ \t]*$', 'markup.heading'
  # 60 table
  def_container 'table', '^[\\||\\^](?=.*[\\||\\^][ \t]*$)', 'keyword.operator'
  def_rule 'table-start', '[\\|\\^][ \t]*$', 'keyword.operator', 'start'
  def_rule 'table-start', '[\\|\\^]|:::(?=[ \t]*[\\|\\^])', 'keyword.operator'
  # 70 strong
  def_format 'strong', '\\*\\*', '\\*\\*'
  # 80 emphasis
  def_format 'emphasis', '//', '//'
  # 90 underline
  def_format 'underline', '__', '__'
  # 100 monospace
  def_format 'monospace', "''", "''"
  # 100 latex
  def_block 'latex-latex', '<latex>', '</latex>', 'keyword', LatexHighlightRules if spec.latex
  # 110 subscript
  def_format 'subscript', '<sub>', '</sub>'
  # 120 superscript
  def_format 'superscript', '<sup>', '</sup>'
  # 130 deleted
  def_format 'subscript', '<del>', '</del>'
  # 140 linebreak
  def_inline '\\\\\\\\', 'keyword.operator'
  # 150 footnote
  def_format '\\(\\(', '\\)\\)'
  # 160 hr
  def_base '^[ \t]*-{4,}[ \t]*$', 'keyword.operator'
  # 170 unformatted
  def_format 'unformatted', '<nowiki>', '</nowki>', 'comment', 'comment'
  # 170 unformattedalt
  def_format 'unformattedalt', '%%', '%%', 'comment', 'comment'
  # 180 php
  def_block 'php', '<php>', '</php>', 'keyword', PhpHighlightRules
  # 180 phpblock
  def_block 'phpblock', '<PHP>', '</PHP>', 'keyword', PhpHighlightRules
  # 190 html
  def_block 'html', '<html>', '</html>', 'keyword', HtmlHighlightRules
  # 190 htmlblock
  def_block 'htmlblock', '<HTML>', '</HTML>', 'keyword', HtmlHighlightRules
  # 200 code
  def_block 'code', '<code.*?>', '</code>', 'keyword'
  # 210 file
  def_block 'file', '<file.*?>', '</file>', 'keyword'
  # 220 quote
  def_base '^>{1,2}', 'keyword.operator'
  # 300 internallink
  def_inline '\\[\\[(?=.*\\]\\])', 'keyword.operator', 'internallink-ref'
  def_rule 'internallink-ref', '\\]\\]', 'keyword.operator', 'start'
  def_rule 'internallink-ref', '\\|', 'keyword.operator', 'internallink-title'
  def_rule 'internallink-ref', '.+?(?=\\||\\]\\])', 'markup.underline'
  def_rule 'internallink-title', '\\]\\]', 'keyword.operator', 'start'
  def_rule 'internallink-title', '.+?(?=\\]\\])', 'string'
  # 300 latex
  def_block 'latex-ddollar', '\\$\\$', '\\$\\$', 'keyword', LatexHighlightRules if spec.latex
  # 320 media
  def_inline '\\{\\{(?=.*\\}\\})', 'keyword.operator', 'media-ref'
  def_rule 'media-ref', '\\}\\}', 'keyword.operator', 'start'
  def_rule 'media-ref', '\\?', 'keyword.operator', 'media-width'
  def_rule 'media-ref', '\\|', 'keyword.operator', 'media-title'
  def_rule 'media-ref', '.+?(?=\\?|\\||\\}\\})', 'markup.underline'
  def_rule 'media-width', '[0-9]+', 'constant.numeric'
  def_rule 'media-width', 'x', 'keyword.operator', 'media-height'
  def_rule 'media-width', '\\|', 'keyword.operator', 'media-title'
  def_rule 'media-width', '\\}\\}', 'keyword.operator', 'start'
  def_rule 'media-width', '.+?', 'keyword.invalid'
  def_rule 'media-height', '[0-9]+', 'constant.numeric'
  def_rule 'media-height', '\\|', 'keyword.operator', 'media-title'
  def_rule 'media-height', '\\}\\}', 'keyword.operator', 'start'
  def_rule 'media-height', '.+?', 'keyword.invalid'
  def_rule 'media-title', '\\}\\}', 'keyword.operator', 'start'
  def_rule 'media-title', '.+?(?=\\}\\})', 'string'
  # 330 externallink
  def_inline '(?:(?:https?|telnet|gopher|wais|ftp|ed2k|irc)://' +
    '[\\w/\\#~:.?+=&%@!\\-.:?\\-;,]+?(?=[.:?\\-;,]*' +
    '[^\\w/\\#~:.?+=&%@!\\-.:?\\-;,]|$)|(?:www|ftp)\\' +
    '[\\w.:?\\-;,]+?\\.[\\w.:?\\-;,]+?' +
    '[\\w/\\#~:.?+=&%@!\\-.:?\\-;,]+?' +
    '(?=[.:?\\-;,]*[^\\w/\\#~:.?+=&%@!\\-.:?\\-;,]|$))',
    'markup.underline'
  # 340 emaillink
  def_inline '(<)([0-9a-zA-Z!#$%&\'*+\/=?^_`{|}~-]+' +
    '(?:\\.[0-9a-zA-Z!#$%&\'*+\\/=?^_`{|}~-]+)*' +
    '@(?:[0-9a-zA-Z][0-9a-zA-Z-]*\\.)+' +
    '(?:[a-zA-Z]{2,4}|museum|travel))(>)',
    ['keyword.operator', 'markup.underline', 'keyword.operator']
  # 405 latex
  if spec.latex
    def_block 'latex-dollar', '\\$', '\\$', 'keyword', LatexHighlightRules
    def_block 'latex-displaymath', '\\\\begin\\{displaymath\\}',
      '\\\\end\\{displaymath\\}', 'keyword', LatexHighlightRules
    def_block 'latex-equation', '\\\\begin\\{equation\\}',
      '\\\\end\\{equation\\}', 'keyword', LatexHighlightRules
    def_block 'latex-equationstar', '\\\\begin\\{equation\\*\\}',
      '\\\\end\\{equation\\*\\}', 'keyword', LatexHighlightRules
    def_block 'latex-eqnarray', '\\\\begin\\{eqnarray\\}',
      '\\\\end\\{eqnarray\\}', 'keyword', LatexHighlightRules
    def_block 'latex-eqnarraystar', '\\\\begin\\{eqnarray\\*\\}',
      '\\\\end\\{eqnarray\\*\\}', 'keyword', LatexHighlightRules

  copy_rules = (state, prefix, rules) ->
    console.log state, prefix
    rules ?= highlighter.$rules[state]
    for rule in rules
      next = if rule.next then "#{prefix}-#{rule.next}"
      def_rule "#{prefix}-#{state}", rule.regex, rule.token, next
      copy_rules rule.next, prefix if rule.next and not highlighter.$rules[next]

  do ->
    for state in container_states
      copy_rules 'start', state, inline_rules

  doku_mode = new Mode()
  doku_mode.$tokenizer = new Tokenizer highlighter.getRules()
  doku_mode.getNextLineIndent = (state, line, tab) ->
    indent_regex.exec(line)?[0] or ''
  doku_mode
