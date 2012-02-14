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

ini_set('display_errors', 0);

if(!defined('DOKU_INC')) define('DOKU_INC',dirname(__FILE__).'/../../../');

require_once DOKU_INC . 'inc/init.php';
require_once DOKU_INC . 'inc/parser/xhtml.php';

header('Content-Type', 'text/plain');

$renderer = new Doku_Renderer_xhtml();
$xhtml = $renderer->render($_GET['text']);

if (preg_match('/<img src="(.*?\?media=(.*?))"/', $xhtml, $matches)) {
    $url = $matches[1];
    $path = mediaFN($matches[2]);
} else {
    $url = DOKU_BASE . "lib/plugins/latex/images/renderfail.png";
    $path = DOKU_INC . "lib/plugins/latex/images/renderfail.png";
}

$size = getimagesize($path);
$data = array(
    'url' => $url,
    'width' => $size[0],
    'height' => $size[1],
);
echo json_encode($data);
