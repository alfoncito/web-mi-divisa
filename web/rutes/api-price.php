<?php

function api_price(): void
{
	$response = null;
	$code = null;

	try {
		if (!(
			isset($_GET['from']) &&
			isset($_GET['to']) &&
			is_valid_symbol($_GET['from']) &&
			is_valid_symbol($_GET['to'])
		))
			throw new Exception('Error', 422);

		$from = strtoupper($_GET['from']);
		$to = strtoupper($_GET['to']);

		$code = 200;

		$response = [
			'success' => true,
			'code' => $code,
			'result' => Currency::price($from, $to)
		];
	} catch (Exception $e) {
		$code = $e->getCode() === 422 ? 422 : 500;
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

function is_valid_symbol(string $symbol): bool
{
	return preg_match('/^[a-z]{3}$/i', $symbol);
}
