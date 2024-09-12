<?php

function api_current(): void
{
	$response = null;
	$code = 0;

	try {
		$code = 200;
		$response = [
			'success' => true,
			'code' => 200,
			'result' => Currency::current()
		];
	} catch (Exception $e) {
		$code = 500;
		$response = [
			'success' => false,
			'code' => 500,
			'result' => null
		];
	}

	header('Content-type: application/json');
	http_response_code($code);

	echo json_encode($response);
}
