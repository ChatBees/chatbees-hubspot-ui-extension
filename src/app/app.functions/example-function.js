exports.main = async (context = {}) => {
  const { name, text } = context.parameters;

  const response = `This is coming from a serverless function! You entered: ${text}, You called: ${name}`;

  return response;
};
