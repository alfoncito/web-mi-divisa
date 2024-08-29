<?php

function api_symbols(): void
{
	header('Content-type: application/json');

	echo json_encode([
		'success' => true,
		'code' => 200,
		'result' => [
			['symbol' => 'VES', 'name' => 'Bolivar soberano'],
			['symbol' => 'USD', 'name' => 'Dolar'],
			['symbol' => 'EUR', 'name' => 'Euro'],
			['symbol' => 'COP', 'name' => 'Peso colombiano']
		]
	]);
}
