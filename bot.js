// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

//const { ActivityTypes } = require('botbuilder');
//Cのincludeのようなもの(ライブラリの利用宣言)
const { ActivityTypes, MessageFactory, TurnContext } = require('botbuilder');
const { DialogSet, ChoicePrompt, WaterfallDialog } = require('botbuilder-dialogs');
const button_list = ['FAQs', 'Band Search', 'Navigate']

const MENU_PROMPT = 'menuPrompt';
const MENU_DIALOG = 'menuDialog';
//const DONATE_FOOD_DIALOG = 'donateFoodDialog';
//const FIND_FOOD_DIALOG = 'findFoodDialog';
//const CONTACT_DIALOG = 'contactDialog';
const DIALOG_STATE_PROPERTY = 'dialogState';

class MyBot {
    //ウォーターフォールダイアログの作成
    constructor(conversationState) {
        this.conversationState = conversationState;
        this.dialogState = this.conversationState.createProperty(DIALOG_STATE_PROPERTY);
        this.dialogs = new DialogSet(this.dialogState);
        this.dialogs.add(new ChoicePrompt(MENU_PROMPT));

        this.dialogs.add(new WaterfallDialog(MENU_DIALOG, [
            this.promptForMenu,
            this.handleMenuResult,
            this.resetDialog,
        ]));
    }
    /**
     *
     * @param {TurnContext} on turn context object.
     */

    memberJoined(activity) {
        const user = activity.membersAdded.find(member=> member.id != activity.recipient.id);
        const isWebChat = activity.channelId == 'webchat';
        //Webchat has a bug related to conversation update. This fix adjusts for that.
        return  (user && !isWebChat) || (!user && isWebChat);
    }
    
    async promptForMenu(step) {
        return step.prompt(MENU_PROMPT, {
            choices: button_list,
            prompt: "How would you like to explore the event?",
            retryPrompt: "'${ turnContext.activity.text }'は分かりません。ボタンから選んでください`"
        });
    }

    async handleMenuResult(step) {
        switch (step.result.value) {
            case button_list[0]:
                //  return step.beginDialog(DONATE_FOOD_DIALOG);
                await step.context.sendActivity(`'${ step.result.value }'ボタンがクリックされました`);
                break;
            case button_list[1]:
                // return step.beginDialog(FIND_FOOD_DIALOG);
                await step.context.sendActivity(`'${ step.result.value }'ボタンがクリックされました`);
                break;
            case button_list[2]:
                //  return step.beginDialog(CONTACT_DIALOG);
                await step.context.sendActivity(`'${ step.result.value }'ボタンがクリックされました`);
                break;
        }
        
        return step.next();
    }

    async resetDialog(step) {
        return step.replaceDialog(MENU_DIALOG);
    }

    async onTurn(turnContext) {
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.

        const dialogContext = await this.dialogs.createContext(turnContext);

        if (turnContext.activity.type === ActivityTypes.Message) {
            if (dialogContext.activeDialog) {
                await dialogContext.continueDialog();
            } else {
                await dialogContext.beginDialog(MENU_DIALOG);
            }
        } else if (turnContext.activity.type === ActivityTypes.ConversationUpdate) {
            if (this.memberJoined(turnContext.activity)) {
                await turnContext.sendActivity(`Alpine Ski House音楽フェスティバルへようこそ！
                イベントのガイドをします。知りたいことを教えてください。`);
                await dialogContext.beginDialog(MENU_DIALOG);
            }
        }
        await this.conversationState.saveChanges(turnContext);
            /*
            if (button_list.includes(turnContext.activity.text)) {
                await turnContext.sendActivity(`'${ turnContext.activity.text }'ボタンがクリックされました`);
            }else{
                await turnContext.sendActivity(`'${ turnContext.activity.text }'は分かりません。ボタンから選んでください`);  
            }
        } else if(turnContext.activity.type === ActivityTypes.ConversationUpdate) {
                if (this.memberJoined(turnContext.activity)) {
                    await turnContext.sendActivity(`Alpine Ski House音楽フェスティバルへようこそ！
                                                    イベントのガイドをします。知りたいことを教えてください。`);
//                    await dialogContext.beginDialog(MENU_DIALOG);
                }
        } else {
            await turnContext.sendActivity(`[${ turnContext.activity.type } event detected]`);
            */
        
        var reply = MessageFactory.suggestedActions(button_list);
//        await turnContext.sendActivity(reply);
    }
}

module.exports.MyBot = MyBot;
