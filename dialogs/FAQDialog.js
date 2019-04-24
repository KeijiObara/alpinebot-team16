const { ComponentDialog, ChoicePrompt, WaterfallDialog, TextPrompt } = require('botbuilder-dialogs');
//const { getValidDonationDays, filterFoodBanksByDonation, createFoodBankDonationCarousel } = require('../services/schedule-helpers');
//const { getanswer } = require('../services/get-answer');
const { QnAMaker } = require('botbuilder-ai');

class faqDialog extends ComponentDialog {
    constructor(dialogId) {
        super(dialogId);

        const qnaEndpointSettings = {
            knowledgeBaseId: "c1b9a674-2340-4808-9996-685bba53dd2a",//qnaConfig.kbId,
            endpointKey: "928e23f5-c647-421f-82ca-3eec3d22318f",//qnaConfig.endpointKey,
            host: "https://team-16qna.azurewebsites.net/qnamaker"//qnaConfig.hostname
        };
        

        this.qnaMaker = new QnAMaker(qnaEndpointSettings, {});
        let bot = this;

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
                const qnaResults = await bot.qnaMaker.getAnswers(step.context);
                if(qnaResults.length > 0)
                    return step.context.sendActivity(qnaResults[0].answer);

                return step.context.sendActivity("No result found");
                //const day = step.result.value;
                //let filteredFoodBanks = filterFoodBanksByDonation(day);
                //let carousel = createFoodBankDonationCarousel(filteredFoodBanks);
                //return step.context.sendActivity(carousel);
            }
        ]));
    }
}

exports.faqDialog = faqDialog;