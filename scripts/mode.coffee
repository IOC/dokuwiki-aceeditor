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
  'ace/mode/c_cpp_highlight_rules'
  'ace/mode/csharp_highlight_rules'
  'ace/mode/css_highlight_rules'
  'ace/mode/groovy_highlight_rules'
  'ace/mode/html_highlight_rules'
  'ace/mode/java_highlight_rules'
  'ace/mode/javascript_highlight_rules'
  'ace/mode/latex_highlight_rules'
  'ace/mode/lua_highlight_rules'
  'ace/mode/perl_highlight_rules'
  'ace/mode/php_highlight_rules'
  'ace/mode/python_highlight_rules'
  'ace/mode/ruby_highlight_rules'
  'ace/mode/scala_highlight_rules'
  'ace/mode/text_highlight_rules'
  'ace/mode/xml_highlight_rules'
], (deps...) -> (spec) ->
  [{Mode}
   {Tokenizer}
   {c_cppHighlightRules}
   {CSharpHighlightRules}
   {CssHighlightRules}
   {GroovyHighlightRules}
   {HtmlHighlightRules}
   {JavaHighlightRules}
   {JavaScriptHighlightRules}
   {LatexHighlightRules}
   {LuaHighlightRules}
   {PerlHighlightRules}
   {PhpHighlightRules}
   {PythonHighlightRules}
   {RubyHighlightRules}
   {ScalaHighlightRules}
   {TextHighlightRules}
   {XmlHighlightRules}] = deps

  indent_regex = /// ^(?:
    (?:\x20{2,}|\t{1,})[\*\-][\x20\t]* # listblock
    | (?:\x20{2}|\t)(?=.) # preformatted
    | [\||\^][\x20\t]*(?=.*[\||\^][\x20\t]*$) # table
    | >{1,}[\x20\t]* # quote
  ) ///

  lang_rules =
    c: c_cppHighlightRules
    cpp: c_cppHighlightRules
    csharp: CSharpHighlightRules
    css: CssHighlightRules
    groovy: GroovyHighlightRules
    html: HtmlHighlightRules
    java: JavaHighlightRules
    javascript: JavaScriptHighlightRules
    latex: LatexHighlightRules
    lua: LuaHighlightRules
    perl: PerlHighlightRules
    php: PhpHighlightRules
    python: PythonHighlightRules
    ruby: RubyHighlightRules
    scala: ScalaHighlightRules
    xml: XmlHighlightRules

  highlighter = new TextHighlightRules
  highlighter.$rules = []

  inline_rules = []
  container_states = []
  lang_embeds = []

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

  def_block = (name, open_regex, close_regex, token) ->
    def_inline open_regex, token, name
    def_rule name, close_regex, token, 'start'

  def_embed = (name, open_regex, close_regex, token, lang) ->
    def_inline open_regex, token, "#{name}-start"
    lang_embeds.push [lang_rules[lang], "#{name}-",
      [{regex: close_regex, token, next: 'start'}]]

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
  def_embed 'latex-latex', '<latex>', '</latex>', 'keyword', 'latex' if spec.latex
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
  def_embed 'php', '<php>', '</php>', 'keyword', 'php'
  # 180 phpblock
  def_embed 'phpblock', '<PHP>', '</PHP>', 'keyword', 'php'
  # 190 html
  def_embed 'html', '<html>', '</html>', 'keyword', 'html'
  # 190 htmlblock
  def_embed 'htmlblock', '<HTML>', '</HTML>', 'keyword', 'html'
  # 200 code
  for lang  in _.keys(lang_rules)
    def_embed "code-#{lang}", "<code #{lang}>", '</code>', 'keyword', lang
  def_block 'code', '<code.*?>', '</code>', 'keyword'
  # 210 file
  for lang  in _.keys(lang_rules)
    def_embed "file-#{lang}", "<file #{lang}(?: .*?)?>", '</file>', 'keyword', lang
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
  def_embed 'latex-ddollar', '\\$\\$', '\\$\\$', 'keyword', 'latex' if spec.latex
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
    def_embed 'latex-dollar', '\\$', '\\$', 'keyword', 'latex'
    def_embed 'latex-displaymath', '\\\\begin\\{displaymath\\}',
      '\\\\end\\{displaymath\\}', 'keyword', 'latex'
    def_embed 'latex-equation', '\\\\begin\\{equation\\}',
      '\\\\end\\{equation\\}', 'keyword', 'latex'
    def_embed 'latex-equationstar', '\\\\begin\\{equation\\*\\}',
      '\\\\end\\{equation\\*\\}', 'keyword', 'latex'
    def_embed 'latex-eqnarray', '\\\\begin\\{eqnarray\\}',
      '\\\\end\\{eqnarray\\}', 'keyword', 'latex'
    def_embed 'latex-eqnarraystar', '\\\\begin\\{eqnarray\\*\\}',
      '\\\\end\\{eqnarray\\*\\}', 'keyword', 'latex'

  copy_rules = (state, prefix, rules) ->
    rules ?= highlighter.$rules[state]
    for rule in highlighter.$rules
      next = if rule.next then "#{prefix}-#{rule.next}"
      def_rule "#{prefix}-#{state}", rule.regex, rule.token, next
      copy_rules rule.next, prefix if rule.next and not highlighter.$rules[next]

  do ->
    for args in lang_embeds
      highlighter.embedRules args...
    for state in container_states
      copy_rules 'start', state, inline_rules

  doku_mode = new Mode()
  doku_mode.$tokenizer = new Tokenizer highlighter.getRules()
  doku_mode.getNextLineIndent = (state, line, tab) ->
    indent_regex.exec(line)?[0] or ''
  doku_mode
