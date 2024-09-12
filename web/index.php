<?php
$base = $_SERVER['DOCUMENT_ROOT'];

require "$base/config.php";
require "$base/web/scripts/Currency.php";
require "$base/web/scripts/Router.php";

require "$base/web/rutes/home.php";
require "$base/web/rutes/api-current.php";
require "$base/web/rutes/api-symbols.php";
require "$base/web/rutes/api-price.php";
require "$base/web/rutes/api-history.php";

Router::get('/', home(...));
Router::get('/api-current', api_current(...));
Router::get('/api-symbols', api_symbols(...));
Router::get('/api-price', api_price(...));
Router::get('/api-history', api_history(...));

Router::get('/test', function (): void
{
	foreach($_SERVER as $key => $value)
	{
		printf('<p>%s: %s</p>', $key, $value);
	}
});

Router::get_default(function()
{
	header('Location: /');
});

Router::public_dir(
	'/public/',
	"$base/web"
);

Router::rout();
