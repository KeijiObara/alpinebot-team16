'use strict';

var request = require('request');
var request_as_promised = require('request-promise');

// Represents the various elements used to create HTTP request URIs
// for QnA Maker operations.
// From Publish Page: HOST
// Example: https://YOUR-RESOURCE-NAME.azurewebsites.net/qnamaker
var host = "https://team-16qna.azurewebsites.net/qnamaker";

// Authorization endpoint key
// From Publish Page
var endpoint_key = "928e23f5-c647-421f-82ca-3eec3d22318f";

// Management APIs postpend the version to the route
// From Publish Page, value after POST
// Example: /knowledgebases/ZZZ15f8c-d01b-4698-a2de-85b0dbf3358c/generateAnswer
var route = "/knowledgebases/c1b9a674-2340-4808-9996-685bba53dd2a/generateAnswer";

// JSON format for passing question to service
var question = {'question': 'Who are you?','top': 3};

var getanswer = async () => {

    try{
        // Add an utterance
        var options = {
            uri: host + route,
            method: 'POST',
            headers: {
                'Authorization': "EndpointKey " + endpoint_key
            },
            json: true,
            body: question
        };

        var response = await request_as_promised.post(options);

        console.log(response);

    } catch (err){
        console.log(err.statusCode);
        console.log(err.message);
        console.log(err.error);
    }
};

getanswer();

