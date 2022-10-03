import { dynamoDBDocClient } from "./lib/dynamoDBDocumentClient";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { UserRecord } from "./types/user-record";

const dynamoTableName = "ABC-Scraper-Table";

/**
 * Get the dynamo user record
 * @param username Username of the user
 * @returns Full dynamo record of the provided user
 */
export const getUserRecord = async (username: string) => {
  // User records should have first name as Username, and "null" as ProductName
  const parameters = {
    TableName: dynamoTableName,
    Key: {
      Username: username,
      ProductName: "null",
    },
  };
  const record = await dynamoDBDocClient.send(new GetCommand(parameters));
  return (record.Item as UserRecord) ?? null;
};
