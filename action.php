<?php
/* Ace editor plugin for Dokuwiki
 * Copyright © 2011, 2012 Institut Obert de Catalunya
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * Ths program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

if (!defined('DOKU_INC')) die();

require_once DOKU_INC.'lib/plugins/action.php';

class action_plugin_aceeditor extends DokuWiki_Action_Plugin {

    public function register(Doku_Event_Handler &$controller){
        $controller->register_hook('DOKUWIKI_STARTED', 'AFTER',
                                   $this, 'handle_dokuwiki_started');
        $controller->register_hook('TPL_METAHEADER_OUTPUT', 'BEFORE',
                                   $this, 'handle_tpl_metaheader_output');
    }

    public function handle_dokuwiki_started(Doku_Event &$event, $param) {
        global $INFO, $JSINFO;
        $wraplimit = trim($this->getConf('wraplimit'));
        $xmltags = $this->getConf('xmltags');
        $xmltags = ($xmltags ? explode(',', $xmltags) : array());
        $JSINFO['plugin_aceeditor'] = array(
            'default' => $this->getConf('default'),
            'highlight' => $this->getConf('highlight'),
            'wraplimit' => $wraplimit ? (int) $wraplimit : null,
            'colortheme' => $this->getConf('colortheme'),
            'latex' => $this->getConf('latex'),
            'markdown' => $this->getConf('markdown'),
            'mdpage' => substr($INFO['id'], -3) == '.md',
            'xmltags' => $xmltags,
        );
    }

    public function handle_tpl_metaheader_output(Doku_Event &$event, $param) {
        global $ACT;

        if (!in_array($ACT, array('edit', 'create', 'source', 'preview',
                                  'locked', 'draft', 'recover'))) {
            return;
        }

        if (!$this->has_jquery() and $this->getConf('loadjquery')) {
            $jqueryurl = '//ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js';
            $this->link_script($event, $jqueryurl);
            $this->include_script($event, '$.noConflict();');
        }

        if (file_exists(DOKU_INC.'lib/plugins/aceeditor/build.js')) {
            $this->link_script($event, DOKU_BASE.'lib/plugins/aceeditor/build.js');
        } else {
            $this->link_script($event, DOKU_BASE.'lib/plugins/aceeditor/vendor/require.js');
            $this->link_script($event, DOKU_BASE.'lib/plugins/aceeditor/scripts/init.js');
        }

        // Workaround for conflict with syntaxhighlighter3 plugin
        $this->include_script($event, 'window.require = undefined;');
    }

    public function has_jquery() {
        $version = getVersionData();
        $date = str_replace('-', '', $version['date']);
        return (int) $date > 20110525;
    }

    private function include_script($event, $code) {
        $event->data['script'][] = array(
            'type' => 'text/javascript',
            'charset' => 'utf-8',
            '_data' => $code,
        );
    }

    private function link_script($event, $url) {
        $event->data['script'][] = array(
            'type' => 'text/javascript',
            'charset' => 'utf-8',
            'src' => $url,
        );
    }
}
