const { randomInt } = require('crypto');
const { createCanvas } = require("canvas");
const randomBytes = require('crypto').randomBytes
const path = require('node:path')

const defaultConfig = {
	width: 300,
	height: 110,
	length: 6,
	charset: 'qwertyuiopasdfghjklzxcvbnm1234567890',
	mangle: false
}

/**
 * Generates a string that user has to submit to the server with form data
 * @param {object} config 
 */
function generateCaptchaString(config) {
	const charset = config.charset
	const length = config.length

	let output = '';
	for (let index = 0; index < length; index++) {
		output += charset[randomInt(0, charset.length)];
	}
	return output
}

function generateCaptchaImage(config, generatedText) {
	// https://gist.github.com/wesbos/1bb53baf84f6f58080548867290ac2b5
	const randomizeCapitals = str =>
  	[...str].map((char, i) => char[`to${i % 2 ? "Upper" : "Lower"}Case`]()).join("");

	const randomAngle = (input = 10) => (randomInt(-input, input) * Math.PI) / 180;

	const fontSize = Math.abs((13 - (config.width/2 + config.height/2) / 2 * 0.85))

	const canvas = createCanvas(config.width, config.height);
	const context = canvas.getContext("2d");
	context.fillStyle = "rgb(53, 53, 53)";
	context.fillRect(0, 0, config.width, config.height);

	//watermark
	context.font = `${config.width/9}px Courier New`; //font
	context.textBaseline = "center";
	context.textAlign = "center";
	context.fillStyle = "rgba(255, 255, 255, 0.3)";
	context.fillText("Sussy Captcha", config.width / 2 , config.height * 0.6);

	context.textBaseline = "middle";
	context.textAlign = "center";
	context.fillStyle = "#fff";
	context.font = `${fontSize}px Courier New`;

	if (config.mangle) {

		if (config.mangle >= 4) {
			generatedText = randomizeCapitals(generatedText)
		}

		if (config.mangle >= 6) {
			context.save();
			context.font = `${config.width/2}px Courier New`;
			context.textBaseline = "center";
			context.textAlign = "center";
			context.fillStyle = `rgba(255, 255, 255, ${config.mangle * 0.032})`;

			for (let index = 0; index < config.mangle - 2; index++) {
				const positionX = (Math.random() * (2 +2) + -2) * config.width*0.2;
				const positionY = (Math.random() * (2 +2) + -2) * config.height*0.2;
				context.fillText("SUS SUS SUS", config.width / 2 + positionX , config.height * 0.6 + positionY);
			}

			context.restore()
		}

		const constantRotation = randomAngle(Math.floor(config.mangle * 1.3))
		context.translate(
			(Math.random() * (config.mangle - -config.mangle) + -config.mangle) * 1.6
			, (Math.random() * (config.mangle - -config.mangle) + -config.mangle) * 1.6);
			 context.rotate(constantRotation * 0.25);

		for (let index = 0; index < generatedText.length; index++) {

			context.font = `${
				fontSize + (Math.random() * (config.mangle - -config.mangle) + -config.mangle) * 2
			 }px Courier New`;

			const position = (Math.random() * (config.mangle - -config.mangle) + -config.mangle);
			context.save();
			context.rotate(randomAngle(Math.floor(config.mangle * 1.05)));
			context.fillText(generatedText[index], (index * 0.25 + position/55) * config.width / 2 + config.width/generatedText.length,
			config.height / 2 + (position * 4.5));
			context.restore();
		  }
	} else {
		context.fillText(generatedText, config.width/2, config.height/2);
	}

	return canvas.toDataURL()
}

function validateConfig(config) {

	if (typeof(config.length) !== 'number') {
		throw new Error(`Captcha length should be type of Number. Provided '${typeof config.length}'`)
	}

	if (config.length <= 0) {
		throw new Error(`Captcha length should bigger than 0`)
	}

	if (config.charset.length <= 6) {
		console.warn(`WARNING: Using dangerously small captcha charset length of ${config.charset.length}. You should add more characters.`);
	}

	if (!/([A-z]|[0-9])+/.test(config.charset)) {
		console.warn(`WARNING: Your charset contains characters that may be hard for users to type out/distinguish from. Consider using simple characters.`);

	}

	return true
}

function mergeConfigObjects(userConfig) {
	return Object.assign({}, defaultConfig, userConfig)
}


function getCaptcha(config) {
	const generatedText = generateCaptchaString(config)
	return {
		image: generateCaptchaImage(config, generatedText),
		text: generatedText
	}
}

const usersStore = {}

/**
 * Main entry point for Sussy Captcha
 * Can use a config object
 * Default properties:
 * - width: 200,
 * - height: 100,
 * - length: 6,
 * - charset: 'qwertyuiopasdfghjklzxcvbnm1234567890',
 * - mangle: false // either false or 0-10 number
 * @param {object} config
 */
class sussyCaptcha {
	constructor(config) {
		this.config = mergeConfigObjects(config)
		validateConfig(this.config)
	}

	getCaptcha(config) {
		return getCaptcha(config || this.config)
	}

	secure = (req, res, next) => {
		const ipAddress = req.header('x-forwarded-for') ||  	
		req.socket.remoteAddress;
		if (!usersStore[ipAddress] || !req.cookies.sussy || usersStore[ipAddress] !== req.cookies.sussy) {
			if (!req.headers['user-agent'] || req.headers['user-agent'].length < 15) {
				// these "checks" do nothing
				return res.status(401).sendFile(path.join(__dirname, '/pages/check.html'))
			}

			if (!req.headers['accept'] || !req.headers['connection']) {
				return res.status(401).sendFile(path.join(__dirname, '/pages/check.html'))
			}

			if (usersStore[ipAddress] && req.cookies.sussy === '') {
				return res.status(401).sendFile(path.join(__dirname, '/pages/check.html'))
			}

			if (usersStore[ipAddress] && usersStore[ipAddress] !== req.cookies.sussy) {
				const token = randomBytes(128).toString('hex');
				usersStore[ipAddress] = token;
				res.cookie('sussy', token)
				//return res.status(401).sendFile(path.join(__dirname, '/pages/check.html'))
				return res.status(401).send('Please clear your cookies and reload the page.')
			}
			
			const token = randomBytes(128).toString('hex');
			usersStore[ipAddress] = token;
			res.cookie('sussy', token)
			res.status(401)
			res.sendFile(path.join(__dirname, '/pages/check.html'))
		} else {
			next();
		}
	};

	get token() {
		return randomBytes(128)
	}
}

module.exports = { generateCaptchaString, getCaptcha, validateConfig, mergeConfigObjects, sussyCaptcha}