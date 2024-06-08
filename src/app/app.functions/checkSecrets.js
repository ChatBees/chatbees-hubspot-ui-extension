exports.main = async () => {
  const aid = process.env['CHATBEES_AID'];
  const collection_name = process.env['CHATBEES_COLLECTION_NAME'];
  const api_key = process.env['CHATBEES_API_KEY'];

  if (!aid || !collection_name || !api_key) {
    return false;
  }

  return await fetch(
    `https://${aid}.us-west-2.aws.chatbees.ai/collections/describe`,
    {
      method: 'POST',
      headers: {
        ['api-key']: api_key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        namespace_name: 'public',
        collection_name,
      }),
    },
  ).then((response) => {
    return response.ok;
  });
};
