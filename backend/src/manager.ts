import { getProductRecords } from "./aws/dynamo/get-product-records";
import { getUserRecord } from "./aws/dynamo/get-user-record";

/**
 * Retrieve user info from Dynamo
 */
export const retrieveUserInfo = async () => {
  const username = "Les";
  const dynamoRecord = await getUserRecord(username);
  if (!getUserRecord) {
    throw new Error(`User not found with username: ${username}`);
  }
  return dynamoRecord;
};

/**
 * Retrieve product info from Dynamo
 */
export const retrieveProductInfo = async (username: string) => {
  const dynamoRecords = await getProductRecords(username);
  if (dynamoRecords.length === 0) {
    console.log(`No records found`);
  }
  return dynamoRecords;
};