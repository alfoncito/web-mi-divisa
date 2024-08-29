<?php
require 'config.php';
require 'web/scripts/Currency.php';

//echo $_SERVER['REQUEST_URI'];
//echo http_build_query([
//	'base_currency' => 'USD',
//	'type' => 'fiat'
//]);
//var_dump(Currency::current());
//echo Currency::test();
//echo $_SERVER['DOCUMENT_ROOT'];

printf(
	'<p>El precio actual del bolivar es %f BS.</p>',
	Currency::current()
);

printf(
	'<p>Un bolivar son <b>%f.3</b> dolares</p>',
	Currency::price('VES', 'USD')
);

echo "<h3>Las monedas disponibles son:</h3>";
foreach(Currency::get_symbols() as $currency)
	printf(
		"<p><b>%s</b>: %s</p>",
		$currency['symbol'],
		$currency['name']
	);

$history = json_decode(Currency::history(), true);

echo '<h3>Historial</h3>';

foreach($history as $curr) {
	$v = round((float) $curr['value'], 3);
	$w = $v * 5;
	$d = $curr['date'];

	echo "<span>$d</span>";
	echo "<span style='width:{$w};height:50px;background-color:royalblue;display:inline-block;margin-left:16px;color:white;padding:8px'>{$v}</span>";
	echo "<br/>";
}
