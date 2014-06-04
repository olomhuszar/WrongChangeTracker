<?php
require_once 'needAuth.php';
$taxiId = false;
if ( isset( $_GET[ 'taxiId' ] )) {
	$taxiId = mysql_real_escape_string($_GET[ 'taxiId' ]);
} //isset( $_GET[ 'taxiId' ] ) && $_GET[ 'taxiId  ' ] != ''
if( $taxiId !== false ) {
	$sql = "DELETE FROM spot_fav_ban WHERE spot_provider_id='$taxiId' AND spot_client_id = '$clientId';";
}
echo json_encode(array('token'=>$token));