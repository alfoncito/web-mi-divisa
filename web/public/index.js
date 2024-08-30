const main = () => {
	testApi();
};

const testApi = () => {
	/*
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
	*/
};

document.addEventListener('DOMContentLoaded', main);
