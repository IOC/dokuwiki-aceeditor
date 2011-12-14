<?php

$meta['highlight'] = array('onoff');
$meta['wraplimit'] = array('string', '_pattern' => '/^\s*[0-9]*\s*$/');
$meta['colortheme'] = array('multichoice', '_choices' => array(
    'chrome',
    'clouds',
    'clouds_midnight',
    'cobalt',
    'crimson_editor',
    'dawn',
    'eclipse',
    'idle_fingers',
    'kr_theme',
    'merbivore',
    'merbivore_soft',
    'mono_industrial',
    'monokai',
    'pastel_on_dark',
    'solarized_dark',
    'solarized_light',
    'textmate',
    'tomorrow',
    'tomorrow_night',
    'tomorrow_night_blue',
    'tomorrow_night_bright',
    'tomorrow_night_eighties',
    'twilight',
    'vibrant_ink',
));
if (!action_plugin_aceeditor::has_jquery()) {
    $meta['loadjquery'] = array('onoff');
}
$meta['latex'] = array('onoff');
