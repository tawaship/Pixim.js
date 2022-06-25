<?php
	header("Access-Control-Allow-Origin: *");
	
	require_once("../../php/Utils.php");
	if (is_null(Utils::getUser())) {
		echo "だめです";
		die();
	}
	
	$path = $_GET["file"];
	$file = @file_get_contents("../../static/". $path);
	if ($file === false) {
		http_response_code(404);
		die();
	}
	
	$ext = array_pop(explode('.', $path));
	
	$extensions = [
		"png" => "image/png",
		"jpg" => "image/jpeg",
		"json" => "text/plane",
		"js" => "text/javascript",
		"mp3" => "audio/mp3"
	];
	
	if (!isset($extensions[$ext])) {
		http_response_code(403);
		die();
	}
	
	header("Content-Type: ". $extensions[$ext]);
	header("Cache-Control: max-age=3600");
	
	echo $file;