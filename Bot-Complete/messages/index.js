/*-----------------------------------------------------------------------------
A simple Language Understanding (LUIS) bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

 
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");
require('dotenv').load();
const Store = require('./store');


var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

// Listen for messages from users 
// server.post('/api/messages', connector.listen());


/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
// This default message handler is invoked if the user's utterance doesn't
// match any intents handled by other dialogs.
var bot = new builder.UniversalBot(connector, function (session, args) {
    session.send('You reached the default message handler. You said \'%s\'.', session.message.text);
});

bot.set('storage', tableStorage);

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?subscription-key=' + luisAPIKey;
// Create a recognizer that gets intents from LUIS, and add it to the bot
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.recognizer(recognizer);

// Send welcome when conversation with bot is started, by initiating the root dialog
bot.on('conversationUpdate', function (message) {
    if (message.membersAdded) {
        message.membersAdded.forEach(function (identity) {
            if (identity.id === message.address.bot.id) {
                bot.beginDialog(message.address, "WelcomeDialog", '/');
            }
        });
    }
});

// Add a dialog for each intent that the LUIS app recognizes.
// See https://docs.microsoft.com/bot-framework/nodejs/bot-builder-nodejs-recognize-intent-luis 
bot.dialog('GreetingDialog',
    (session) => {
        session.send('You reached the Greeting intent. You said \'%s\'.', session.message.text);
        session.endDialog();
    }
).triggerAction({
    matches: 'Greeting'
})

bot.dialog('WelcomeDialog',
    (session) => {
        session.send('Welcome to **thatDAMBot**. I am here to help you find your assets. What are you looking for?');
        session.endDialog();
    }
).triggerAction({
    matches: 'welcome'
})

bot.dialog('HelpDialog',
    (session) => {
        session.send('You reached the Help intent. You said \'%s\'.', session.message.text);
        session.endDialog();
    }
).triggerAction({
    matches: 'Help'
})

bot.dialog('SearchAssets', [
    (session, args, next) => {
        session.send('We are searching for ' + session.message.text);
        // try extracting entities
        const searchType = builder.EntityRecognizer.findEntity(args.intent.entities, 'asset-type');
        const searchTerm = builder.EntityRecognizer.findEntity(args.intent.entities, 'search-keywords');
        console.log("searchTerm: " + JSON.stringify(searchTerm.entity));
        console.log("searchTerm: " + searchType.entity);
        if (searchType.entity) {
            // city entity detected, continue to next step
            session.dialogData.searchType = searchType.entity;
            next({ response: searchTerm.entity });
        } else {
            // no entities detected, ask user for a destination
            builder.Prompts.text(session, 'Please try again');
        }
    },
    (session, results) => {
        const searchTerm = results.response;
        let message = 'Looking for assets';
        var assetAsAttachment = imageAsAttachment;
        if(session.dialogData.searchType == "videos" || session.dialogData.searchType == "video"){
            assetAsAttachment = videoAsAttachment;
        }
       session.send(message);
        // Async search
        Store
            .searchAssets(searchTerm, session.dialogData.searchType)
            .then(assets => {
                // args
                session.send(`I found ${assets.length} assets:`);
                let message = new builder.Message()
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments(assets.map(assetAsAttachment));
                session.send(message);
                // End
                session.endDialog();
            });
    }
]).triggerAction({
    matches: 'SearchAssets',
    onInterrupted:  session => {
        session.send('Please provide a search term or type help for more guidance');
    }
});

bot.dialog('CancelDialog',
    (session) => {
        session.send('You reached the Cancel intent. You said \'%s\'.', session.message.text);
        session.endDialog();
    }
).triggerAction({
    matches: 'Cancel'
})

const imageAsAttachment = asset => {
    console.log(process.env.ASSET_STORAGE + asset.imgPath);
    return new builder.HeroCard()
        .title(asset.name)
        .subtitle(asset.description)
        .images([new builder.CardImage().url(process.env.ASSET_STORAGE + asset.imgPath)])
        .buttons([
            new builder.CardAction()
                .title('More details')
                .type('openUrl')
                .value(process.env.ASSET_STORAGE + asset.imgPath)
        ]);
}

const videoAsAttachment = asset => {
    console.log(asset.videoPath);
    return new builder.HeroCard()
        .title(asset.name)
        .subtitle(asset.description)
        .buttons([
            new builder.CardAction()
                .title('More details')
                .type('openUrl')
                .value(asset.videoPath)
        ]);
}

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = connector.listen();
}
