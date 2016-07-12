'use strict';

let Wit = null;
try {
  // if running from repo
  Wit = require('../').Wit;
} catch (e) {
  Wit = require('node-wit').Wit;
}

const request = require('request');

const accessToken = (() => {
  if (process.argv.length !== 3) {
    console.log('usage: node examples/quickstart.js <wit-access-token>');
    process.exit(1);
  }
  return process.argv[2];
})();

// Quickstart example
// See https://wit.ai/ar7hur/quickstart

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value
  ;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

// Fetch a retort by stimulus from Retort
// http://www.retort.us/retort/get?stimulus=hey
const fetchJson = (url) => {
  request({url: url, json: true}, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      //const json = JSON.parse(body);
      console.log(body);// => prints actual json object
      return body;
    } else {
      console.log('Retort error');
      return null;
    }
  });
  // return {
  //   'response': 'Hey'
  // };
};

const actions = {
  send(request, response) {
    const {sessionId, context, entities} = request;
    const {text, quickreplies} = response;
    return new Promise(function(resolve, reject) {
      console.log('sending...', JSON.stringify(response));
      return resolve();
    });
  },
  get_retort({context, entities}) {
    return new Promise(function(resolve, reject) {
      var message_body = firstEntityValue(entities, 'message_body');
      if (message_body) {
        request({
          url: 'http://www.retort.us/retort/get?stimulus=' + message_body,
          json: false // handle "undefined" if there is no response
        }, (error, response, body) => {
          if (!error && response.statusCode === 200) {
            body = JSON.parse(body);
            if (body) {
              context.message = body['response'];
              return resolve(context);
            } else {
              console.log('No retort found');
              return resolve("Dunno lol");
            }
          } else {
            console.log('Retort error');
            return resolve(null);
          }
        });
      }
    });
  },
};

const client = new Wit({accessToken, actions});
client.interactive();
