exports.main = async (context = {}) => {
  const { , text } = context.parameters;

  const response = `This is coming from the example function! You said: ${text}`;

  return response;
};
