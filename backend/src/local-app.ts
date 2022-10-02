import { retrieveProductInventory } from "./manager";
import {
  closeBrowser,
  getProductInventory,
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
      productType: "bourbon",
      productName: "buffalo-trace-bourbon",
      productSize: "750",
    },
  ];

  const allProductInventories = [];
  for (const product of products) {
    const productInventory = await retrieveProductInventory(
      product.productName,
      product.productType,
      product.productSize
    );
    if (!productInventory) continue;

    const foundInventory = {
      [`${product.productType}_${product.productName}_${product.productSize}`]: productInventory
    };
    allProductInventories.push(foundInventory);
  }

  if (allProductInventories.length > 0) {
    console.log(`All Product Inventories`, allProductInventories);
  }
  await closeBrowser();
  return "Handler Completed Successfully";
};
