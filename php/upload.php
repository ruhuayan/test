<?php
//exit; // upload demo is disabled

if ( !empty( $_FILES ) ) {
    $tempPath = $_FILES[ 'file' ][ 'tmp_name' ];
    //$uploadPath = dirname( __FILE__ ) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . $_FILES[ 'file' ][ 'name' ];
    $uploadPath = "/pdf/pdfFiles/". $_FILES[ 'file' ][ 'name' ];
    
    move_uploaded_file( $tempPath, $_SERVER['DOCUMENT_ROOT'] . $uploadPath );
    //insert file into database to generate file uuid, takes 0.01so
    $answer = array('fid'=>rand(), 'filename'=> $_FILES[ 'file' ][ 'name' ], 'path' => $uploadPath, "appUid"=>$_GET['appUid']);
    $json = json_encode( $answer );

    echo $json;

} else {
    //echo 'No files';
}
?>