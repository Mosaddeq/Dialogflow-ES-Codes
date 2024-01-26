'use strict';

const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
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
    return new Promise((resolve, reject) => {
      const queryText = request.body.queryResult.queryText;
      axios.post('https://sheetdb.io/api/v1/dlzevmqldmvok?sheet=fallback', {
          "data": {
            "content": queryText
          }
      });

      agent.add(`I didn't understand`);
      agent.add(`I'm sorry, can you try again?`);
    });
  }



function details(agent) {
    const name = agent.parameters.name;
  
    return new Promise((resolve, reject) => {
      // Check if user information already exists
      axios.get(`https://sheetdb.io/api/v1/oq4q9n23u1a8l/search?Name=${name}`)
        .then(response => {
          let existingUserInfo = response.data[0];
  
          if (existingUserInfo) {
            // User information already exists
            agent.add("Already have information");
            resolve();
          } else {
            // User information doesn't exist, add it to the spreadsheet
            const postData = {
              "data": {
                "Name": String(name)
                // Add other fields as needed
              }
            };
  
            console.log('Adding user data to SheetDB:', postData);
  
            axios.post('https://sheetdb.io/api/v1/oq4q9n23u1a8l?sheet=details', postData)
              .then(response => {
                console.log('Successfully added user data to spreadsheet:', response.data);
                agent.add('User details have been successfully recorded!');
                resolve(); // Resolve the promise when everything is successful
              })
              .catch(error => {
                console.error('Error adding user data to spreadsheet:', error);
                agent.add('There was an error recording user details. Please try again later.');
                reject(); // Reject the promise if there's an error
              });
          }
        })
        .catch(error => {
          console.error('Error searching for user data in spreadsheet:', error);
          agent.add('There was an error checking for user details. Please try again later.');
          reject(); // Reject the promise if there's an error
        });
    });
  }

    


  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Details', details);
  agent.handleRequest(intentMap);
});
