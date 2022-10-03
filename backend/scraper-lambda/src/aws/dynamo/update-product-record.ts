import { dynamoDBDocClient } from "./lib/dynamoDBDocumentClient";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

import { ProductRecord } from "./types/product-record";

const dynamoTableName = "ABC-Scraper-Table";

export const updateProductRecord = async (productRecord: ProductRecord) => {
  const parameters = {
    TableName: dynamoTableName,
    Key: {
      Username: productRecord.Username,
      ProductName: productRecord.ProductName
    },
    UpdateExpression: 'set #t = :t',
    ExpressionAttributeNames: {
      '#t': 'PreviousAlertDate'
    },
    ExpressionAttributeValues: {
      ':t': productRecord.PreviousAlertDate
    }
  };

  try {
    await dynamoDBDocClient.send(new UpdateCommand(parameters));
  } catch (error) {
    console.log(`Error updating DynamoDB with error: `, error);
  }
};
