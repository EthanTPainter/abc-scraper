import { dynamoDBDocClient } from "./lib/dynamoDBDocumentClient";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";

const dynamoTableName = "ABC-Scraper-Table";

export const getProductRecords = async (username: string) => {
  const parameters = {
    TableName: dynamoTableName,
    ExpressionAttributeValues: {
      ':user': "null",
    },
    KeyConditionExpression: 'Username = :user',
  };

  const productRecords = await dynamoDBDocClient.send(new QueryCommand(parameters));
  return productRecords.Items ?? [];
};