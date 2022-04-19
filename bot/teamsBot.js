const axios = require("axios");
const querystring = require("querystring");
const { TeamsActivityHandler, CardFactory, TurnContext, TurnContextStateCollection} = require("botbuilder");
const rawWelcomeCard = require("./adaptiveCards/welcome.json");
const rawLearnCard = require("./adaptiveCards/learn.json");
const rawPlaceCard = require("./adaptiveCards/place.json");
const rawErrorCard = require("./adaptiveCards/error.json");
const rawCountryCard = require("./adaptiveCards/country.json");
const cardTools = require("@microsoft/adaptivecards-tools");
var fetch = require("node-fetch");
const { Console } = require("console");




class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();

    // record the likeCount
    this.likeCountObj = { likeCount: 0 };

    this.Welcome_message = {name: ""};

    this.Place = {name: "", description: "", country: "", region: "", population: 0, wikipedia_url: "", short_name:"", average_rating:'', url_img: '', safety: '', covid: '', google_events_url: '', vrbo_url: ''};

    this.Country = {name: "", population: "", safety: "", google_events_url: "", vrbo_url: "", currency_name: "", phone_prefix: "", capital: "", top_cities_and_towns: [], wikipedia_url: ""}
  

    this.onMessage(async (context, next) => {
      console.log("Running with Message Activity.");
      let txt = context.activity.text;
      console.log(context.activity.from.name);

      const removedMentionText = TurnContext.removeRecipientMention(
        context.activity
      );
      if (removedMentionText) {
        // Remove the line break
        txt = removedMentionText.toLowerCase().replace(/\n|\r/g, "").trim();
        const res = await fetch('http://dataservice.accuweather.com/locations/v1/cities/search?apikey=G9QMZYEpejoZHIeyfCdowJ7Sw1gkuwyt&q='+ txt);
        const json = await res.json();
        
        var net = require('follow-redirects').https;
        var fs = require('fs');
        var auth_key = Buffer.from('b7465f5de3a521af38c9f6d87dee9e1c:ee302224d6283f214dfcbd57b7baccca').toString('base64');
        


        
        async function GetRequest(city) {
          
        }
        
        
        
        if (txt != "welcome"){
          const ResponseUrl = 'https://api.roadgoat.com/api/v2/destinations/auto_complete?q=' + txt;
            let response = await fetch(ResponseUrl,
              {
                method: 'GET',
                headers:{
                  'Authorization': 'Basic Yjc0NjVmNWRlM2E1MjFhZjM4YzlmNmQ4N2RlZTllMWM6ZWUzMDIyMjRkNjI4M2YyMTRkZmNiZDU3YjdiYWNjY2E='
                }
            })
            let content = await response.json()
            
            let slug = content['data'][0]['attributes']['slug']
            const ResponseUrl2 = 'https://api.roadgoat.com/api/v2/destinations/' + slug
            let response2 = await fetch(ResponseUrl2,
              {
                method: 'GET',
                headers:{
                  'Authorization': 'Basic Yjc0NjVmNWRlM2E1MjFhZjM4YzlmNmQ4N2RlZTllMWM6ZWUzMDIyMjRkNjI4M2YyMTRkZmNiZDU3YjdiYWNjY2E='
                }
              })
            let content2 = await response2.json()
            console.log(content2['data']);
            if (content2['data']['attributes']['destination_type'] == "City") {
              this.Place.name = content2['data']['attributes']['name'];
              var name_place = content2['data']['attributes']['name'];
              this.Place.population = content2['data']['attributes']['population'];
              this.Place.wikipedia_url = content2['data']['attributes']['wikipedia_url'];
              this.Place.short_name = content2['data']['attributes']['short_name'];
              this.Place.average_rating = content2['data']['attributes']['average_rating'];
              this.Place.population = content2['data']['attributes']['population'];
              this.Place.safety = content2['data']['attributes']['safety'][name_place]['text'];
              this.Place.google_events_url = content2['data']['attributes']['google_events_url'];
              this.Place.vrbo_url = content2['data']['attributes']['airbnb_url'];
              console.log(content2['data']['attributes']);

              const card = cardTools.AdaptiveCards.declare(rawPlaceCard).render(this.Place);
              await context.sendActivity({ attachments: [CardFactory.adaptiveCard(card)] });
            } else if (content2['data']['attributes']['destination_type'] == "Country") {
              console.log(content2['data']);
              this.Country.name = content2['data']['attributes']['name'];
              var name_place = content2['data']['attributes']['name'];
              this.Country.population = content2['data']['attributes']['population'];
              this.Country.safety = content2['data']['attributes']['safety'][name_place]['text'];
              this.Country.capital = content2['data']['attributes']['capital'];
              this.Country.currency_name = content2['data']['attributes']['currency_name'];
              this.Country.wikipedia_url = content2['data']['attributes']['wikipedia_url'];
              this.Country.phone_prefix = content2['data']['attributes']['phone_prefix'];
              this.Country.top_cities_and_towns = content2['data']['attributes']['top_cities_and_towns'];
              const card = cardTools.AdaptiveCards.declare(rawCountryCard).render(this.Country);
              await context.sendActivity({ attachments: [CardFactory.adaptiveCard(card)] });
            }
            
            
        }
      }

      // Trigger command by IM text
      switch (txt) {
        case "welcome": {
          this.Welcome_message.name = context.activity.from.name;
          this.likeCountObj.likeCount = 0;
          const card = cardTools.AdaptiveCards.declare(rawWelcomeCard).render(this.Welcome_message);
          await context.sendActivity({ attachments: [CardFactory.adaptiveCard(card)] });
          break;
        }
        /**
         * case "yourCommand": {
         *   await context.sendActivity(`Add your response here!`);
         *   break;
         * }
         */
      }

      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });

    // Listen to MembersAdded event, view https://docs.microsoft.com/en-us/microsoftteams/platform/resources/bot-v3/bots-notifications for more events
    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      for (let cnt = 0; cnt < membersAdded.length; cnt++) {
        if (membersAdded[cnt].id) {
          const card = cardTools.AdaptiveCards.declareWithoutData(rawWelcomeCard).render();
          await context.sendActivity({ attachments: [CardFactory.adaptiveCard(card)] });
          break;
        }
      }
      await next();
    });
  }

  // Invoked when an action is taken on an Adaptive Card. The Adaptive Card sends an event to the Bot and this
  // method handles that event.
  async onAdaptiveCardInvoke(context, invokeValue) {
    // The verb "userlike" is sent from the Adaptive Card defined in adaptiveCards/learn.json
    if (invokeValue.action.verb === "userlike") {
      this.likeCountObj.likeCount++;
      const card = cardTools.AdaptiveCards.declare(rawLearnCard).render(this.likeCountObj);
      await context.updateActivity({
        type: "message",
        id: context.activity.replyToId,
        attachments: [CardFactory.adaptiveCard(card)],
      });
      return { statusCode: 200 };
    }
  }

  // Messaging extension Code
  // Action.
  handleTeamsMessagingExtensionSubmitAction(context, action) {
    switch (action.commandId) {
      case "createCard":
        return createCardCommand(context, action);
      case "shareMessage":
        return shareMessageCommand(context, action);
      default:
        throw new Error("NotImplemented");
    }
  }

  // Search.
  async handleTeamsMessagingExtensionQuery(context, query) {
    const searchQuery = query.parameters[0].value;
    const response = await axios.get(
      `http://registry.npmjs.com/-/v1/search?${querystring.stringify({
        text: searchQuery,
        size: 8,
      })}`
    );

    const attachments = [];
    response.data.objects.forEach((obj) => {
      const heroCard = CardFactory.heroCard(obj.package.name);
      const preview = CardFactory.heroCard(obj.package.name);
      preview.content.tap = {
        type: "invoke",
        value: { name: obj.package.name, description: obj.package.description },
      };
      const attachment = { ...heroCard, preview };
      attachments.push(attachment);
    });

    return {
      composeExtension: {
        type: "result",
        attachmentLayout: "list",
        attachments: attachments,
      },
    };
  }

  async handleTeamsMessagingExtensionSelectItem(context, obj) {
    return {
      composeExtension: {
        type: "result",
        attachmentLayout: "list",
        attachments: [CardFactory.heroCard(obj.name, obj.description)],
      },
    };
  }

  // Link Unfurling.
  handleTeamsAppBasedLinkQuery(context, query) {
    const attachment = CardFactory.thumbnailCard("Thumbnail Card", query.url, [query.url]);

    const result = {
      attachmentLayout: "list",
      type: "result",
      attachments: [attachment],
    };

    const response = {
      composeExtension: result,
    };
    return response;
  }
}

