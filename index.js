'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const app = express()

const token = [REMOVED_TOKEN_ID_FOR_SECURITY]

app.set('port', (process.env.PORT || 5000))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// routes

app.get('/', function(req, res){
  res.send("hello")
})

//For FB

app.get('/webhook/', function(req, res) {
  if (req.query['hub.verify_token'] === "XM_chatbot_setup"){
    res.send(req.query['hub.challenge'])
  }
  res.send("wrong token")
})

app.post('/webhook/', function(req, res) {
	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = messaging_events[i]
		let sender = event.sender.id
		if (event.message && event.message.text) {
			let text = event.message.text
      text = text.toLowerCase()

      if(text.includes("weather")){

        var YQL = require('yql');
        var query = new YQL('select item.condition from weather.forecast where woeid = 4118');

        query.exec(function(err, data) {
           var condition = data.query.results.channel.item.condition;

                text = "The current weather in " + condition.temp

                	sendText(sender, text.substring(0, 100))
         })

      }
      else{
        text = "Sorry, The command you entered is not valid. Please Type one of these commands: weather"
      }
			sendText(sender, text.substring(0, 100))
     //sendMessage(sender, text.substring(0, 100))
		}
	}
	res.sendStatus(200)
})

function sendText(sender, text) {
	let messageData = {text: text}
	request({
		url: "https://graph.facebook.com/v2.6/me/messages",
		qs : {access_token: token},
		method: "POST",
		json: {
			recipient: {id: sender},
			message : messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log("sending error")
		} else if (response.body.error) {
			console.log("response body error")
		}
	})
}

/*function sendMessage(sender, text1){
  let text = text1.toLowerCase()
  if (text.include("weather")){

  else{
    sendText(sender, "Sorry thats not one of the options. Try typing: Weather")
  }
}*/

app.listen(app.get('port'), function(){
  console.log("running: port")
})
