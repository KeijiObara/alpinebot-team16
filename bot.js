// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

//const { ActivityTypes } = require('botbuilder');
const { ActivityTypes, MessageFactory, TurnContext } = require('botbuilder');
const button_list = ['FAQs', 'Band Search', 'Navigate']

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
            if (button_list.includes(turnContext.activity.text)) {
                await turnContext.sendActivity(`'${ turnContext.activity.text }'ボタンが押されました`);
            }else{
                await turnContext.sendActivity(`もう一度おしえてください`);  
            }
        } else if(turnContext.activity.type === ActivityTypes.ConversationUpdate) {
                if (this.memberJoined(turnContext.activity)) {
                    await turnContext.sendActivity(`Alpine Ski House音楽フェスティバルへようこそ！
                                                    イベントのガイドをします。知りたいことを教えてください。`);
//                    await dialogContext.beginDialog(MENU_DIALOG);
                }
        } else {
            await turnContext.sendActivity(`[${ turnContext.activity.type } event detected]`);
        }
        var reply = MessageFactory.suggestedActions(button_list);
        await turnContext.sendActivity(reply);
    }
}

module.exports.MyBot = MyBot;
