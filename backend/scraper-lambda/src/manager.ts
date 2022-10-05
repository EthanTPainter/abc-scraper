import { getProductRecords } from "./aws/dynamo/get-product-records";
import { getUserRecord } from "./aws/dynamo/get-user-record";
import { ProductRecord } from "./aws/dynamo/types/product-record";
import { updateProductRecord } from "./aws/dynamo/update-product-record";
import { getProductInventory, parseInventoryTable } from "./scraping/scraper";

const ALERT_DELAY_DAYS = 7;

/**
 * Retrieve user info from Dynamo
 */
export const retrieveUserInfo = async (username: string) => {
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
  size?: string
) => {
  console.log(`Getting product inventory`);
  const table = await getProductInventory(type, name, size);
  if (!table) return;

  console.log(`Parsing inventory table`);
  const response = await parseInventoryTable(table);
  if (response.length === 0) {
    console.log(`No inventory found for ${type} ${name} with size ${size}`);
    return;
  }

  return response;
};

/**
 * To tell whether or not an alert can be sent to the user if inventory is found.
 * @param previousAlertDate String date format (YYYY-MM-DD) of the last alert sent out for the product
 * @returns boolean to send alert or not
 */
export const canSendAlert = (previousAlertDate?: string) => {
  // If previous alert date is not set, an alert can be sent
  if (!previousAlertDate) return true;

  const currentDate = new Date();
  const currentDateString = `${currentDate.getFullYear()}-${
    currentDate.getMonth() + 1
  }-${currentDate.getDate()}`;
  const previousDateParts = previousAlertDate.split("-");
  const previousDateString = `${previousDateParts[0]}-${parseInt(
    previousDateParts[1] + 1
  )}-${previousDateParts[2]}`;

  const newDate = new Date(currentDateString);
  const previousDate = new Date(previousDateString);
  const earliestDateAfterDelay = new Date();
  earliestDateAfterDelay.setDate(previousDate.getDate() + ALERT_DELAY_DAYS);

  return earliestDateAfterDelay < newDate;
};

export const updateRecordWithTime = async (product: ProductRecord) => {
  const newDate = new Date();
  const dateString = `${newDate.getFullYear()}-${
    newDate.getMonth() + 1
  }-${newDate.getDate()}`;
  const updatedProduct = {
    ...product,
    PreviousAlertDate: dateString,
  } as ProductRecord;
  await updateProductRecord(updatedProduct);
};

export const createSmsTextMessage = (
  productTitle: string,
  productInventory: { address: string; miles: number; inventory: number }[],
  productSize?: string
) => {
  let initialMessage = productSize
    ? `ABC ALERT: ${productTitle} for size ${productSize} was found in stock nearby in the following locations: `
    : `ABC ALERT: ${productTitle} was found in stock nearby in the following locations: `;

  productInventory.forEach((location) => {
    initialMessage += `${location.inventory} found at ${location.address}. `;
  });

  return initialMessage;
};
