<?php

function api_symbols(): void
{
	$response = null;
	$code = null;

	try {
		$code = 200;
		$response = [
			'success' => true,
			'code' => $code,
			'result' => Currency::get_symbols()
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
