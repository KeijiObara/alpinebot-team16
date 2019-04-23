// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes } = require('botbuilder');

class MyBot {
    /**
     *
     * @param {TurnContext} on turn context object.
     */

    memberJoined(activity) {
        return ((activity.membersAdded.length !== 0 && (activity.membersAdded[0].id !== activity.recipient.id)));
    }
    
    async onTurn(turnContext) {
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        if (turnContext.activity.type === ActivityTypes.Message) {
            await turnContext.sendActivity(`You speak '${ turnContext.activity.text }'`);

        } else if(turnContext.activity.type === ActivityTypes.ConversationUpdate) {
                if (this.memberJoined(turnContext.activity)) {
                    await turnContext.sendActivity(`Hey there! Welcome to the food bank bot. I'm here to help orchestrate 
                                                    the delivery of excess food to local food banks!`);
                    //await dialogContext.beginDialog(MENU_DIALOG);
                }
        } else {
            await turnContext.sendActivity(`[${ turnContext.activity.type } event detected]`);
        }
    }
}

module.exports.MyBot = MyBot;
