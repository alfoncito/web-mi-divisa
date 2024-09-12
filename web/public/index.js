const NS = 'http://www.w3.org/2000/svg';

const currencyApp = () => {
	let $title = getElm('currency-title'),
		$body = getElm('currency-body'),
		$btnCurrent = getElm('btn-current'),
		$btnExchange = getElm('btn-exchange'),
		$btnHistory = getElm('btn-history'),
		changeHandler;

	const changeTo = (title, tab) => (e) => {
		let $tab = e.target.closest('.tab');
		
		changeHandler?.();
		changeHandler = null;

		$title.textContent = title;
		$body.innerHTML = '';

		$btnCurrent.classList.remove('active');
		$btnExchange.classList.remove('active');
		$btnHistory.classList.remove('active');

		$tab.classList.add('active');

		tab($body, onChange);
	};

	const onChange = (cb) => {
		changeHandler = cb;
	}

	$btnCurrent.addEventListener(
		'click',
		changeTo('Precio del día', currentTab)
	);
	$btnExchange.addEventListener(
		'click',
		changeTo('Conversor', exchangeTab)
	);
	$btnHistory.addEventListener(
		'click',
		changeTo('Histórico del dólar', historyTab)
	);

	changeTo('Precio del día', currentTab)({
		target: $btnCurrent
	});
};

