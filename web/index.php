<?php
require 'config.php';
require 'web/scripts/Currency.php';
require 'web/scripts/Router.php';

require 'web/rutes/home.php';
require 'web/rutes/api-current.php';
require 'web/rutes/api-symbols.php';
require 'web/rutes/api-price.php';
require 'web/rutes/api-history.php';

Router::get('/', home(...));
Router::get('/api-current', api_current(...));
Router::get('/api-symbols', api_symbols(...));
Router::get('/api-price', api_price(...));
Router::get('/api-history', api_history(...));

Router::get_default(function()
{
	header('Location: /');
});

Router::public_dir(
	'/public/',
	$_SERVER['DOCUMENT_ROOT'] . '/web'
);

Router::rout();
