import { sendNotification } from "./aws/sns/send-sms-message";
import {
  canSendAlert,
  createSmsTextMessage,
  retrieveProductInfo,
  retrieveProductInventory,
  updateRecordWithTime,
} from "./manager";
import {
  closePuppeteer,
  loadBaseUrl,
  setStoreLocation,
} from "./scraping/scraper";

export const handler = async () => {
  const username = process.env.User;
  const phoneNumber = process.env.PhoneNumber;
  if (!username || !phoneNumber) {
    throw new Error(
      `Required environment variables 'User' or 'PhoneNumber' was not provided.`
    );
  }
  const products = await retrieveProductInfo(username);
  const allProductInventories = [];

  try {
    await loadBaseUrl();
    await setStoreLocation();
    for (const product of products) {
      // Check if an alert can be sent for the product
      // If not, ignore searching the UI for the product
      const sendAlert = canSendAlert(product.PreviousAlertDate);
      if (!sendAlert) continue;

      const inventoryLocations = await retrieveProductInventory(
        product.ProductType,
        product.ProductUrlName,
        product.ProductSize
      );
      if (!inventoryLocations) continue;

      const foundInventory = {
        name: product.ProductName,
        inventory: inventoryLocations,
      };
      allProductInventories.push(foundInventory);
    }
  } catch (error) {
    console.log(`Error starting puppeteer to parse product inventory`);
    console.log(error);
  } finally {
    await closePuppeteer();
  }

  // No inventory found for the products
  if (allProductInventories.length === 0) {
    console.log(
      `Did not find any inventory for requested products for user: ${username}`
    );
    return "Handler Completed Successfully";
  }

  // Inventory is found for one or more products
  const smsTexts: string[] = [];
  for (const foundProduct of allProductInventories) {
    const product = products.find(
      (product) => product.ProductName === foundProduct.name
    );
    if (!product) {
      console.log(
        `Did not find product title ${foundProduct.name} within the products from Dynamo`
      );
      continue;
    }
    await updateRecordWithTime(product);
    smsTexts.push(
      createSmsTextMessage(
        product.ProductTitle,
        foundProduct.inventory,
        product.ProductSize
      )
    );
  }

  // Send notifications for each SMS message
  for (const text of smsTexts) {
    console.log(`SMS Text Message: `, text);
    await sendNotification(text, phoneNumber);
  }

  return "Handler Completed Successfully";
};
