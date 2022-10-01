import { retrieveProductInfo, retrieveUserInfo } from "./manager";
import { closeBrowser, getProductInventory, loadBaseUrl, setStoreLocation } from "./scraping/scraper";

export const handler = async () => {
  const userInfo = await retrieveUserInfo();
  const username = userInfo.Username;
  const products = await retrieveProductInfo(username);
  console.log(`Products: `, products);

  await loadBaseUrl();
  await setStoreLocation();
  // const allProductInventories = [];
  // for (const product of products) {
  //   const productInventory = await retrieveProductInventory(
  //     product.productName,
  //     product.productType,
  //     product.productSize
  //   );
  //   if (!productInventory) continue;

  //   const foundInventory = {
  //     [`${product.productType}_${product.productName}_${product.productSize}`]: productInventory
  //   };
  //   allProductInventories.push(foundInventory);
  // }

  // if (allProductInventories.length > 0) {
  //   console.log(`All Product Inventories`, allProductInventories);
  // }
  await closeBrowser();
  return "Handler Completed Successfully";
};
