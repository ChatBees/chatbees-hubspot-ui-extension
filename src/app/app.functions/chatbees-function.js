const hubspot = require("@hubspot/api-client");

const hubspotClient = new hubspot.Client({
  accessToken: process.env["PRIVATE_APP_ACCESS_TOKEN"],
});

let hubDBTablesCache = null;
let hubDBTableRowsCache = {};

// Function to get all tables from a HubDB
async function fetchHubDBTables() {
  if (hubDBTablesCache) {
    return hubDBTablesCache;
  }
  try {
    const apiResponse = await hubspotClient.cms.hubdb.tablesApi.getAllTables();
    hubDBTablesCache = apiResponse.results;
    return hubDBTablesCache;
  } catch (error) {
    console.error("Error fetching HubDB tables:", error);
  }
}

// Function to fetch rows from a HubDB table
async function fetchHubDBTableRows(tableId) {
  if (hubDBTableRowsCache[tableId]) {
    return hubDBTableRowsCache[tableId];
  }
  try {
    const apiResponse = await hubspotClient.cms.hubdb.rowsApi.getTableRows(tableId);
    hubDBTableRowsCache[tableId] = apiResponse.results;
    return hubDBTableRowsCache[tableId];
  } catch (error) {
    console.error("Error fetching HubDB table rows:", error);
  }
}

exports.main = async (context = {}) => {

  const hubDBTables = await fetchHubDBTables();
  const { id } = hubDBTables.find(({ name }) => name === "chatbees");
  const { aid, collection_name, api_key } = (await fetchHubDBTableRows(id))?.[0]?.values || {};

  const { msg } = context.parameters;

  const namespaceName = "public";

  let jsonData = JSON.stringify({
    namespace_name: namespaceName,
    collection_name: collection_name,
    question: msg,
  });

  const apiUrl = "https://" + aid + ".us-west-2.aws.chatbees.ai/docs/ask";

  let response;

  const headers = {
    // If the collection does not allow public read, please add your api-key here.
    "Content-Type": "application/json",
  };

  if (api_key) {
    headers ["api-key"] = api_key;
  }

  response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: jsonData,
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(
        `status: ${response.status}, error: ${response.statusText}`,
      );
    })
    .then((botMsg) => {
      return botMsg.answer;
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  return response;
};
