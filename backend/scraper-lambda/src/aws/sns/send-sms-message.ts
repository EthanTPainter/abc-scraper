import { PublishCommand } from "@aws-sdk/client-sns";
import { snsClient } from "./lib/sns-client";

export const sendNotification = async (text: string, phoneNumber: string) => {
  const parameters = {
    Message: text,
    PhoneNumber: phoneNumber
  };
  try {
    const data = await snsClient.send(new PublishCommand(parameters));
    console.log(`Sent Text to ${phoneNumber} with message Id ${data.MessageId}`);
  } catch (error) {
    console.log(`Erorr sending text message to ${phoneNumber}`);
    console.log(error);
  }
};