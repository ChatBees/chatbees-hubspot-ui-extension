exports.main = async (context = {}) => {
  const { text } = context.parameters;

  return `This is coming from the example function! You said: ${text}`;
};
