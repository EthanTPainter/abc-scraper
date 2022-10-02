import { retrieveProductInfo, retrieveProductInventory, retrieveUserInfo } from "./manager";
import { closeBrowser, loadBaseUrl, setStoreLocation } from "./scraping/scraper";

export const handler = async () => {
  const userInfo = await retrieveUserInfo("Les");
  const username = userInfo.Username;
  const products = await retrieveProductInfo(username);
  console.log(`Products: `, products);

  await loadBaseUrl();
  await setStoreLocation();
  const allProductInventories = [];
  for (const product of products) {
    const productInventory = await retrieveProductInventory(
      product.ProductName,
      product.ProductType,
      product.ProductSize
    );
    if (!productInventory) continue;

    const foundInventory = {
      [product.ProductTitle]: productInventory
    };
    allProductInventories.push(foundInventory);
  }

  if (allProductInventories.length > 0) {
    console.log(`All Product Inventories`, allProductInventories);
  }
  await closeBrowser();
  return "Handler Completed Successfully";
};