function createCardCommand(context, action) {
  // The user has chosen to create a card by choosing the 'Create Card' context menu command.
  const data = action.data;
  const heroCard = CardFactory.heroCard(data.title, data.text);
  heroCard.content.subtitle = data.subTitle;
  const attachment = {
    contentType: heroCard.contentType,
    content: heroCard.content,
    preview: heroCard,
  };

  return {
    composeExtension: {
      type: "result",
      attachmentLayout: "list",
      attachments: [attachment],
    },
  };
}

function shareMessageCommand(context, action) {
  // The user has chosen to share a message by choosing the 'Share Message' context menu command.
  let userName = "unknown";
  if (
    action.messagePayload &&
    action.messagePayload.from &&
    action.messagePayload.from.user &&
    action.messagePayload.from.user.displayName
  ) {
    userName = action.messagePayload.from.user.displayName;
  }

  // This Messaging Extension example allows the user to check a box to include an image with the
  // shared message.  This demonstrates sending custom parameters along with the message payload.
  let images = [];
  const includeImage = action.data.includeImage;
  if (includeImage === "true") {
    images = [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtB3AwMUeNoq4gUBGe6Ocj8kyh3bXa9ZbV7u1fVKQoyKFHdkqU",
    ];
  }
  const heroCard = CardFactory.heroCard(
    `${userName} originally sent this message:`,
    action.messagePayload.body.content,
    images
  );

  if (
    action.messagePayload &&
    action.messagePayload.attachment &&
    action.messagePayload.attachments.length > 0
  ) {
    // This sample does not add the MessagePayload Attachments.  This is left as an
    // exercise for the user.
    heroCard.content.subtitle = `(${action.messagePayload.attachments.length} Attachments not included)`;
  }

  const attachment = {
    contentType: heroCard.contentType,
    content: heroCard.content,
    preview: heroCard,
  };

  return {
    composeExtension: {
      type: "result",
      attachmentLayout: "list",
      attachments: [attachment],
    },
  };
}

module.exports.TeamsBot = TeamsBot;
