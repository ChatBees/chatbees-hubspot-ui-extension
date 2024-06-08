const { uniqBy } = require("lodash");

exports.main = async ({ parameters }) => {
  const aid = process.env["CHATBEES_AID"];
  const collection_name = process.env["CHATBEES_COLLECTION_NAME"];
  const api_key = process.env["CHATBEES_API_KEY"];

  const { question, conversationId } = parameters;

  const jsonData = JSON.stringify({
    namespace_name: "public",
    collection_name: collection_name,
    question,
    conversation_id: conversationId,
  });

  return await fetch(`https://${aid}.us-west-2.aws.chatbees.ai/docs/ask`, {
    method: "POST",
    headers: {
      ["api-key"]: api_key,
      "Content-Type": "application/json",
    },
    body: jsonData,
  })
    .then((response) => {
      if (response.ok) {
        const data = response.json();
        data.refs = uniqBy(
          data.refs?.filter(({ doc_name }) => doc_name?.match(/^https?:\/\//)),
          "doc_name"
        );

        return data;
      }

      throw new Error(
        `status: ${response.status}, error: ${response.statusText}`
      );
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};