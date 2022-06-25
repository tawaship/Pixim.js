<?php
	if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
		exit();
	}
	
	$headers = getallheaders();
	$a = "Bearer: hoge";
	$b = $headers["X-A"];
	
	if ($a !== $b) {
		http_response_code(403);
		die();
	}
	
	if (!isset($_GET["file"])) {
		http_response_code(404);
		die();
	}
	
	$res = @file_get_contents("../". $_GET["file"]);
	if ($res === false) {
		http_response_code(403);
		die();
	}
	
	$ext = array_pop(explode('.', $_GET["file"]));
	
	$extensions = [
		"png" => "image/png",
		"jpg" => "image/jpeg",
		"json" => "application/json",
		"js" => "text/javascript",
		"mp3" => "audio/mp3"
	];
	
	if (!isset($extensions[$ext])) {
		http_response_code(403);
		die();
	}
	
	header("Content-Type: ". $extensions[$ext]);
	header("Cache-Control: max-age=3600");
	
	echo $res;