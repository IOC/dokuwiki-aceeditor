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

define [
  'ace/mode/text'
  'ace/tokenizer'
  'ace/mode/abap_highlight_rules'
  'ace/mode/actionscript_highlight_rules'
  'ace/mode/ada_highlight_rules'
  'ace/mode/assembly_x86_highlight_rules'
  'ace/mode/autohotkey_highlight_rules'
  'ace/mode/c_cpp_highlight_rules'
  'ace/mode/clojure_highlight_rules'
  'ace/mode/cobol_highlight_rules'
  'ace/mode/coffee_highlight_rules'
  'ace/mode/csharp_highlight_rules'
  'ace/mode/css_highlight_rules'
  'ace/mode/d_highlight_rules'
  'ace/mode/diff_highlight_rules'
  'ace/mode/dot_highlight_rules'
  'ace/mode/erlang_highlight_rules'
  'ace/mode/glsl_highlight_rules'
  'ace/mode/golang_highlight_rules'
  'ace/mode/groovy_highlight_rules'
  'ace/mode/haskell_highlight_rules'
  'ace/mode/haxe_highlight_rules'
  'ace/mode/html_highlight_rules'
  'ace/mode/ini_highlight_rules'
  'ace/mode/java_highlight_rules'
  'ace/mode/javascript_highlight_rules'
  'ace/mode/latex_highlight_rules'
  'ace/mode/lisp_highlight_rules'
  'ace/mode/lsl_highlight_rules'
  'ace/mode/lua_highlight_rules'
  'ace/mode/makefile_highlight_rules'
  'ace/mode/markdown_highlight_rules'
  'ace/mode/matlab_highlight_rules'
  'ace/mode/mysql_highlight_rules'
  'ace/mode/objectivec_highlight_rules'
  'ace/mode/ocaml_highlight_rules'
  'ace/mode/pascal_highlight_rules'
  'ace/mode/perl_highlight_rules'
  'ace/mode/pgsql_highlight_rules'
  'ace/mode/php_highlight_rules'
  'ace/mode/powershell_highlight_rules'
  'ace/mode/prolog_highlight_rules'
  'ace/mode/properties_highlight_rules'
  'ace/mode/python_highlight_rules'
  'ace/mode/ruby_highlight_rules'
  'ace/mode/scala_highlight_rules'
  'ace/mode/scheme_highlight_rules'
  'ace/mode/sh_highlight_rules'
  'ace/mode/sql_highlight_rules'
  'ace/mode/tcl_highlight_rules'
  'ace/mode/verilog_highlight_rules'
  'ace/mode/xml_highlight_rules'
  'ace/mode/yaml_highlight_rules'
], (deps...) -> (spec) ->
  [{Mode}
   {Tokenizer}
   {AbapHighlightRules}
   {ActionScriptHighlightRules}
   {AdaHighlightRules}
   {AssemblyX86HighlightRules}
   {AutoHotKeyHighlightRules}
   {c_cppHighlightRules}
   {ClojureHighlightRules}
   {CobolHighlightRules}
   {CoffeeHighlightRules}
   {CSharpHighlightRules}
   {CssHighlightRules}
   {DHighlightRules}
   {DiffHighlightRules}
   {DotHighlightRules}
   {ErlangHighlightRules}
   {glslHighlightRules}
   {GolangHighlightRules}
   {GroovyHighlightRules}
   {HaskellHighlightRules}
   {HaxeHighlightRules}
   {HtmlHighlightRules}
   {IniHighlightRules}
   {JavaHighlightRules}
   {JavaScriptHighlightRules}
   {LatexHighlightRules}
   {LispHighlightRules}
   {LSLHighlightRules}
   {LuaHighlightRules}
   {MakefileHighlightRules}
   {MarkdownHighlightRules}
   {MatlabHighlightRules}
   {MysqlHighlightRules}
   {ObjectiveCHighlightRules}
   {OcamlHighlightRules}
   {PascalHighlightRules}
   {PerlHighlightRules}
   {PgsqlHighlightRules}
   {PhpLangHighlightRules}
   {PowershellHighlightRules}
   {PrologHighlightRules}
   {PropertiesHighlightRules}
   {PythonHighlightRules}
   {RubyHighlightRules}
   {ScalaHighlightRules}
   {SchemeHighlightRules}
   {ShHighlightRules}
   {SqlHighlightRules}
   {TclHighlightRules}
   {VerilogHighlightRules}
   {XmlHighlightRules}
   {YamlHighlightRules}] = deps

  indent_regex = /// ^(?:
    (?:\x20{2,}|\t{1,})[\*\-][\x20\t]* # listblock
    | (?:\x20{2}|\t)(?=.) # preformatted
    | >{1,}[\x20\t]* # quote
  ) ///

  lang_rules =
    abap: AbapHighlightRules
    actionscript: ActionScriptHighlightRules
    actionscript3: ActionScriptHighlightRules
    ada: AdaHighlightRules
    asm: AssemblyX86HighlightRules
    autohotkey: AutoHotKeyHighlightRules
    bash: ShHighlightRules
    c: c_cppHighlightRules
    clojure: ClojureHighlightRules
    cobol: CobolHighlightRules
    coffeescript: CoffeeHighlightRules
    cpp: c_cppHighlightRules
    csharp: CSharpHighlightRules
    css: CssHighlightRules
    d: DHighlightRules
    diff: DiffHighlightRules
    dot: DotHighlightRules
    ecmascript: JavaScriptHighlightRules
    erlang: ErlangHighlightRules
    glsl: glslHighlightRules
    go: GolangHighlightRules
    groovy: GroovyHighlightRules
    haskell: HaskellHighlightRules
    haxe: HaxeHighlightRules
    html: HtmlHighlightRules
    html4strict: HtmlHighlightRules
    html5: HtmlHighlightRules
    ini: IniHighlightRules
    java: JavaHighlightRules
    java5: JavaHighlightRules
    javascript: JavaScriptHighlightRules
    latex: LatexHighlightRules
    lisp: LispHighlightRules
    lsl2: LSLHighlightRules
    lua: LuaHighlightRules
    make: MakefileHighlightRules
    markdown: MarkdownHighlightRules
    matlab: MatlabHighlightRules
    mysql: MysqlHighlightRules
    objc: ObjectiveCHighlightRules
    ocaml: OcamlHighlightRules
    pascal: PascalHighlightRules
    perl: PerlHighlightRules
    pgsql: PgsqlHighlightRules
    php: PhpLangHighlightRules
    powershell: PowershellHighlightRules
    prolog: PrologHighlightRules
    properties: PropertiesHighlightRules
    python: PythonHighlightRules
    ruby: RubyHighlightRules
    scala: ScalaHighlightRules
    scheme: SchemeHighlightRules
    sql: SqlHighlightRules
    tcl: TclHighlightRules
    verilog: VerilogHighlightRules
    xml: XmlHighlightRules
    yaml: YamlHighlightRules

  tokenizer_rules = {}
  inline_rules = []
  container_states = []

  def_rule = (state, regex, token, next, nextState) ->
    (tokenizer_rules[state] or= []).push {regex, token, next, nextState, merge: on}

  def_base = (regex, token, next) ->
    def_rule 'start', regex, token, next

  def_inline = (regex, token, next) ->
    def_base regex, token, next
    inline_rules.push _.last tokenizer_rules['start']

  def_format = (name, open_regex, close_regex, tag_token, content_token) ->
    tag_token ?= 'keyword.operator'
    def_inline open_regex, tag_token, name
    def_rule name, close_regex, tag_token, 'start'
    def_rule name, ".", content_token if content_token

  def_block = (name, open_regex, close_regex, token) ->
    def_inline open_regex, token, name
    def_rule name, close_regex, token, 'start'

  def_embed = (name, open_regex, close_regex, token, lang) ->
    def_inline "(?=#{open_regex})", token, name
    def_rule name, open_regex, token, "#{name}-start"
    rules = new lang_rules[lang]().getRules()
    embed_rules rules, "#{name}-", [{regex: close_regex, token, next: 'start'}]

  def_container = (name, regex, token) ->
    def_base regex, token, "#{name}-start"
    container_states.push name

  def_directive = (name, params=[]) ->
    state_id = "drective-#{name}-id"
    state_offset = "drective-#{name}-offset"
    state_params = "drective-#{name}-params"
    token_valid = ['keyword.operator', 'keyword', 'keyword.operator']
    token_invalid = ['keyword.operator', 'keyword.invalid', 'keyword.operator']
    def_base "^(::)(#{name})(:)", token_valid, state_id
    def_rule state_id, '\\s*$|^', 'text', state_params
    def_rule state_id, '.+', 'keyword.invalid' if 'id' not in params
    if 'offset' in params
      def_rule state_params, '^(  :)(offset)(:)', token_valid, state_offset
      def_rule state_offset, '\\s*-?\\d+\\s*$', 'constant.numeric', state_params
      def_rule state_offset, '.+$', 'keyword.invalid', state_params
    for param in _(params).without 'id', 'offset'
      def_rule state_params, "^(  :)(#{param})(:)", token_valid
    def_rule state_params, '^(  :)(.+?)(:)', token_invalid
    def_rule state_params, '^', 'text', 'start'

  embed_rules = (rules, prefix, escape_rules) ->
    for name, state of rules
      state = (_.clone rule for rule in state)
      for rule in state
        if rule.nextState
          rule.nextState = prefix + rule.nextState
        else if typeof rule.next is 'string'
          rule.next = prefix + rule.next
      escape_rules = (_.clone rule for rule in escape_rules)
      tokenizer_rules[prefix + name] = escape_rules.concat state

  # 5 quiz
  def_container 'quiz', '<quiz>', 'keyword'
  def_rule 'quiz-start', '^(?: {2,}|\t{1,})[\-\\*]', 'markup.list'
  def_rule 'quiz-start', '</quiz>', 'keyword', 'start'
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
  def_container 'table', '^[\\|\\^]', 'keyword.operator'
  def_rule 'table-start', '[\\|\\^]', 'keyword.operator'
  def_rule 'table-start', '[\t ]*:::[\t ]*(?=[\\|\\^])', 'keyword.operator'
  def_rule 'table-start', '[\t ]+', 'text'
  def_rule 'table-start', '$', 'text', 'start'
  # 69 markdown
  def_embed 'markdown', '<markdown>', '</markdown>', 'keyword', 'markdown' if spec.markdown
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
  def_format 'footnote', '\\(\\(', '\\)\\)'
  # 160 hr
  def_base '^[ \t]*-{4,}[ \t]*$', 'keyword.operator'
  # 170 unformatted
  def_format 'unformatted', '<nowiki>', '</nowiki>', 'comment', 'comment'
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
  # 195 note
  def_container 'note', '<note>', 'keyword'
  def_rule 'note-start', '</note>', 'keyword', 'start'
  # 200 code
  for lang  in _.keys(lang_rules)
    def_embed "code-#{lang}", "<code #{lang}(?:\\s.*?)?>", '</code>', 'keyword', lang
  def_block 'code', '<code.*?>', '</code>', 'keyword'
  # 210 file
  for lang  in _.keys(lang_rules)
    def_embed "file-#{lang}", "<file #{lang}(?:\\s.*?)?>", '</file>', 'keyword', lang
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
  def_inline '\\{\\{ ?(?=.*\\}\\})', 'keyword.operator', 'media-ref'
  def_rule 'media-ref', '\\}\\}', 'keyword.operator', 'start'
  def_rule 'media-ref', '\\?', 'keyword.operator', 'media-param'
  def_rule 'media-ref', '\\|', 'keyword.operator', 'media-title'
  def_rule 'media-ref', '.+?(?=\\?|\\||\\}\\})', 'markup.underline'
  def_rule 'media-param', '&', 'keyword.operator'
  def_rule 'media-param', '\\|', 'keyword.operator', 'media-title'
  def_rule 'media-param', '\\}\\}', 'keyword.operator', 'start'
  def_rule 'media-param', '[0-9]+(?=&|\\||\\}\\})', 'constant.numeric'
  def_rule 'media-param', '([0-9]+)(x)([0-9]+)(?=&|\\||\\}\\})',
    ['constant.numeric', 'keyword.operator', 'constant.numeric']
  def_rule 'media-param', '(?:direct|nolink|linkonly|nocache|recache)(?=&|\\||\\}\\})', 'consant'
  def_rule 'media-param', '.+?(?=&|\\||\\}\\})', 'keyword.invalid'
  def_rule 'media-title', '\\}\\}', 'keyword.operator', 'start'
  def_rule 'media-title', '/(?=[^/]*?\\}\\})', 'keyword.operator', 'media-offset'
  def_rule 'media-title', '.+?(?=/|\\}\\})', 'string'
  def_rule 'media-offset', '\\}\\}', 'keyword.operator', 'start'
  def_rule 'media-offset', '-?\\d+(?=\\}\\})', 'constant.numeric'
  def_rule 'media-offset', '.+?(?=\\}\\})', 'keyword.invalid'
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
  # 500 directives
  def_directive 'table', ['id', 'title', 'footer', 'large', 'small', 'vertical']
  def_directive 'accounting', ['id', 'title', 'footer', 'widths']
  def_directive 'figure', ['id', 'title', 'copyright', 'license', 'footer', 'large']
  def_directive 'text', ['offset', 'title', 'large']
  def_directive 'note', ['offset']
  def_directive 'reference', ['offset']
  def_directive 'quote'
  def_directive 'important'
  def_directive 'example', ['title']
  def_base '^(::)(.+?)(:)',
    ['keyword.operator', 'keyword.invalid', 'keyword.operator']
  def_base '^:::\s*$', 'keyword.operator'
  def_inline '(:)(table|figure)(:)(.+?)(:)',
    ['keyword.operator', 'keyword', 'keyword.operator', 'text', 'keyword.operator']
  # 513 newcontent
  def_inline '<newcontent>', 'keyword'
  def_inline '</newcontent>', 'keyword'

  # Additional XML-like tags
  for name in spec.xmltags
    def_block name, "<#{name}(?:\\s.*?)?>", "<\\/#{name}>", 'keyword'

  copy_rules = (state, prefix, rules) ->
    rules ?= tokenizer_rules[state]
    for rule in rules
      next = nextState = copyState = null
      if rule.nextState
        next = rule.next
        nextState = prefix + rule.nextState
        copyState = rule.nextState
      else if typeof rule.next is 'string'
        next = prefix + rule.next
        copyState = rule.next
      def_rule prefix + state, rule.regex, rule.token, next, nextState
      copy_rules copyState, prefix if copyState and not tokenizer_rules[prefix + copyState]

  for state in container_states
    copy_rules 'start', state + "-", inline_rules

  doku_mode = new Mode()
  doku_mode.$tokenizer = new Tokenizer tokenizer_rules
  doku_mode.getNextLineIndent = (state, line, tab) ->
    indent_regex.exec(line)?[0] or ''
  doku_mode
