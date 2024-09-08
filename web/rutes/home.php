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
								<img
									src='/public/img/currency-dollar.svg'
									alt='Precio del dólar'
								/>
							</button>
							<button
								type='button'
								id='btn-exchange'
							>
								<img
									src='/public/img/currency-exchange.svg'
									alt='Conversor de monedas'
								/>
							</button>
							<button
								type='button'
								id='btn-history'
							>
								<img
									src='/public/img/graph-up.svg'
									alt='Histórico del dólar'
								/>
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
