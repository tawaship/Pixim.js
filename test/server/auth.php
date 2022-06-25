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
	
	echo $res;