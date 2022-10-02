import { getProductRecords } from "./aws/dynamo/get-product-records";
import { getUserRecord } from "./aws/dynamo/get-user-record";
import { getProductInventory, parseInventoryTable } from "./scraping/scraper";

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

export const retrieveProductInventory = async (
  type: string,
  name: string,
  size: string
) => {
  const table = await getProductInventory(type, name, size);
  if (!table) return;

  const response = await parseInventoryTable(table);
  if (response.length === 0) {
    console.log(`No inventory found for ${type} ${name} with size ${size}`); 
    return;
  }

  return response;
};
