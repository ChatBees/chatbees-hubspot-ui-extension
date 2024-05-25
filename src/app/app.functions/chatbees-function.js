exports.main = async (context = {}) => {
  const { msg } = context.parameters;

  const namespaceName = "public";
  const collectionName = "ng-doc";
  const aid = "WELM90Y4";

  let jsonData = JSON.stringify({
    namespace_name: namespaceName,
    collection_name: collectionName,
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
