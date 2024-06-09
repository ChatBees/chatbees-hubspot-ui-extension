const { uniqBy } = require('lodash');

exports.main = async ({ parameters }) => {
  const aid = process.env['CHATBEES_AID'];
  const collection_name = process.env['CHATBEES_COLLECTION_NAME'];
  const api_key = process.env['CHATBEES_API_KEY'];

  const { question, conversationId } = parameters;

  return await fetch(`https://${aid}.us-west-2.aws.chatbees.ai/docs/ask`, {
    method: 'POST',
    headers: {
      ['api-key']: api_key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      namespace_name: 'public',
      collection_name: collection_name,
      question,
      conversation_id: conversationId,
    }),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }

      throw new Error(
        `status: ${response.status}, error: ${response.statusText}`,
      );
    })
    .then((data) => {
      data.refs = uniqBy(
        data.refs?.filter(({ doc_name }) => doc_name?.match(/^https?:\/\//)),
        'doc_name',
      ).slice(0, process.env['CHATBEES_MAX_REFS'] || 3);

      return data;
    })
};
