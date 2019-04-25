const { ComponentDialog, ChoicePrompt, WaterfallDialog} = require('botbuilder-dialogs');
//const { getValidDonationDays, filterFoodBanksByDonation, createFoodBankDonationCarousel } = require('../services/schedule-helpers');
//const { getanswer } = require('../services/get-answer');
const {QueryFilter,SearchService} = require('azure-search-client');
const { CardFactory, MessageFactory } = require('botbuilder');



class navigateDialog extends ComponentDialog {
    constructor(dialogId) {
        super(dialogId);
        const searchEndpointSettings = { 
            serviceName: "fukawa", 
            primaryKey: "D229D250E14B7FDFE2A76950257E937C", 
            index: "azureblob-index"
        };
        let that = this;
        let azureSearch = this.azureSearch = new SearchService(
            searchEndpointSettings.serviceName, searchEndpointSettings.primaryKey
            );

        // ID of the child dialog that should be started anytime the component is started.
        this.initialDialogId = dialogId;


        this.addDialog(new ChoicePrompt('choicePrompt'));

        // Define the conversation flow using a waterfall model.
        this.addDialog(new WaterfallDialog(dialogId, [
            async function (step) {
                //const validDonationDays = getValidDonationDays();
                if(step.options && step.options.day){
                    return step.next();
                }

                return await step.prompt('choicePrompt', {
                    choices: ["Friday","Saturday","Sunday","Any"],
                    prompt: "What day would you like to hear music?",
                    retryPrompt: "Please Pless Button!"
                });
            },
            async function (step) {
                /*if(step.options && step.options.genre){
                    return step.next();
                }*/
                step.values.day = step.result.value;
                let filter = new QueryFilter().eq('day', step.values.day)
                const resp = await azureSearch.indexes.use("azureblob-index").buildQuery()
                .filter(filter)
                .executeQuery();
                const results = resp.result.value;
                let genre_list = []
                results.forEach(item=>
                    genre_list.push(item.genre)
                    )
                genre_list.push('Any')
                let set = new Set(genre_list);
                genre_list = Array.from(set);
                var promptText = "What genre of music would you like to see on " + step.values.day + "?";
                return await step.prompt('choicePrompt', {
                    choices:genre_list,
                    prompt: promptText,
                    retryPrompt: "That is not a valid response. Please select one of the options"
                });
            },

            async function(step) {
                /*
                let genre = step.result.value;
                let day = step.values.day;
                genre = genre.charAt(0).toUpperCase() + genre.substring(1).toLowerCase();
                day = day.charAt(0).toUpperCase() + day.substring(1).toLowerCase();
                */
                const state = step.values;
                let genre=null;
                let day=null;
                if(step.options && step.options.genre && step.options.genre){
                    genre = step.options.genre;
                }
                else{
                    genre = step.result.value;
                }

                if( step.options && step.options.day && step.options.day){
                    day = step.options.day;
                }
                else{
                    day = state.day;
                }
                let filter = new QueryFilter().eq('genre', genre)
                if(genre == 'Any'){
                    filter = new QueryFilter().eq('day', day);
                }
                if (day != 'Any' && genre != 'Any'){
                  filter = QueryFilter.and(
                    new QueryFilter().eq('genre', genre)
                                     .eq('day', day)
                    )
                }
                const resp = await azureSearch.indexes.use("azureblob-index").buildQuery()
                .filter(filter)
                .executeQuery();
                const results = resp.result.value;

                
                if(results.length == 1){
                    //カード一枚
                    await step.context.sendActivity('お探しの演奏情報はこちら 1 件だけです');
                }
                else if(results.length > 1){
                    //カード複数
                    await step.context.sendActivity('お探しの演奏情報は複数あります');
                }
                let carouselData = resp.result.value;

                let cards = [];

                carouselData.forEach(item=>{
                    cards.push(
                        CardFactory.adaptiveCard(that.renderCard({
                            image : item.image,
                            bandName : item.bandName,
                            genre : item.genre,
                            day : item.day,
                            startTime : item.startTime,
                            stage : item.stage,
                            descrip : item.description
                        }))
                    )
                })

                let result = MessageFactory.carousel(cards);
                return step.context.sendActivity(result);
        
            }            
        ]));
    }


renderCard(option){

    var card = ({
        "type": "AdaptiveCard",
        "body": [
        {
        "type": "Container",
        "items": [
        {
        "type": "Image",
        "style": "Person",
        "url": `https://westeuropebotassets.blob.core.windows.net/assets/images/${option.image}`,
        "size": "Stretch"
        },
        {
        "type": "TextBlock",
        "size": "Medium",
        "weight": "Bolder",
        "text": `${option.bandName} | ${option.genre} | ${option.day} | ${option.startTime} | ${option.stage}` ,
        "wrap": true
        },
        {
        "type": "TextBlock",
        "text": `${option.descrip}`,
        "wrap": true
        }
        ]
        }
        ],
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "version": "1.0"
    })

    return card;
    }
}


exports.navigateDialog = navigateDialog;