(async ()=>{
	let data = await fetch('http://localhost:8000/', {
		credentials: 'include',
		headers: {
			Cookie: 'sussy=captcha'
		}
	})
	data = await data.text()
	console.log(data);
})()