const currentTab = ($body, onChange) => {
	let aborter = new AbortController(),
		$loader = createLoader();

	$body.classList.add('flex-center');
	$body.appendChild($loader);
	fetch('/api-current', { signal: aborter.signal })
		.then(res => res.json())
		.then(data => {
			let value = data.result;

			$body.removeChild($loader);
			$body.insertAdjacentHTML(
				'afterbegin',
				`
					<h3 class='current-price'>
						${roundAccuracy(value, 2)} <span class='symbol'>BS.</span>
					</h3>
				`
			);
		})
		.catch(() => {});

	onChange(() => {
		aborter.abort();
		$body.classList.remove('flex-center');
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

	fromField = createSymbolField(
		'input-from',
		suggList,
		['left']
	);
	toField = createSymbolField('input-to', suggList, ['right']);

	const handleExchange = (e) => {
		let value = e.target.value;

		displayExchange(value);
	};

	const displayExchange = (value) => {
		if (value && exchangePrice) {
			let result = parseFloat(value);

			result *= exchangePrice;
			result = roundAccuracy(result, 2);
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

		priceAborter?.abort(
			new DOMException(
				'Petición del precio cancelada',
				'fetchCancel'
			)
		);
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
			catch((e) => {
				if (e.name === 'aborted' || e.name === 'fetchCancel')
					console.log(e.message);
				else
					console.error(e);
			});
	};

	bindEvent('btn-change', {
		click() {
			if (!(fromField.isValid() && toField.isValid()))
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
		.catch((e) => {
			if (e.name === 'aborted')
				console.log(e.message);
			else
				console.error(e);
		});

	fetchPrice();

	onChange(() => {
		suggList.clear();
		symAborter.abort(
			new DOMException(
				'Petición abortada por el usuario',
				'aborted'
			)
		);
		priceAborter?.abort(
			new DOMException(
				'Petición abortada por el usuario',
				'aborted'
			)
		);
	});
};

const htmlExchange = () => {
	return `
		<div class='form-exchange'>
			<div class='form-exchange__symbols'>
				<div class='input-field'>
					<label
						class='input-field__label'
						for='input-from'
					>
						Desde
					</label>
					<input
						class='input-field__input'
						id='input-from'
						type='text'
						maxlength='3'
						tabindex='1'
						value='VES'
						placeholder='VES, USD, EUR...'
						autocomplete='off'
					/>
				</div>
				<div>
					<button
						class='tab'
						id='btn-change'
						type='button'
						tabindex='-1'
					>
						<img
							src='/public/img/arrow-left-right.svg'
							alt='Intercambio de divisas'
						/>
					</button>
				</div>
				<div class='input-field'>
					<label
						class='input-field__label'
						for='input-to'
					>
						Hacia
					</label>
					<input
						class='input-field__input'
						id='input-to'
						type='text'
						maxlength='3'
						tabindex='2'
						value='USD'
						placeholder='VES, USD, EUR...'
						autocomplete='off'
					/>
				</div>
			</div>
			<div class='form-exchange__exchange'>
				<div class='input-fake'>
					<label
						class='input-fake__label'
						for='input-amound'
					></label>
					<input
						class='input-discrete'
						id='input-amound'
						title='Cantidad'
						type='number'
						step='0.1'
						min='0'
						value='0'
						tabindex='3'
						placeholder='¿Cuanto tienes?'
					/>
				</div>
				<div class='input-fake'>
					<label
						class='input-fake__label'
						for='input-result'
					></label>
					<input
						class='input-discrete'
						id='input-result'
						title='Resultado'
						type='text'
						value='0'
						readonly
						tabindex='-1'
					/>
				</div>
			</div>
		</div>
	`;
};

const createSymbolField = (inputId, suggList, classes) => {
	let $input = getElm(inputId),
		_watcher = null;
	
	bindEvent($input, {
		focus(e) {
			let value = e.target.value;

			if (!(suggList.matched(value) || suggList.isVisible())) {
				suggList.insertAfter($input, classes);
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
				suggList.insertAfter($input, classes);
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
		_$sugg = null,
		_$suggContainer = null,
		_watcher = null,
		_text = null,
		_$input = null;

	const setSymbols = (symbols) => {
		_symbols = symbols;

		if (isVisible())
			suggest(_text);
	};

	const insertAfter = ($input, clasess = []) => {
		clear();

		_$suggContainer = document.createElement('div');
		_$suggContainer.classList.add(
			'suggestion-container',
			...clasess
		);
		
		_$sugg = document.createElement('ul');
		_$sugg.classList.add('suggestion');
		_$input = $input;
		
		_$sugg.setAttribute('id', 'sugg-list');

		_$suggContainer.appendChild(_$sugg);
		_$input.insertAdjacentElement('afterend', _$suggContainer);

		document.addEventListener('click', _handleClick);
	};

	const _handleClick = (e) => {
		if (
			e.target.matches('#sugg-list') ||
			e.target.matches('#sugg-list *')
		) {
			let $row = e.target.closest('.js-sugg-item');

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

		_$sugg.innerHTML = '';
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
				_emptyRow(createLoader().outerHTML)
			);
		}

		_$sugg.appendChild($frag);
	};

	const _suggestRow = (sym) => {
		let $row = document.createElement('li');

		$row.classList.add('suggestion__item', 'js-sugg-item');
		$row.dataset.symbol = sym.symbol;
		$row.innerHTML = `<b>${sym.symbol}</b> ${sym.name}`;
		return $row;
	};

	const _emptyRow = (msg) => {
		let $row = document.createElement('li');

		$row.classList.add('suggestion__item');
		$row.textContent = msg;
		return $row;
	};

	const onSuggest = (cb) => {
		_watcher = cb;
	};

	const clear = () => {
		if (!isVisible()) return null;
		
		_$suggContainer.remove();
		_$suggcontainer = null;
		_$sugg = null;
		_$input = null;
		document.removeEventListener('click', _handleClick);
	};

	const isVisible = () => _$sugg !== null;

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

const historyTab = ($body, onChange) => {
	let aborter = new AbortController(),
		$loader = createLoader();

	$body.classList.add('flex-center');
	$body.appendChild($loader);
	const handleFetch = (data) => {
		let $container = createHistoricalContainer(),
			max = calcIntervalMax(data.result, 5);

		/*$container.appendChild(
			createHistoricalValuesAxis(5, max)
		);*/
		$container.appendChild(
			createHistoricalChart(data.result.reverse(), max)
		);
		/*$container.appendChild(
			createHistoricalDateAxis(data.result)
		);*/

		$body.removeChild($loader);
		$body.appendChild($container);
	};

	fetch('/api-history', { signal: aborter.signal })
		.then(res => res.json())
		.then(handleFetch)
		.catch(e => {
			if (e.name === 'aborted')
				console.log(e.message);
			else
				console.error(e);
		});

	onChange(() => {
		$body.classList.remove('flex-center');
		aborter.abort(
			new DOMException(
				'Petición abortada por el usuario',
				'aborted'
			)
		);
	});
};

const calcIntervalMax = (historical, numIntervals) => {
	let values = historical.map(h => h.value),
		max = Math.max(...values),
		interval = max / numIntervals,
		zeros;

	interval = Math.ceil(interval);
	zeros = Math.floor(interval.toString().length / 2);

	interval /= 10 ** zeros;
	interval = Math.ceil(interval);
	interval *= 10 ** zeros;
	return interval * numIntervals;
};

const createHistoricalContainer = () => {
	let $div = document.createElement('div');

	$div.classList.add('chart');
	return $div;
};

const createHistoricalValuesAxis = (numIntervals, max) => {
	let $div = document.createElement('div'),
		interval = max / numIntervals;

	$div.classList.add('chart__y-axis');
	for(let i = 0; i <= numIntervals; i++) {
		let value = i * interval;
		
		$div.insertAdjacentHTML(
			'beforeend',
			`<span>${value} BS</span>`
		);
	}
	return $div;
};

const createHistoricalChart = (historical, max) => {
	let $svg = document.createElementNS(NS, 'svg'),
		width = 20,
		xInterval = width / historical.length,
		xOffset = xInterval / 2,
		dots = [];

	$svg.classList.add('chart__graph');
	$svg.setAttribute('viewBox', `0 0 ${width} 10`);

	historical.forEach((h, index) => {
		let x = index * xInterval + xOffset,
			y = (1 - h.value / max) * 10;

		dots.push({ x, y });
		$svg.appendChild(createDotHistorical(x, y, h));
	});

	$svg.prepend(createLineHistorical(dots));
	return $svg;
};

const createLineHistorical = (dots) => {
	let $path = document.createElementNS(NS, 'path'),
		d = '';

	dots.forEach((dot, index) => {
		let comm = index === 0 ? 'M' : 'L';

		d += `${comm}${dot.x},${dot.y}`;
	});

	$path.classList.add('historical__line');
	$path.setAttribute('d', d);
	$path.setAttribute('fill', 'none');
	$path.setAttribute('stroke-width', 0.1);

	return $path;
};

const createDotHistorical = (x, y, h) => {
	let $cir = document.createElementNS(NS, 'circle'),
		$popover = null;

	$cir.classList.add('historical__dot');
	$cir.setAttribute('cx', x);
	$cir.setAttribute('cy', y);
	$cir.setAttribute('r', 0.5);
	$cir.setAttribute('fill', 'lime');

	bindEvent($cir, {
		mouseenter() {
			$popover = createPopover(x, y, h, $cir);
			document.body.appendChild($popover);
		},
		mouseleave() {
			$popover?.remove();
		}
	});

	return $cir;
};

const createPopover = (x, y, h, $elm) => {
	let $div = document.createElement('div'),
		bound = $elm.getBoundingClientRect();

	$div.classList.add('popover');
	$div.style.top = `${bound.y}px`;
	$div.style.left = `${bound.x + bound.width / 2}px`;
	$div.insertAdjacentHTML(
		'afterbegin',
		`
			<time
				class='popover__time'
				datetime='${h.date}'
			>
				${h.date}
			</time>
			<h4
				class='popover__price'
			>
				${roundAccuracy(h.value, 2)} <span class='symbol'>BS.</span>
			</h4>
		`
	);

	return $div;
};

const createHistoricalDateAxis = (historical) => {
	let $div = document.createElement('div');

	$div.classList.add('chart__x-axis');
	historical.forEach(h => {
		$div.insertAdjacentHTML(
			'beforeend',
			`<time datetime='${h.date}'>${h.date}</time>`
		);
	});
	return $div;
};

const createLoader = (extraClasses = []) => {
	let $loader = document.createElement('div');

	$loader.classList.add('spinner', ...extraClasses);
	return $loader;
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

const arrayIncludeAsc = (arr, value) => {
	return arrayIncludeAscRecursive(
		arr,
		value,
		0,
		arr.length - 1
	);
};

const arrayIncludeAscRecursive = (arr, value, left, right) => {
	if (left > right)
		return false;

	let mid = left + Math.floor((right - left) / 2);

	if (arr[mid] === value)
		return true;
	else if (arr[mid] > value)
		return arrayIncludeAscRecursive(arr, value, left, mid - 1);
	else
		return arrayIncludeAscRecursive(arr, value, mid + 1, right);
};

document.addEventListener('DOMContentLoaded', currencyApp);
