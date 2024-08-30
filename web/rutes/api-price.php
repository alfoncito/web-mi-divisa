<?php

function api_price(): void
{
	header('Content-type: application/json');
	$response = null;

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

		$response = [
			'success' => true,
			'code' => 200,
			'result' => Currency::price($from, $to)
		];
	} catch (Exception $e) {
		$response = [
			'success' => false,
			'code' => $e->getCode() === 422 ? 422 : 500,
			'result' => null
		];
	}

	echo json_encode($response);
}

function is_valid_symbol(string $symbol): bool
{
	return preg_match('/^[a-z]{3}$/i', $symbol);
}
