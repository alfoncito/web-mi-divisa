const main = () => {
	// testApi();
	currencyApp();
};

const currencyApp = () => {
	let $title = getElm('currency-title'),
		$body = getElm('currency-body'),
		$btnCurrent = getElm('btn-current'),
		$btnExchange = getElm('btn-exchange'),
		$btnHistory = getElm('btn-history'),
		changeHandler;

	const changeTo = (title, tab) => () => {
		changeHandler?.();
		changeHandler = null;
		
		$title.textContent = title;
		$body.innerHTML = '';

		tab($body, onChange);
	};

	const onChange = (cb) => {
		changeHandler = cb;
	}

	$btnCurrent.addEventListener(
		'click',
		changeTo('Precio del dia', currentTab)
	);
	$btnExchange.addEventListener(
		'click',
		changeTo('Conversor', exchangeTab)
	);
	$btnHistory.addEventListener('click',
		changeTo('Historico del dolar', historyTab)
	);

	changeTo('Conversor', exchangeTab)();
};

const currentTab = ($body, onChange) => {
	let aborter = new AbortController();

	fetch('/api-current', { signal: aborter.signal })
		.then(res => res.json())
		.then(data => {
			let value = data.result;

			$body.insertAdjacentHTML(
				'afterbegin',
				`<h3>${roundAccuracy(value, 3)} BS.</h3>`
			);
		})
		.catch(() => {});

	onChange(() => {
		aborter.abort();
	});
};

const exchangeTab = ($body, onChange) => {
	let fromField,
		toField,
		$inputResult,
		suggList = createSuggList(),
		exchangePrice = 0,
		symAborter = new AbortController(),
		priceAborter;
		
	$body.insertAdjacentHTML(
		'afterbegin',
		htmlExchange()
	);

	$inputResult = getElm('input-result');
	
	fromField = createSymbolField('input-from', suggList);
	toField = createSymbolField('input-to', suggList);

	const handleExchange = (e) => {
		let value = e.target.value;

		displayExchange(value);
	};

	const displayExchange = (value) => {
		if (value && exchangePrice) {
			let result = parseFloat(value);

			result *= exchangePrice;
			result = roundAccuracy(result, 3);
			$inputResult.value = `${result} ${toField.getValue()}`;
		} else {
			$inputResult.value = 0;
		}
	};

	const handleChange = () => {
		if (fromField.isValid() && toField.isValid())
			fetchPrice();
		else
			displayExchange();
	};

	const fetchPrice = () => {
		let params = new URLSearchParams(),
			$inputAmound = getElm('input-amound');

		priceAborter?.abort();
		priceAborter = new AbortController();

		params.append('from', fromField.getValue());
		params.append('to', toField.getValue());

		exchangePrice = 0;
		displayExchange($inputAmound.value);
		fetch(`/api-price?${params}`, { 
			signal: priceAborter.signal 
		})
			.then(res => res.json())
			.then(data => {
				exchangePrice = data.result;
				displayExchange($inputAmound.value);
			}).
			catch((e) => console.log(e));
	};

	bindEvent('btn-change', {
		click() {
			if (!(fromField.isValid() || toField.isValid()))
				return null;
				
			let $inputFrom = getElm('input-from'),
				$inputTo = getElm('input-to'),
				aux;

			aux = $inputFrom.value;
			$inputFrom.value = $inputTo.value;
			$inputTo.value = aux;
			fetchPrice();
		}
	});

	bindEvent('input-amound', {
		change: handleExchange,
		keyup: handleExchange
	});

	fromField.onChange(handleChange);
	toField.onChange(handleChange);

	fetch('/api-symbols', { signal: symAborter.signal })
		.then(res => res.json())
		.then(data => suggList.setSymbols(data.result))
		.catch((e) => console.log(e));

	fetchPrice();

	onChange(() => {
		suggList.clear();
		symAborter.abort();
		priceAborter?.abort();
	});
};

const htmlExchange = () => {
	return `
		<div>
			<div>
				<div>
					<label for='input-from'>Desde</label>
					<input
						id='input-from'
						type='text'
						maxlength='3'
						tabindex='1'
						value='VES'
					/>
				</div>
				<div>
					<button
						id='btn-change'
						type='button'
						tabindex='-1'
					>
						Cambiar
					</button>
				</div>
				<div>
					<label for='input-to'>Hacia</label>
					<input
						id='input-to'
						type='text'
						maxlength='3'
						tabindex='2'
						value='USD'
					/>
				</div>
			</div>
			<div>
				<input 
					id='input-amound'
					type='number'
					step='0.1'
					min='0'
					value='0'
					tabindex='3'
				/>
				<input
					id='input-result'
					type='text'
					value='0'
					readonly
					tabindex='-1'
				/>
			</div>
		</div>
	`;
};

const createSymbolField = (inputId, suggList) => {
	let $input = getElm(inputId),
		_watcher = null;
	
	bindEvent($input, {
		focus(e) {
			let value = e.target.value;

			if (!(suggList.matched(value) || suggList.isVisible())) {
				suggList.insertAfter($input);
				suggList.suggest(value);
			}

			suggList.onSuggest((symbol) => {
				$input.value = symbol;
				$input.focus();
				suggList.clear();
				_watcher?.();
			});
		},
		keydown(e) {
			if (e.key === 'Tab')
				suggList.clear();
		},
		keyup(e) {
			let value = e.target.value;

			if (!suggList.isVisible() && !suggList.matched(value)) {
				suggList.insertAfter($input);
				suggList.suggest(value);
			} else if (suggList.isVisible()) {
				suggList.suggest(value);
			}
		},
		change(e) {
			$input.value = $input.value.toUpperCase();
			_watcher?.();
		}
	});

	const onChange = (cb) => {
		_watcher = cb;
	};

	const isValid = () => {
		return suggList.matched(getValue());
	};

	const getValue = () => $input.value;

	return {
		isValid,
		onChange,
		getValue
	};
};

