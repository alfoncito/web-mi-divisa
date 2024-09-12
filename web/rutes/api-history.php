<?php

function api_history(): void
{
	$response = null;
	$code = null;

	try {
		$code = 200;
		$response = [
			'success' => true,
			'code' => $code,
			'result' => Currency::history()
		];
	} catch (Exception $e) {
		$code = 500;
		$response = [
			'success' => false,
			'code' => $code,
			'result' => null
		];
	}

	header('Content-type: application/json');
	http_response_code($code);
	echo json_encode($response);
}
