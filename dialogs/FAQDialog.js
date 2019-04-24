const { ComponentDialog, ChoicePrompt, WaterfallDialog, TextPrompt } = require('botbuilder-dialogs');
//const { getValidDonationDays, filterFoodBanksByDonation, createFoodBankDonationCarousel } = require('../services/schedule-helpers');

class faqDialog extends ComponentDialog {
    constructor(dialogId) {
        super(dialogId);

        // ID of the child dialog that should be started anytime the component is started.
        this.initialDialogId = dialogId;


        this.addDialog(new ChoicePrompt('choicePrompt'));
        this.addDialog(new TextPrompt('textprompt'));

        // Define the conversation flow using a waterfall model.
        this.addDialog(new WaterfallDialog(dialogId, [
            async function (step) {
                //const validDonationDays = getValidDonationDays();

                await step.context.sendActivity("")

                return await step.prompt('textprompt',{
                   prompt: "Ask me a question about the festival and I'll do my best to answer!",
                });

                //return await step.prompt('choicePrompt', {
                //    choices: ["test","test2"],
                //    prompt: "What day would you like to donate food?",
                //    retryPrompt: "That's not a valid day! Please choose a valid day."
                //});
            },
            async function (step) {
                return step.context.sendActivity(step.result)
                //const day = step.result.value;
                //let filteredFoodBanks = filterFoodBanksByDonation(day);
                //let carousel = createFoodBankDonationCarousel(filteredFoodBanks);
                //return step.context.sendActivity(carousel);
            }
        ]));
    }
}

exports.faqDialog = faqDialog;