<?php

class Currency
{
	private const BASE = 'https://api.currencyapi.com/v3/';

	static public function current(): float
	{
		if (self::currencies_need_update())
			self::currencies_update();

		$fp = fopen(CURRENCIES_PATH, 'r');
		$ves_price;

		while(!feof($fp)) {
			$currency = fgetcsv($fp);

			if (strtoupper($currency[0]) === 'VES') {
				$ves_price = $currency[2];
				break;
			}
		}
		fclose($fp);
		return $ves_price;
	}

	static public function price(string $from, string $to): float
	{
		if (self::currencies_need_update())
			self::currencies_update();

		$from_price = null;
		$to_price = null;
		$price;

		$from = strtoupper($from);
		$to = strtoupper($to);

		$fp = fopen(CURRENCIES_PATH, 'rt');
		$currency = fgetcsv($fp);

		while($currency) {
			if ($currency[0] === $from)
				$from_price = (float) $currency[2];
			if ($currency[0] === $to)
				$to_price = (float) $currency[2];

			if (is_float($from_price) && is_float($to_price))
				break;
			$currency = fgetcsv($fp);
		}
		return $to_price / $from_price;
	}

	static public function get_symbols(): array
	{
		if (self::currencies_need_update())
			self::currencies_update();

		$fp = fopen(CURRENCIES_PATH, 'rt');
		$symbols = [];
		$currency = fgetcsv($fp);

		while($currency) {
			array_push($symbols, [
				'symbol' => $currency[0],
				'name' => $currency[1]
			]);
			$currency = fgetcsv($fp);
		}
		fclose($fp);
		return $symbols;
	}

	static private function currencies_need_update(): bool
	{
		if (!file_exists(CURRENCIES_PATH))
			return true;

		$date_time = new DateTime;

		$date_time->setTimestamp(filectime(CURRENCIES_PATH));
		$need_update = date('Ymd') !== $date_time->format('Ymd');
		return $need_update;
	}

	static private function currencies_update(): void
	{
		$http_query = http_build_query([
			'base_currency' => 'USD',
			'type' => 'fiat'
		]);
		$url = self::BASE . 'latest?' . $http_query;
		$latest_result = self::curl_request($url);

		$http_query = http_build_query(['type' => 'fiat']);
		$url = self::BASE . 'currencies?' . $http_query;
		$currencies_result = self::curl_request($url);

		$fp = fopen(CURRENCIES_PATH, 'w+t');
		foreach($currencies_result['data'] as $symbol => $currency) {
			$price = $latest_result['data'][$symbol]['value'];
			$name = $currency['name'];
			$symbol_native = $currency['symbol_native'];

			fputcsv($fp, [
				$symbol,
				$name,
				$price,
				$symbol_native
			]);
		}
		fclose($fp);
	}

	static public function history(): string
	{
		if (self::file_need_update(HISTORY_PATH))
			self::history_update();

		return file_get_contents(HISTORY_PATH);
	}

	static public function history_update(): void
	{
		$interval = new DateInterval('P7D');
		$date = new DateTime();
		$history = [];

		for ($i = 0; $i < 5; $i++) {
			$url = self::build_url('historical', [
				'date' => $date->format('Y-m-d'),
				'base_currency' => 'USD',
				'currencies' => 'VES',
				'type' => 'fiat'
			]);
			$history_result = self::curl_request($url);
			$str_time = $history_result['meta']['last_updated_at'];
			$value = $history_result['data']['VES']['value'];

			array_push($history, [
				'date' => date('d-m-Y', strtotime($str_time)),
				'value' => $value
			]);
			$date->sub($interval);
		}

		file_put_contents(
			HISTORY_PATH,
			json_encode($history)
		);
	}

	static private function file_need_update(string $file): bool
	{
		if (!file_exists($file))
			return true;

		$date_time = new DateTime;

		$date_time->setTimestamp(filectime($file));
		$need_update = date('Ymd') !== $date_time->format('Ymd');
		return $need_update;
	}

	static private function build_url(
		string $action,
		?array $query = null
	): string
	{
		$url = self::BASE . $action;
		if (is_array($query))
			$url .= '?' . http_build_query($query);

		return $url;
	}

	static private function curl_request(string $url): array
	{
		$ch = curl_init();

		curl_setopt_array($ch, [
			CURLOPT_URL => $url,
			CURLOPT_HEADER => false,
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_HTTPHEADER => ['apikey: ' . CURRENCY_API_KEY]
		]);

		$result = curl_exec($ch);
		curl_close($ch);
		return json_decode($result, true);
	}
}
