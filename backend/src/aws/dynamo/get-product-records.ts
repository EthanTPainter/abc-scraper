import { DynamoDB } from "aws-sdk";

const dynamoClient = new DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });

const dynamoTableName = "ABC-Scraper-Table";

export const getProductRecords = async (username: string) => {
  const parameters = {
    TableName: dynamoTableName,
    ExpressionAttributeValues: {
      ':user': "null",
    },
    KeyConditionExpression: 'Username = :user',
  };

  const productRecords = await dynamoClient.query(parameters).promise();
  console.log(`PRODUCT COUNT: `, productRecords.Count);
  console.log(`PRODUCT ITEMS:`, productRecords.Items);
  return productRecords.Items ?? [];
};