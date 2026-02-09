export const getErrorMessage = (response: any) => {
  if (response.message) {
    if (Array.isArray(response.message)) {
      return formatErrorMessage(response.message[0]);
    }
    if (response.error) {
      response.message = response.error.response.details
    }
    return formatErrorMessage(response.message);
  }
  return "Unknown error occured.";
};

const formatErrorMessage = (message: string) => {
  return message.charAt(0).toUpperCase() + message.slice(1);
};