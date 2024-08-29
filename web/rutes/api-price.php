<?php

function api_price(): void
{
	$from = $_GET['from'];
	$to = $_GET['to'];

	header('Content-type: application/json');

	echo json_encode([
		'success' => true,
		'code' => 200,
		'result' => "Convirtiendo de $from a $to"
	]);
}
