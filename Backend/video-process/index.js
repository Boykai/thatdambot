const axios = require("axios");

function processData(data){
  var videoData = {}
  videoData.name = data.name;
  videoData.id = data.id;
  videoData.userName = data.userName;
  videoData.created = data.created;
  videoData.duration = data.summarizedInsights.duration.seconds;
  videoData.faces = [];
  for(var x in data.faces){
    videoData.faces.push(data.summarizedInsights.faces[x].name);
  }

  videoData.keywords = [];

  for(var x in data.summarizedInsights.keywords){
    videoData.keywords.push(data.summarizedInsights.keywords[x].name);
  }

  
  videoData.labels = [];

  for(var x in data.summarizedInsights.labels){
    videoData.labels.push(data.summarizedInsights.labels[x].name);
  }

  videoData.transcriptText = "";
  videoData.transcriptOcr = "";
  
  for(var x in data.videos[0].insights.transcript){
    videoData.transcriptText += " " + data.videos[0].insights.transcript[x].text;
    videoData.transcriptOcr += " " + data.videos[0].insights.transcript[x].ocr;
  }
  console.log("here" + data.accountId);
  videoData.videoPath = "https://www.videoindexer.ai/accounts/" + data.accountId + "/videos/" + data.id;

  return videoData;

}

module.exports = function(context, req) {
    context.log('Node.js HTTP trigger function processed a request. RequestUri=%s', req.originalUrl);

    var videoId = req.query.id;
    context.log("Video id: " + videoId);
    var location = process.env.VI_REGION;
    var accountId = process.env.VI_ACCT_ID;
    var key = process.env.VI_API_KEY;
    axios
      .get(
        "https://api.videoindexer.ai/auth/" +
          location +
          "/Accounts/" +
          accountId +
          "/AccessToken?allowEdit=true",
        {
          headers: {
            "Ocp-Apim-Subscription-Key": key
          }
        }
      )
      .then(response => {
        context.log("got token");
        return axios
          .get(
            "https://api.videoindexer.ai/" +
              location +
              "/Accounts/" +
              accountId +
              "/Videos/" +
              videoId + 
              "/Index?accessToken=" +
              encodeURIComponent(response.data),
            {
              headers: {}
            }
          )
          .then(response => {
            context.log(response.data);
            var result = processData(response.data);
            //context.log(result);
            var restCall = axios
            .post(
             process.env.INDEXER_URL + "&index=videoindex",
              result,
              {
                headers: {}
              }
            )
            .then(response => {
              context.log("document indexer called");
            })
            .catch(err => {
              context.log(err);
              context.done(err);
            });
            context.done(null, restCall);
          })
          .catch(err => {
            context.log(err);
            context.done(err);
          });
      })
      .catch(err => {
        context.log(JSON.stringify(err));
        context.done(err);
      });
  };