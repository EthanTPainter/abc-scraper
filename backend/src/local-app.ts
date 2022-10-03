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

// Local App Handler for validating the scraping functionality
// Test the retrieval of an item
export const handler = async () => {
  await loadBaseUrl();
  await setStoreLocation();
  // Local product list
  const products = [
    {
      Username: "Les_Product",
      ProductName: "buffalo-trace-bourbon-750",
      ProductUrlName: "buffalo-trace-bourbon",
      ProductType: "bourbon",
      ProductTitle: "Buffalo Trace Bourbon",
      ProductSize: "750",
    },
  ];

  const allProductInventories = [];
  for (const product of products) {
    const productInventory = await retrieveProductInventory(
      product.ProductType,
      product.ProductUrlName,
      product.ProductSize
    );
    if (!productInventory) continue;

    const foundInventory = {
      [product.ProductTitle]: productInventory,
    };
    allProductInventories.push(foundInventory);
  }

  console.log(`All Product Inventories`, allProductInventories);
  await closePuppeteer();
  return "Handler Completed Successfully";
};