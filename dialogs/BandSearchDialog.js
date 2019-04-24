const { ComponentDialog, ChoicePrompt, WaterfallDialog, TextPrompt } = require('botbuilder-dialogs');
const { SearchService } = require('azure-search-client');


class bandSearchDialog extends ComponentDialog {
    constructor(dialogId) {
        super(dialogId);

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
                const resp = await azureSearch.indexes.use("azureblob-index").search({ search: "Dixie", searchFields: "bandName" });

                let result = resp.result.value;
        
                return step.context.sendActivity(result);
            }
        ]));
    }
}

exports.bandSearchDialog = bandSearchDialog;