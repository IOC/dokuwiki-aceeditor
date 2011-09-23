<?php

$meta['highlight'] = array('onoff');
$meta['wraplimit'] = array('string', '_pattern' => '/^\s*[0-9]*\s*$/');
$meta['colortheme'] = array('multichoice', '_choices' => array('light', 'dark'));
if (!action_plugin_aceeditor::has_jquery()) {
    $meta['loadjquery'] = array('onoff');
}
$meta['latex'] = array('onoff');
