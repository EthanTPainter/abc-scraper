import { retrieveProductInventory } from "./manager";
import {
  closePuppeteer,
  loadBaseUrl,
  setStoreLocation,
} from "./scraping/scraper";

// Local App Handler for validating the scraping functionality
// Test the retrieval of an item
export const handler = async () => {
  try {
    await loadBaseUrl();
    await setStoreLocation();  
  } catch (error) {
    console.log(`PUPPETEER ERROR: `, error);
    return;
  }

  // Rare product
  // const products = [
  //   {
  //     Username: "Les_Product",
  //     ProductName: "buffalo-trace-bourbon-750",
  //     ProductUrlName: "buffalo-trace-bourbon",
  //     ProductType: "bourbon",
  //     ProductTitle: "Buffalo Trace Bourbon",
  //     ProductSize: "750",
  //   },
  // ];

  // Not Rare Product
  const products = [
    {
      Username: "Les_Product",
      ProductName: "buffalo-trace-bourbon-cream-liqueur-750",
      ProductUrlName: "buffalo-trace-bourbon-cream-liqueur",
      ProductType: "bourbon",
      ProductTitle: "Buffalo Trace Bourbon Cream Liqueur",
      ProductSize: "750",
    },
  ];

  const allProductInventories = [];
  for (const product of products) {
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

  console.log(`All Product Inventories`, allProductInventories);
  await closePuppeteer();
  return "Handler Completed Successfully";
};

// handler();