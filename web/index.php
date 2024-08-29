<?php
require 'config.php';
require 'web/scripts/Currency.php';
require 'web/scripts/Router.php';

//echo $_SERVER['REQUEST_URI'];
//echo http_build_query([
//	'base_currency' => 'USD',
//	'type' => 'fiat'
//]);
//var_dump(Currency::current());
//echo Currency::test();
//echo $_SERVER['DOCUMENT_ROOT'];

/*
printf(
	'<p>El precio actual del bolivar es %f BS.</p>',
	Currency::current()
);

printf(
	'<p>Un bolivar son <b>%f.3</b> dolares</p>',
	Currency::price('VES', 'USD')
);

echo "<h3>Las monedas disponibles son:</h3>";
echo '<table><tbody>';
foreach(Currency::get_symbols() as $currency)
	printf(
		"<tr><td><b>%s</b></td><td>%s</td></tr>",
		$currency['symbol'],
		$currency['name']
	);
echo '</tbody></table>';

$history = json_decode(Currency::history(), true);

echo '<h3>Historial</h3>';

foreach($history as $curr) {
	$v = round((float) $curr['value'], 3);
	$w = $v * 10;
	$d = $curr['date'];

	echo "<span>$d</span>";
	echo "<span style='width:{$w};height:30px;background-color:royalblue;display:inline-block;margin:16px;color:white;padding:8px'>{$v}</span>";
	echo "<br/>";
}
*/

Router::get('/', function(): void
{
	echo '<h1>Hola, bienvenido a my web</h1>',
		'<script src="/public/index.js"></script>';
});

Router::get('/contacto', function(): void
{
	echo '<h1>Esta es mi pagina de contacto</h1>';
});

Router::get('/tienda', function(): void
{
	echo '<h1>Esta es mi tienda, mira lo que gustes.</h1>';
});

Router::get_default(function(): void
{
	echo "
		<h1>Parece que estas perdido</h1>
		<a href='/'>Regresar</a>
	";
});

Router::public_dir(
	'/public/',
	$_SERVER['DOCUMENT_ROOT'] . '/web'
);

Router::rout();
