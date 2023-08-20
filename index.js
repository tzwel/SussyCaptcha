const express = require('express')
const { sussyCaptcha } = require('./sussy')
const cookieParser = require('cookie-parser'); 
const app = express()

const captcha = new sussyCaptcha({width: 300, height: 110, mangle: 3, length: 6})

// required for the captcha to work
app.use(cookieParser());

app.get('/', captcha.secure, (req, res) => {
  res.send(`
    <img src='${captcha.getCaptcha().image}' />
  `)
})

app.listen(8000, () => {
  console.log(`Listening on port ${8000}`)
})