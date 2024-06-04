const hubspot = require('@hubspot/api-client');

const hubspotClient = new hubspot.Client({
  accessToken: process.env['PRIVATE_APP_ACCESS_TOKEN']
});

// Function to get all tables from a HubDB
async function fetchHubDBTables() {
  try {
    const apiResponse = await hubspotClient.cms.hubdb.tablesApi.getAllTables();
    return apiResponse.results;
  } catch (error) {
    console.error('Error fetching HubDB tables:', error);
  }
}

// Function to fetch rows from a HubDB table
async function fetchHubDBTableRows(tableId) {
  try {
    const apiResponse = await hubspotClient.cms.hubdb.rowsApi.getTableRows(tableId);
    return apiResponse.results[0].values;
  } catch (error) {
    console.error('Error fetching HubDB table rows:', error);
  }
}
exports.main = async (context = {}) => {

  const hubDBTables = await fetchHubDBTables();
  const { id } = hubDBTables.find(({name}) => name === "chatbees");
  const { aid, collection_name } = await fetchHubDBTableRows(id);

  const { msg } = context.parameters;

  const namespaceName = "public";

  let jsonData = JSON.stringify({
    namespace_name: namespaceName,
    collection_name: collection_name,
    question: msg,
  });

  const apiUrl = "https://" + aid + ".us-west-2.aws.chatbees.ai/docs/ask";

  let response = `This is coming from chatbees function! You said: ${msg}`;

  response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      // If the collection does not allow public read, please add your api-key here.
      // "api-key": "Replace with your API Key",
      "Content-Type": "application/json",
    },
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
