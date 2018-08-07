const Jimp = require("jimp");
const axios = require('axios');
const uuidV4 = require('uuid/v4');


module.exports = function (context, myBlob) {
    console.log("here");
    context.log("JavaScript blob trigger function processed blob \n Name:", context.bindingData.name, "\n Blob Size:", myBlob.length, "Bytes");
    Jimp.read(myBlob).then(image => {
        image
            .cover(200, 200) 
            .quality(60)
            .getBuffer(Jimp.MIME_JPEG, (error, stream) => {
                if (error) {
                    context.done(error);
                } else {
                    context.log('calling cog svc');
                    return axios.post(process.env.COMP_VISION_URL + '/analyze?visualFeatures=Description&language=en', myBlob, {
                        headers: {
                            'Ocp-Apim-Subscription-Key': process.env.COMP_VISION_KEY,
                            'Content-Type': 'application/octet-stream'
                        }
                    }).then(response => {
                        context.log("called cog svc complete");
                        context.log(JSON.stringify(response.data, null, 2));
                        context.bindings.thumbnail = stream;
                        var result = {
                            id: uuidV4(),
                            name: context.bindingData.name,
                            imgPath: "/images/" + context.bindingData.name,
                            thumbnailPath: "/thumbnails/" + context.bindingData.name,
                            description: response.data.description.captions[0].text,
                            tags: response.data.description.tags
                        };

                        return axios
                        .post(
                            process.env.INDEXER_URL + "&index=imageindex",
                          result,
                          {
                            headers: {}
                          }
                        )
                        .then(response => {
                          context.log("document indexer called");
                          context.done();
                        })
                        .catch(err => {
                          context.done(err);
                        });
                        

                    }).catch(err => {
                        context.done(err);
                    });

                }
            });
    }).catch(context.log);
};