<?php

function api_history(): void
{
	header('Content-type: application/json');

	echo json_encode([
		'success' => true,
		'code' => 200,
		'result' => [
			['date' => '29-08-2024', 'value' => 36.123],
			['date' => '29-08-2024', 'value' => 36.123],
			['date' => '29-08-2024', 'value' => 36.123],
			['date' => '29-08-2024', 'value' => 36.123],
			['date' => '29-08-2024', 'value' => 36.123]
		]
	]);
}
