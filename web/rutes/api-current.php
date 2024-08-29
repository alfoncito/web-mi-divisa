<?php

function api_current(): void
{
	header('Content-type: application/json');

	echo json_encode([
		'success' => true,
		'code' => 200,
		'result' => 'Chanchito dev'
	]);
}
