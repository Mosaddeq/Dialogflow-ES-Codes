// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const axios = require('axios');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
 const agent = new WebhookClient({ request, response });
 console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
 console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
 function welcome(agent) {
  agent.add(`Welcome to my agent!`);
 }
 
 function fallback(agent) {
  agent.add(`I didn't understand`);
  agent.add(`I'm sorry, can you try again?`);
 }
 function details(agent) {
  const Name = agent.parameters.Name;
  const Email = agent.parameters.Email;
  const Address = agent.parameters.Address;
  const Number = agent.parameters.Number;

 try {
  axios.post('https://sheetdb.io/api/v1/oq4q9n23u1a8l?sheet=User Info', {
   "Name": Name,
   "Email": Email,
   "Address": Address,
   "Number": Number
  });

  console.log('Successfully posted data to spreadsheet');
  agent.add('Your details have been successfully recorded!');
 } catch (error) {
  console.error('Error posting data to spreadsheet:', error);
  agent.add('There was an error recording your details. Please try again later.');
 }
}


 let intentMap = new Map();
 intentMap.set('Default Welcome Intent', welcome);
 intentMap.set('Default Fallback Intent', fallback);
 intentMap.set('Ask Details', details);
 // intentMap.set('your intent name here', googleAssistantHandler);
 agent.handleRequest(intentMap);
});
