<?php

function home(): void
{
	echo <<<HTML
		<!DOCTYPE html>
		<html lang='es'>
			<head>
				<meta charset='UTF-8' />
				<meta
					name='viewport'
					content='width=device-width,initial-scale=1.0'
				/>
				<meta
					name='description'
					content='Precio actual del bolivar soberano en dolares'
				/>
				<link rel='stylesheet' href='/public/style.css' />
				<title>Mi divisa</title>
			</head>
			<body>
				<main>
					<h1>Hola mundo</h1>
				</main>
			</body>
			<script src='/public/index.js'></script>
		</html>
	HTML;
}