const createSuggList = () => {
	let _symbols = null,
		_$table = null,
		_watcher = null,
		_text = null,
		_$input = null;

	const setSymbols = (symbols) => {
		_symbols = symbols;

		if (isVisible())
			suggest(_text);
	};

	const insertAfter = ($input) => {
		clear();

		_$table = document.createElement('table');
		_$input = $input;
		
		_$table.appendChild(document.createElement('tbody'));
		_$table.style.backgroundColor = 'indigo';
		_$table.setAttribute('id', 'sugg-table');
		
		_$input.insertAdjacentElement('afterend', _$table);

		document.addEventListener('click', _handleClick);
	};

	const _handleClick = (e) => {
		if (
			e.target.matches('#sugg-table') ||
			e.target.matches('#sugg-table *')
		) {
			let $row = e.target.closest('tr');

			if ($row) {
				let value = $row.dataset.symbol;

				_watcher?.(value);
			}
		} else if (e.target !== _$input) {
			clear();
		}
	};

	const suggest = (text) => {
		let symsMatched = [];
		
		_text = text.toUpperCase();
		
		if (_symbols !== null) {
			if (_text === '') {
				symsMatched = _symbols;
			} else {
				_symbols.forEach(sym => {
					let pos = phpStrPos(sym.symbol, _text);

					if (pos !== null) 
						symsMatched.push({ pos, ...sym });
				});

				symsMatched.sort((a, b) => a.pos - b.pos);
			}
		}
		_displaySuggest(symsMatched);
	};

	const _displaySuggest = (symsMatched) => {
		if (!isVisible()) return null;

		let $frag = document.createDocumentFragment();

		_$table.firstElementChild.innerHTML = '';
		if (symsMatched.length > 0) {
			symsMatched.forEach(sym => {
				$frag.appendChild(_suggestRow(sym));
			});
		} else if (_symbols) {
			$frag.appendChild(
				_emptyRow('No se encontraron resultados')
			);
		} else {
			$frag.appendChild(
				_emptyRow('Cargando...')
			);
		}

		_$table.firstElementChild.appendChild($frag);
	};

	const _suggestRow = (sym) => {
		let $row = document.createElement('tr');

		$row.dataset.symbol = sym.symbol;
		$row.insertAdjacentHTML(
			'beforeend',
			`<td><b>${sym.symbol}</b></td>`
		);
		$row.insertAdjacentHTML(
			'beforeend',
			`<td>${sym.name}</td>`
		);
		return $row;
	};

	const _emptyRow = (msg) => {
		let $row = document.createElement('tr');

		$row.insertAdjacentHTML('afterbegin', `<td>${msg}</td>`);
		return $row;
	};

	const onSuggest = (cb) => {
		_watcher = cb;
	};

	const clear = () => {
		if (!isVisible()) return null;
		
		_$table.remove();
		_$table = null;
		_$input = null;
		document.removeEventListener('click', _handleClick);
	};

	const isVisible = () => _$table !== null;

	const matched = (symbol) => {
		if (!_symbols) return false;

		symbol = symbol.toUpperCase();
		return _symbols.some(sym => sym.symbol === symbol);
	};

	return {
		setSymbols,
		insertAfter,
		suggest,
		onSuggest,
		clear,
		isVisible,
		matched
	};
}

const historyTab = ($body) => {
	$body.insertAdjacentHTML(
		'afterbegin',
		'<h3>Yo avia ponido mi historial aqui</h3>'
	);
};

const bindEvent = (elmOrId, objEvent) => {
	let $elm = typeof elmOrId === 'string'
		? getElm(elmOrId)
		: elmOrId;

	for([event, cb] of Object.entries(objEvent)) {
		if (typeof cb === 'function')
			$elm.addEventListener(event, cb);
	}
};

const getElm = (id) => document.getElementById(id);

const roundAccuracy = (num, accu = 0) => {
	let numInt = Math.trunc(num),
		dec = num - numInt;

	dec *= 10 ** accu;
	dec = Math.round(dec);
	dec /= 10 ** accu;
	return numInt + dec;
};

const phpStrPos = (compare, subStr) => {
	let end = compare.length - subStr.length + 1,
		subStrLen = subStr.length;

	for (let i = 0; i < end; i++) {
		for (let j = 0; j < subStrLen; j++) {
			if (compare[i + j] !== subStr[j])
				break;
			else if (j === (subStrLen - 1))
				return i;
		}
	}
	return null;
};

const testApi = () => {
	fetch('/api-current')
		.then(res => res.json())
		.then(data => console.log(data));

	fetch('/api-symbols')
		.then(res => res.json())
		.then(data => console.log(data));

	let params = new URLSearchParams();

	params.append('from', 'VES');
	params.append('to', 'abc');

	fetch(`/api-price?${params}`)
		.then(res => res.json())
		.then(data => console.log(data));
		
	fetch('/api-history')
		.then(res => res.json())
		.then(data => console.log(data));
};

document.addEventListener('DOMContentLoaded', main);
