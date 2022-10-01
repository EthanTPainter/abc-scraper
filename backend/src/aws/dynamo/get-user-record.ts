import { dynamoDBDocClient } from "./lib/dynamoDBDocumentClient";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

const dynamoTableName = "ABC-Scraper-Table";

type UserRecord = {
  Username: string,
  ProductName: string;
}

/**
 * Get the dynamo user record
 * @param username Username of the user
 * @returns Full dynamo record of the provided user
 */
export const getUserRecord = async (username: string) => {
  // Hardcoded username for only one user right now
  const parameters = {
    TableName: dynamoTableName,
    Key: {
      Username: username,
      ProductName: "null"
    }
  };
  const record = await dynamoDBDocClient.send(new GetCommand(parameters));
  return record.Item as UserRecord ?? null;
};