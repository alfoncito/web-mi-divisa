<?php

class Currency
{
	private const BASE = 'https://api.currencyapi.com/v3/';

	static public function current(): float
	{
		if (self::file_need_update(CURRENCIES_PATH))
			self::currencies_update();

		$fp = fopen(CURRENCIES_PATH, 'r');
		$ves_price = null;

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
		if (self::file_need_update(CURRENCIES_PATH))
			self::currencies_update();

		$from_price = null;
		$to_price = null;
		$price = null;

		$from = strtoupper($from);
		$to = strtoupper($to);

		$fp = fopen(CURRENCIES_PATH, 'rt');
		$currency = fgetcsv($fp);

		while($currency) {
			if ($currency[0] === $from)
				$from_price = (float) $currency[2];
			if ($currency[0] === $to)
				$to_price = (float) $currency[2];

			if (is_float($from_price) && is_float($to_price)) {
				fclose($fp);
				return $to_price / $from_price;
			}
			$currency = fgetcsv($fp);
		}

		fclose($fp);
		throw new Exception('Error', 422);
	}

	static public function get_symbols(): array
	{
		if (self::file_need_update(CURRENCIES_PATH))
			self::currencies_update();

		$fp = fopen(CURRENCIES_PATH, 'rt');
		$currency = fgetcsv($fp);
		$symbols = [];

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

	static private function currencies_update(): void
	{
		try {
			$latest_result = self::curl_request('latest', [
				'base_currency' => 'USD',
				'type' => 'fiat'
			]);
			$curr_result = self::curl_request('currencies', [
				'type' => 'fiat'
			]);
			$fp = fopen(CURRENCIES_PATH, 'w+t');

			ksort($curr_result['data']);
			foreach($curr_result['data'] as $symbol => $currency) {
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
		} catch (Exception $e) {
			if (!file_exists(CURRENCIES_PATH))
				throw $e;
		}
	}

	static public function history(): array
	{
		if (self::file_need_update(HISTORY_PATH))
			self::history_update();

		$json = file_get_contents(HISTORY_PATH);
		return json_decode($json, true);
	}

	static private function file_need_update(string $file): bool
	{
		// Temporal
		return false;

		if (!file_exists($file))
			return true;

		$c_time = filectime($file);
		$date_time = new DateTime("@$c_time");

		$need_update = date('Ymd') !== $date_time->format('Ymd');
		return $need_update;
	}

	static public function history_update(): void
	{
		try {
			$interval = new DateInterval('P7D');
			$date = new DateTime();
			$history = [];

			$date->sub(new DateInterval('P1D'));
			for ($i = 0; $i < 5; $i++) {
				$history_result = self::curl_request('historical', [
					'date' => $date->format('Y-m-d'),
					'base_currency' => 'USD',
					'currrencies' => 'VES',
					'type' => 'fiat'
				]);
				$str_time = $history_result['meta']['last_updated_at'];
				$value = $history_result['data']['VES']['value'];

				array_push($history, [
					'date' => date('d-m-Y', strtotime($str_time)),
					'value' => $value
				]);
				$date->sub($interval);
			}

			$history = array_reverse($history);
			file_put_contents(HISTORY_PATH, json_encode($history));
		} catch (Exception $e) {
			if (!file_exists(HISTORY_PATH))
				throw $e;
		}
	}

	static private function curl_request(
		string $action,
		?array $query = null
	): array
	{
		$url = self::build_url($action, $query);
		$ch = curl_init();

		curl_setopt_array($ch, [
			CURLOPT_URL => $url,
			CURLOPT_HEADER => false,
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_HTTPHEADER => ['apikey: ' . CURRENCY_API_KEY]
		]);

		$result = curl_exec($ch);
		$res_code = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
		curl_close($ch);

		if ($res_code !== 200)
			throw new Exception('Error', $res_code);
		return json_decode($result, true);
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
}
