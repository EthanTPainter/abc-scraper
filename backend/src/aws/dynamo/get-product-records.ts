import { dynamoDBDocClient } from "./lib/dynamoDBDocumentClient";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ProductRecord } from "./types/product-record";

const dynamoTableName = "ABC-Scraper-Table";

export const getProductRecords = async (username: string) => {
  // Product records should have Username as the requested username + "_Product"
  const parameters = {
    TableName: dynamoTableName,
    ExpressionAttributeValues: {
      ":user": `${username}_Product`,
    },
    KeyConditionExpression: "Username = :user",
  };

  const productRecords = await dynamoDBDocClient.send(
    new QueryCommand(parameters)
  );
  return (productRecords.Items as ProductRecord[]) ?? [];
};
