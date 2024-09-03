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
					<h1>Mi divisa</h1>
					<section class='currency'>
						<div>
							<button
								type='button'
								id='btn-current'
							>
								Precio dolar
							</button>
							<button
								type='button'
								id='btn-exchange'
							>
								Conversor
							</button>
							<button
								type='button'
								id='btn-history'
							>
								Historico
							</button>
						</div>
						<h2 id='currency-title'></h2>
						<div id='currency-body'></div>
					</section>
				</main>
			</body>
			<script src='/public/index.js'></script>
		</html>
	HTML;
}
