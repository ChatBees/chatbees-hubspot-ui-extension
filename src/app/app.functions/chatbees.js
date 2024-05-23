exports.main = async (context = {}) => {
  const { msg } = context.parameters;

  const response = `This is coming from chatbees function! You said: ${msg}`;

  return response;
};
