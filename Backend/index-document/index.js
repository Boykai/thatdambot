const axios = require("axios");
var AzureSearch = require("azure-search");

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

module.exports = function(context, req) {
  context.log(
    "Node.js HTTP trigger function processed a request. RequestUri=%s",
    req.originalUrl
  );

  var index = req.query.index;
  var doc = JSON.stringify(req.body);
  context.log("index: " + index);
  context.log("body: " + doc);

  client.getIndex(index, function(err, schema) {
    // optional error, or the schema object back from the service
    if (err) {
      context.log("error");
      context.log(err);
      createIndex(context, index,req.body);
      
    } else {
      context.log("adding doc");
      context.log(doc);

      client.addDocuments(index, [req.body], function(err, results) {
        if (err) {
          context.done(JSON.stringify(err));
        } else {
          context.done(null, "complete");
        }
      });
    }
  });
};

function createIndex(context, index, body) {
  context.log("creating index");
  var indexSchema = videoSchema;
  
  
  if(index=="imageindex"){
    indexSchema = imageSchema;
  }
  indexSchema.name = index;
  client.createIndex(indexSchema, function(err, indexSchema) {
    // optional error, or the schema object back from the service
    if (err) {
      context.log("error in creating an index");
      context.log(JSON.stringify(err));
    }
    else{
      client.addDocuments(index, [body], function(err, results) {
        if (err) {
          context.log("error adding doc");
          context.done(JSON.stringify(err));
        } else {
          context.log("doc added")
          context.done(null, "complete");
        }
      });
    }
  });
}

var videoSchema = {
  name: "myindex",
  fields: [
    {
      name: "id",
      type: "Edm.String",
      searchable: false,
      filterable: false,
      retrievable: true,
      sortable: false,
      facetable: false,
      key: true,
      indexAnalyzer: null,
      searchAnalyzer: null,
      analyzer: null,
      synonymMaps: []
    },
    {
      name: "name",
      type: "Edm.String",
      searchable: true,
      filterable: false,
      retrievable: true,
      sortable: false,
      facetable: false,
      key: false,
      indexAnalyzer: null,
      searchAnalyzer: null,
      analyzer: "standard.lucene",
      synonymMaps: []
    },
    {
      name: "userName",
      type: "Edm.String",
      searchable: false,
      filterable: true,
      retrievable: false,
      sortable: false,
      facetable: true,
      key: false,
      indexAnalyzer: null,
      searchAnalyzer: null,
      analyzer: null,
      synonymMaps: []
    },
    {
      name: "created",
      type: "Edm.DateTimeOffset",
      searchable: false,
      filterable: true,
      retrievable: true,
      sortable: true,
      facetable: false,
      key: false,
      indexAnalyzer: null,
      searchAnalyzer: null,
      analyzer: null,
      synonymMaps: []
    },
    {
      name: "duration",
      type: "Edm.Int64",
      searchable: false,
      filterable: true,
      retrievable: true,
      sortable: true,
      facetable: false,
      key: false,
      indexAnalyzer: null,
      searchAnalyzer: null,
      analyzer: null,
      synonymMaps: []
    },
    {
      name: "faces",
      type: "Collection(Edm.String)",
      searchable: true,
      filterable: false,
      retrievable: false,
      sortable: false,
      facetable: false,
      key: false,
      indexAnalyzer: null,
      searchAnalyzer: null,
      analyzer: "standard.lucene",
      synonymMaps: []
    },
    {
      name: "keywords",
      type: "Collection(Edm.String)",
      searchable: true,
      filterable: false,
      retrievable: false,
      sortable: false,
      facetable: false,
      key: false,
      indexAnalyzer: null,
      searchAnalyzer: null,
      analyzer: "standard.lucene",
      synonymMaps: []
    },
    {
      name: "labels",
      type: "Collection(Edm.String)",
      searchable: true,
      filterable: false,
      retrievable: false,
      sortable: false,
      facetable: false,
      key: false,
      indexAnalyzer: null,
      searchAnalyzer: null,
      analyzer: "standard.lucene",
      synonymMaps: []
    },
    {
      name: "transcriptText",
      type: "Edm.String",
      searchable: true,
      filterable: false,
      retrievable: false,
      sortable: false,
      facetable: false,
      key: false,
      indexAnalyzer: null,
      searchAnalyzer: null,
      analyzer: "standard.lucene",
      synonymMaps: []
    },
    {
      name: "transcriptOcr",
      type: "Edm.String",
      searchable: true,
      filterable: false,
      retrievable: false,
      sortable: false,
      facetable: false,
      key: false,
      indexAnalyzer: null,
      searchAnalyzer: null,
      analyzer: "standard.lucene",
      synonymMaps: []
    },
    {
      name: "videoPath",
      type: "Edm.String",
      searchable: false,
      filterable: false,
      retrievable: true,
      sortable: false,
      facetable: false,
      key: false,
      indexAnalyzer: null,
      searchAnalyzer: null,
      analyzer: null,
      synonymMaps: []
    },
    {
      name: "rid",
      type: "Edm.String",
      searchable: false,
      filterable: false,
      retrievable: false,
      sortable: false,
      facetable: false,
      key: false,
      indexAnalyzer: null,
      searchAnalyzer: null,
      analyzer: null,
      synonymMaps: []
    }
  ]
};

var imageSchema = {
  name: "myindex",
  fields: [
    {
      name: "id",
      type: "Edm.String",
      searchable: false,
      filterable: false,
      retrievable: true,
      sortable: false,
      facetable: false,
      key: true,
      indexAnalyzer: null,
      searchAnalyzer: null,
      analyzer: null,
      synonymMaps: []
    },
    {
      name: "name",
      type: "Edm.String",
      searchable: true,
      filterable: false,
      retrievable: true,
      sortable: false,
      facetable: false,
      key: false,
      indexAnalyzer: null,
      searchAnalyzer: null,
      analyzer: null,
      synonymMaps: []
    },
    {
      name: "imgPath",
      type: "Edm.String",
      searchable: false,
      filterable: false,
      retrievable: true,
      sortable: false,
      facetable: false,
      key: false,
      indexAnalyzer: null,
      searchAnalyzer: null,
      analyzer: null,
      synonymMaps: []
    },
    {
      name: "thumbnailPath",
      type: "Edm.String",
      searchable: false,
      filterable: false,
      retrievable: true,
      sortable: false,
      facetable: true,
      key: false,
      indexAnalyzer: null,
      searchAnalyzer: null,
      analyzer: null,
      synonymMaps: []
    },
    {
      name: "description",
      type: "Edm.String",
      searchable: true,
      filterable: false,
      retrievable: true,
      sortable: false,
      facetable: false,
      key: false,
      indexAnalyzer: null,
      searchAnalyzer: null,
      analyzer: "standard.lucene",
      synonymMaps: []
    },
    {
      name: "tags",
      type: "Collection(Edm.String)",
      searchable: true,
      filterable: false,
      retrievable: false,
      sortable: false,
      facetable: false,
      key: false,
      indexAnalyzer: null,
      searchAnalyzer: null,
      analyzer: "standard.lucene",
      synonymMaps: []
    }
  ]};
