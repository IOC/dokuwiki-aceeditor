<?php

require_once(DOKU_INC.'lib/plugins/aceeditor/action.php');

$meta['default'] = array('onoff');
$meta['highlight'] = array('onoff');
$meta['wraplimit'] = array('string', '_pattern' => '/^\s*[0-9]*\s*$/');
$meta['colortheme'] = array('multichoice', '_choices' => array(
    'ambiance',
    'chaos',
    'chrome',
    'clouds',
    'clouds_midnight',
    'cobalt',
    'crimson_editor',
    'dawn',
    'dreamweaver',
    'eclipse',
    'github',
    'idle_fingers',
    'kr_theme',
    'merbivore',
    'merbivore_soft',
    'mono_industrial',
    'monokai',
    'pastel_on_dark',
    'solarized_dark',
    'solarized_light',
    'terminal',
    'textmate',
    'tomorrow',
    'tomorrow_night',
    'tomorrow_night_blue',
    'tomorrow_night_bright',
    'tomorrow_night_eighties',
    'twilight',
    'vibrant_ink',
    'xcode',
));
if (!action_plugin_aceeditor::has_jquery()) {
    $meta['loadjquery'] = array('onoff');
}
$meta['latex'] = array('onoff');
$meta['markdown'] = array('onoff');
$meta['xmltags'] = array('string', '_pattern' => '/^(([a-z][\w.-]*)(,[a-z][\w.-]*)*|)$/i');
