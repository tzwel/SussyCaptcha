const {sussyCaptcha } = require('../sussy');

const captcha = new sussyCaptcha()

console.log(
	captcha.getCaptcha()
);

console.log(	
	captcha.token
);