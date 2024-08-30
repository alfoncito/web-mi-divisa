<?php

function api_symbols(): void
{
	header('Content-type: application/json');
	$response = null;

	try {
		$response = [
			'success' => true,
			'code' => 200,
			'result' => Currency::get_symbols()
		];
	} catch (Exception $e) {
		$response = [
			'success' => false,
			'code' => 500,
			'result' => null
		];
	}
	echo json_encode($response);
}
