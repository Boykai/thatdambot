var AzureSearch = require('azure-search');
var client = AzureSearch({
    url: process.env.SEARCH_URL,
    key: process.env.SEARCH_KEY,
    version: "2017-11-11", // optional, can be used to enable preview apis
    headers: {
      // optional, for example to enable searchId in telemetry in logs
      "x-ms-azs-return-searchid": "true",
      "Access-Control-Expose-Headers": "x-ms-azs-searchid"
    }
  });

const searchAssets = (searchTerm, searchType) => {
    console.log("searching for " + searchType);
    return new Promise((resolve, reject) => {
        var index = "imageindex";
        if(searchType === "videos"){
            index= "videoindex";
        }

        console.log("search index: " + index);
        client.search(index, {search: searchTerm, top: 10}, function(err, results){
            // optional error, or an array of matching results
            resolve(results);
        });
    });
}

const searchHotelReviews = (hotelName) => {
    return new Promise((resolve, reject) => {
        // Filling the review results manually just for demo purposes
        let reviews = Array(5).fill({});
        reviews = reviews.map(review => {
            return {
                title: ReviewsOptions[Math.floor(Math.random() * ReviewsOptions.length)],
                text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Mauris odio magna, sodales vel ligula sit amet, vulputate vehicula velit.
                Nulla quis consectetur neque, sed commodo metus.`,
                image: 'https://upload.wikimedia.org/wikipedia/en/e/ee/Unknown-person.gif'
            };
        });
        // complete promise with a timer to simulate async response
        setTimeout(() => { resolve(reviews); }, 1000);
    });
}

module.exports = {
    searchAssets,
    searchHotelReviews
};