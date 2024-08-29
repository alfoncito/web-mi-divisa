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
	'El precio actual del bolivar es %f BS.',
	Currency::current()
);

//echo "<h1>Las monedas disponibles son:</h1>";
//
//echo sprintf(
//	"<p>Un bolivar son <b>%f</b> pesos colombianos</p>",
//	Currency::price('VES', 'COP')
//);
//
//foreach(Currency::get_symbols() as $currency)
//	printf(
//		"<p><b>%s</b>: %s</p>",
//		$currency['symbol'],
//		$currency['name']
//	);

echo '<br/>';
print_r(Currency::history());
