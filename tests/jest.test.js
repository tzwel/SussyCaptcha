const { generateCaptchaString, getCaptcha, validateConfig, sussyCaptcha } = require('../sussy');

const globalValidConfig = {
	length: 10,
	charset: 'qwertyuiopasdfghjklzxcvbnm1234567890',
}

test('captcha strings', () => {
	expect(
		generateCaptchaString(globalValidConfig)
	).toBeDefined();

	expect(
		generateCaptchaString(globalValidConfig)
	).toMatch(/([A-z]|\d){10}/);
});

test('get captcha object', () => {
	expect(getCaptcha(globalValidConfig)).toBeDefined()
	expect(getCaptcha(globalValidConfig)).toHaveProperty('text')
	expect(getCaptcha(globalValidConfig)).toHaveProperty('image')
});

test('config validator', () => {
	expect(() => {
		validateConfig({
			length: '10',
			charset: 'qwertyuiopasdfghjklzxcvbnm1234567890',
		})}
	).toThrow()

	expect(() => {
		validateConfig({
			length: -1,
			charset: 'qwertyuiopasdfghjklzxcvbnm1234567890',
		})}
	).toThrow()


	expect(() => {
		validateConfig({
			length: 0,
			charset: 'z',
		})}
	).toThrow()
});

test('sussy main class', () => {
	const captchaNoConfig = new sussyCaptcha()
	const captchaConfig = new sussyCaptcha(globalValidConfig)

	expect(
		captchaNoConfig.getCaptcha()
	).toBeDefined();

	expect(captchaNoConfig.getCaptcha()).toHaveProperty('text')
	expect(captchaNoConfig.getCaptcha()).toHaveProperty('image')

	expect(
		captchaConfig.getCaptcha()
	).toBeDefined();

	expect(captchaConfig.getCaptcha()).toHaveProperty('text')
	expect(captchaConfig.getCaptcha()).toHaveProperty('image')

});

