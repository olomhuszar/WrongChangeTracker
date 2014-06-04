<?php
$name = $_GET['name'];
$html = '<!DOCTYPE html><html>'.$_GET['html'].'</html>';
$file = 'samples/'.$name.'_'.date().'.html';
file_put_contents( $file,$html, LOCK_EX );