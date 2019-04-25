// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

//const { ActivityTypes } = require('botbuilder');
//Cのincludeのようなもの(ライブラリの利用宣言)
const { ActivityTypes, MessageFactory, TurnContext } = require('botbuilder');
const { DialogSet, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { faqDialog } = require('./dialogs/FAQDialog');
const { bandSearchDialog } = require('./dialogs/BandSearchDialog');
const { navigateDialog } = require('./dialogs/NavigateDialog');
const button_list = ['FAQs', 'Band Search', 'Navigate']
const { LuisRecognizer } = require('botbuilder-ai');

const MENU_PROMPT = 'menuPrompt';
const MENU_DIALOG = 'menuDialog';
const FAQ_DAILOG = 'faqDialog';
const BANDSEARCH_DAILOG = 'bandSearchDialog';
const NAVIGATE_DIALOG = 'navigateDialog'
//const DONATE_FOOD_DIALOG = 'donateFoodDialog';
//const FIND_FOOD_DIALOG = 'findFoodDialog';
//const CONTACT_DIALOG = 'contactDialog';
const DIALOG_STATE_PROPERTY = 'dialogState';

class MyBot {
    //ウォーターフォールダイアログの作成
    constructor(conversationState, application, luisPredictionOptions) {
        this.conversationState = conversationState;
        this.dialogState = this.conversationState.createProperty(DIALOG_STATE_PROPERTY);
        this.dialogs = new DialogSet(this.dialogState);
        this.dialogs.add(new TextPrompt(MENU_PROMPT));
        this.dialogs.add(new faqDialog(FAQ_DAILOG));
        this.dialogs.add(new bandSearchDialog(BANDSEARCH_DAILOG));
        this.dialogs.add(new navigateDialog(NAVIGATE_DIALOG));
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
        /*
        return step.prompt(MENU_PROMPT, {
            choices: button_list,
            prompt: "How would you like to explore the event?",
            retryPrompt: "'${ turnContext.activity.text }'は分かりません。ボタンから選んでください`"
        });
        */
        var suggestedActions = MessageFactory.suggestedActions(['FAQs', 'Band Search', ,'Navigate'], 'How can I help? ');
        return step.prompt(MENU_PROMPT,suggestedActions);
    
    }

    async handleMenuResult(step) {
        const luisApplication = {
            applicationId: 'd0da1819-deb5-410a-b2bb-f953efb301f3',
            endpointKey: 'f8d9733a9e0f4c9eb3da9c4536ad187f',
            azureRegion: 'westus'
        };
        
        const luisPredictionOptions = {
            includeAllIntents: true,
            log: true,
            staging: false
        };
        
        let luisRecognizer = new LuisRecognizer(luisApplication, luisPredictionOptions, true);        /*
        switch (step.result.value) {
            case button_list[0]:
                //  return step.beginDialog(DONATE_FOOD_DIALOG);
                //await step.context.sendActivity(`'${ step.result.value }'ボタンがクリックされました`);
                return step.beginDialog(FAQ_DAILOG);
                //break;
            case button_list[1]:
                // return step.beginDialog(FIND_FOOD_DIALOG);
                return step.beginDialog(BANDSEARCH_DAILOG);
                //await step.context.sendActivity(`'${ step.result.value }'ボタンがクリックされました`);
                //break;
            case button_list[2]:
                return step.beginDialog(NAVIGATE_DIALOG);
                //await step.context.sendActivity(`'${ step.result.value }'ボタンがクリックされました`);
                //break;
        }
        */
       switch (step.result) {
        case "FAQs":
            return step.beginDialog(FAQ_DIALOG);
        case "Product Search":
            return step.beginDialog(BAND_SEARCH_DIALOG);
        case "Explore Products":
            return step.beginDialog(NAVIGATE_DIALOG);
        default:
            const results = await luisRecognizer.recognize(step.context);
            const topIntent = results.luisResult.topScoringIntent;
            if(topIntent.intent == 'Band Search'){
                let name =  results.entities && results.entities.name ? results.entities.name[0] : 'Any';
                return step.beginDialog(BAND_SEARCH_DIALOG, {name});
            }
            else if (topIntent.intent == 'Navigate'){
                let day =  results.entities && results.entities.day ? results.entities.day[0] : 'Any';
                let genre =   results.entities && results.entities.genre ? results.entities.genre[0] : `All`;

                if(day == 'Any' && genre == 'Any'){
                    day = null;
                    genre = null;
                }
                return step.beginDialog(NAVIGATE_DIALOG, {day:day,genre:genre});
            }       
            else{
                return step.beginDialog(FAQ_DIALOG);
            }       
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
        
       // var reply = MessageFactory.suggestedActions(button_list);
//        await turnContext.sendActivity(reply);
    }
}

module.exports.MyBot = MyBot;
