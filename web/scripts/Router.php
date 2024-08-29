<?php

class Router
{
	static private array $rutes = [];
	static private Closure $default_get;
	static private string $dir;

	static public function get(string $path, Closure $func): void
	{
		array_push(self::$rutes, [
			"/^" . addcslashes($path, '/') . "(\?.*)?$/",
			$func
		]);
	}

	static public function get_default(Closure $func): void
	{
		self::$default_get = $func;
	}

	static public function public_dir(
		string $path,
		string $dir
	): void
	{
		array_push(self::$rutes, [
			"/^" . addcslashes($path, '/') . "/",
			function() use ($dir): void
			{
				$uri = $_SERVER['REQUEST_URI'];
				$file = $dir . $uri;

				if (file_exists($file))
					readfile($file);
			}
		]);
	}

	static public function rout(): void
	{
		$uri = $_SERVER['REQUEST_URI'];

		foreach(self::$rutes as list($regexp, $func)) {
			if (preg_match($regexp, $uri)) {
				$func();
				return;
			}
		}

		(self::$default_get)();
	}
}
