import { retrieveProductInventory } from "./manager";
import {
  closeBrowser,
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
      ProductName: "buffalo-trace-bourbon",
      ProductType: "bourbon",
      ProductTitle: "Buffalo Trace Bourbon",
      ProductSize: "750",
    },
  ];

  const allProductInventories = [];
  for (const product of products) {
    const productInventory = await retrieveProductInventory(
      product.ProductName,
      product.ProductType,
      product.ProductSize
    );
    if (!productInventory) continue;

    const foundInventory = {
      [product.ProductTitle]: productInventory,
    };
    allProductInventories.push(foundInventory);
  }

  if (allProductInventories.length > 0) {
    console.log(`All Product Inventories`, allProductInventories);
  }
  await closeBrowser();
  return "Handler Completed Successfully";
};
