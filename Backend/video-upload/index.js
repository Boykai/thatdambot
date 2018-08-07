const axios = require("axios");
const azure = require("azure-storage");

module.exports = function(context, myBlob) {
  context.log(
    "Upload video \n Name:",
    context.bindingData.blobTrigger,
    "\n Blob Size:",
    myBlob.length,
    "Bytes"
  );

  var container = "videos";

  var sas = generateSasToken(context, container, context.bindingData.name, "r");

  var encodedSas = encodeURIComponent(sas);
  var urlToCall = process.env.VIDEO_PROCESS_URL;
  context.log(encodedSas);

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
        .post(
          "https://api.videoindexer.ai/" +
            location +
            "/Accounts/" +
            accountId +
            "/Videos?accessToken=" +
            encodeURIComponent(response.data) +
            "&name=" +
            context.bindingData.name +
            "&videoUrl=" +
            encodedSas +
            "&callbackUrl=" +
            encodeURIComponent(urlToCall),
          null,
          {
            headers: {}
          }
        )
        .then(response => {
          context.log("upload complete");
          context.done();
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

function generateSasToken(context, container, blobName, permissions) {
  var connString = process.env.AzureWebJobsStorage;
  var blobService = azure.createBlobService(connString);

  // Create a SAS token that expires in an hour
  // Set start time to five minutes ago to avoid clock skew.
  var startDate = new Date();
  startDate.setMinutes(startDate.getMinutes() - 5);
  var expiryDate = new Date(startDate);
  expiryDate.setMinutes(startDate.getMinutes() + 60);

  permissions = permissions || azure.BlobUtilities.SharedAccessPermissions.READ;

  var sharedAccessPolicy = {
    AccessPolicy: {
      Permissions: permissions,
      Start: startDate,
      Expiry: expiryDate
    }
  };

  var sasToken = blobService.generateSharedAccessSignature(
    container,
    blobName,
    sharedAccessPolicy
  );

  return blobService.getUrl(container, blobName, sasToken, true);
}
