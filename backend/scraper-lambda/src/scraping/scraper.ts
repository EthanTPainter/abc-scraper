const chromium = require('chrome-aws-lambda');
const { addExtra } = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const adBlockerPlugin = require("puppeteer-extra-plugin-adblocker");

// Add plugins here for stealth and ad block
const puppeteerExtra = addExtra(chromium.puppeteer);
puppeteerExtra.use(stealthPlugin());
puppeteerExtra.use(adBlockerPlugin());

const baseUrl = "https://www.abc.virginia.gov";

let browser: any = null; // type ofPpuppeteer.Browser
let page: any = null; // puppeteer.Page;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const DEFAULT_MY_STORE =
  "148 Charter Colony Parkway Midlothian, VA 23114 (#248)";
const NO_INVENTORY_TEXT = "In-store purchase only";
const INVENTORY_TABLE_ID = "no-more-tables";

export const loadBaseUrl = async () => {
  console.log(`Launching Headless Browser...`);
  browser = await puppeteerExtra.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: false,
    ignoreHTTPSErrors: true
  });
  console.log(`Creating new browser page...`);
  page = await browser.newPage();
  await page.goto(baseUrl, {
    waitUntil: ["domcontentloaded"],
  });
};

export const setStoreLocation = async () => {
  // Hardcoded Location for now
  const zipCode = "23114";

  // Select button to look for nearby store
  await page.click("#my-store");
  await delay(1000);

  // Type zip code into store search bar
  await page.type(
    "input[placeholder='Search by City, Zip, or Store #']",
    zipCode
  );
  await delay(1000);

  // Click Searh button
  await page.click("a[aria-label='Search']");
  await delay(1000);

  // Select store
  await page.click("#store-search-make-this-my-store-284-modal");
  await delay(500);
};

export const getProductInventory = async (
  productType: string,
  productName: string,
  productSize?: string
) => {
  const productUrl = `${baseUrl}/products/${productType}/${productName}`;
  console.log("Product URL: ", productUrl);
  await page.goto(productUrl, {
    waitUntil: ["domcontentloaded"],
  });

  // Select product size
  if (productSize) {
    await page.type("select", productSize);
    await delay(1000);
  }

  // Check inventory amount for home store
  const inventory = await page.$("product-inventory");
  if (!inventory) {
    console.log(`Inventory not found. HUH?`);
    return;
  }

  // Get first div text to check for no inventory text
  const firstDivText = await inventory.$eval(
    "div",
    (el: HTMLDivElement) => el.innerHTML
  );
  if (firstDivText.includes(NO_INVENTORY_TEXT)) {
    console.log(
      `No Inventory found for ${productType} with name ${productName} (with size ${productSize})`
    );
    return;
  }

  return inventory;
};

export const parseInventoryTable = async (
  inventory: any // type of puppeteer.ElementHandle<Element>
) => {
  // Get first div id to validate inventory table is present
  // If it is, Check inventory of the home store
  const firstDivId = await inventory.$eval(
    "div",
    (el: HTMLDivElement) => el.id
  );
  if (firstDivId !== INVENTORY_TABLE_ID) return [];

  const table = await inventory.$("table");
  if (!table) {
    console.log(`Could not find a table element within the inventory`);
    return [];
  }
  const tableHeaders = await table.$$eval(
    "thead > tr > th",
    (nodes: Element[]) => nodes.map((node: Element) => node.innerHTML)
  );
  const headerIndex = tableHeaders.indexOf("Inventory");
  if (!headerIndex) {
    console.log(
      `Did not find Inventory column in the table headers: ${tableHeaders}`
    );
    return [];
  }

  const testInventory = await table.$eval(
    `tbody`,
    (el: Element) => el.innerHTML
  );
  console.log(`TEST INVENTORY: `, testInventory);
  const myStoreInventory = await table.$eval(
    `tbody > tr > td:nth-child(${headerIndex + 1})`,
    (el: Element) => el.innerHTML
  );
  if (myStoreInventory !== "0") {
    return [
      {
        inventory: parseInt(myStoreInventory),
        miles: 0,
        address: DEFAULT_MY_STORE,
      },
    ];
  }

  // If not found, look for other stores button (if available)
  const findAtOtherStoresButton = await inventory.$(
    `a[class='more-stores'] > div`
  );
  if (!findAtOtherStoresButton) {
    console.log(`Did not find the find other stores button`);
    return [];
  }
  await findAtOtherStoresButton.click();
  await delay(200);

  // Get new list of stores
  const nearbyStores = await table.$$("tbody > tr");
  // If only myStore is still shown (no other stores shown), return
  if (nearbyStores.length === 1) {
    return [];
  }
  const otherStores = nearbyStores.slice(1);
  const storesWithInventory = [];
  for (const store of otherStores) {
    const storeSections = await store.$$("td");
    // FIRST = LOCATION
    const address = await storeSections[0].$eval(
      "div > a",
      (el: Element) => el.innerHTML
    );
    // SECOND = MILES
    const miles = await storeSections[1].evaluate(
      (el: HTMLTableCellElement) => el.innerHTML
    );
    // THIRD = INVENTORY
    const inventory = await storeSections[2].evaluate(
      (el: HTMLTableCellElement) => el.innerHTML
    );

    if (parseInt(inventory) > 0) {
      storesWithInventory.push({
        address,
        miles: parseFloat(miles),
        inventory: parseInt(inventory),
      });
    }
  }

  return storesWithInventory;
};

export const closePuppeteer = async () => {
  console.log(`Closing Page and Browser`);
  await page.close();
  await browser.close();
};
