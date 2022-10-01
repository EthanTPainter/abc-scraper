import puppeteer from "puppeteer";

const baseUrl = "https://www.abc.virginia.gov";

let browser: puppeteer.Browser;
let page: puppeteer.Page;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const DEFAULT_MY_STORE =
  "148 Charter Colony Parkway Midlothian, VA 23114 (#248)";
const NO_INVENTORY_TEXT = "In-store purchase only";
const INVENTORY_TABLE_ID = "no-more-tables";
const FIND_AT_OTHER_STORES_BUTTON_TEXT = "Find at Other stores";

export const loadBaseUrl = async () => {
  browser = await puppeteer.launch({ headless: false });
  page = await browser.newPage();
  await page.goto(baseUrl);
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
  await page.goto(productUrl);
  await delay(5000);

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
  const firstDivText = await inventory.$eval("div", (el) => el.innerHTML);
  if (firstDivText.includes(NO_INVENTORY_TEXT)) {
    console.log(
      `No Inventory found for ${productType} with name ${productName} (with size ${productSize})`
    );
    return;
  }

  return inventory;
};

export const parseInventoryTable = async (
  inventory: puppeteer.ElementHandle<Element>
) => {
  // Get first div id to validate inventory table is present
  // If it is, Check inventory of the home store
  const firstDivId = await inventory.$eval("div", (el) => el.id);
  if (firstDivId !== INVENTORY_TABLE_ID) return;

  const table = await inventory.$("table");
  if (!table) return;

  const tableHeaders = await table.$$eval("thead > tr > th", (nodes) =>
    nodes.map((node) => node.innerHTML)
  );
  const headerIndex = tableHeaders.indexOf("Inventory");
  if (!headerIndex) {
    console.log(
      `Did not find Inventory column in the table headers: ${tableHeaders}`
    );
    return;
  }
  const myStoreInventory = await table.$eval(
    `tbody > tr > td:nth-child(${headerIndex + 1})`,
    (el) => el.innerHTML
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
  if (!findAtOtherStoresButton) return;
  await findAtOtherStoresButton.click();
  await delay(200);

  // Get new list of stores
  const nearbyStores = await table.$$("tbody > tr");
  // If only myStore is still shown (no other stores shown), return
  if (nearbyStores.length === 1) {
    return;
  }
  const otherStores = nearbyStores.slice(1);
  const storesWithInventory = [];
  for (const store of otherStores) {
    const storeSections = await store.$$("td");
    // FIRST = LOCATION
    const address = await storeSections[0].$eval(
      "div > a",
      (el) => el.innerHTML
    );
    console.log(`FIRST SECTION DETAILS: `, address);
    // SECOND = MILES
    const miles = await storeSections[1].evaluate((el) => el.innerHTML);
    console.log("SECOND SECTION: ", parseFloat(miles));
    // THIRD = INVENTORY
    const inventory = await storeSections[2].evaluate((el) => el.innerHTML);
    console.log("THIRD SECTION: ", parseInt(inventory));
    storesWithInventory.push({
      address,
      miles: parseFloat(miles),
      inventory: parseInt(inventory),
    });
  }

  return storesWithInventory;
};

export const closeBrowser = async () => {
  await browser.close();
};

const test = async () => {
  console.log("STARTING TEST");
  await loadBaseUrl();
  await setStoreLocation();
  //await getProductInventory("bourbon", "buffalo-trace-bourbon", "750");
  const table = await getProductInventory(
    "bourbon",
    "buffalo-trace-bourbon-cream-liqueur",
    "750"
  );
  if (!table) return;

  const response = await parseInventoryTable(table);
  await closeBrowser();
};
test();
