const { ComponentDialog, ChoicePrompt, WaterfallDialog, TextPrompt } = require('botbuilder-dialogs');
const { CardFactory, MessageFactory } = require('botbuilder');
const { SearchService } = require('azure-search-client');


class bandSearchDialog extends ComponentDialog {
    constructor(dialogId) {
        super(dialogId);

        let that = this;

        const searchEndpointSettings = { 
            serviceName: "fukawa", 
            primaryKey: "D229D250E14B7FDFE2A76950257E937C", 
            index: "azureblob-index"//, 
        };

        let azureSearch = this.azureSearch = new SearchService(
            searchEndpointSettings.serviceName, searchEndpointSettings.primaryKey
            );// ;
        
        // ID of the child dialog that should be started anytime the component is started.
        this.initialDialogId = dialogId;


        this.addDialog(new ChoicePrompt('choicePrompt'));
        this.addDialog(new TextPrompt('textprompt'));

        // Define the conversation flow using a waterfall model.
        this.addDialog(new WaterfallDialog(dialogId, [
            async function (step) {
                await step.context.sendActivity("")

                return await step.prompt('textprompt',{
                   prompt: "What band would you like to search for?",
                });
            },
            async function (step) {
                var searchWord = step.result;
                const resp = await azureSearch.indexes.use("azureblob-index").search({ search: searchWord, searchFields: "bandName" });

                let carouselData = resp.result.value;

                let cards = [];

                carouselData.forEach(item=>{
                    cards.push(
                        CardFactory.adaptiveCard(that.renderCard([
                            item.image,
                            item.bandName,
                            item.genre,
                            item.day,
                            item.startTime,
                            item.stage,
                            item.description
                        ]))
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
            "url": "https://westeuropebotassets.blob.core.windows.net/assets/images/"&option[0],
            "size": "Stretch"
            },
            {
            "type": "TextBlock",
            "size": "Medium",
            "weight": "Bolder",
            "text": option[1] &"|"& option[2] &"|"& option[3] &"|"& option[4] &"|"& option[5] 
            },
            {
            "type": "TextBlock",
            "text": option[6],
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

exports.bandSearchDialog = bandSearchDialog;