import puppeteer from "puppeteer";

const baseUrl = "https://www.abc.virginia.gov";

let browser: puppeteer.Browser;
let page: puppeteer.Page;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
  await page.type("input[placeholder='Search by City, Zip, or Store #']", zipCode);
  await delay(1000);

  // Click Searh button
  await page.click("a[aria-label='Search']");
  await delay(1000);

  // Select store
  await page.click("#store-search-make-this-my-store-284-modal");
  await delay(500);
};

export const getProductPage = async (productType: string, productName: string, productSize?: string) => {
  const productUrl = `${baseUrl}/products/${productType}/${productName}`;
  console.log("Product URL: ", productUrl);
  await page.goto(productUrl);
  await delay(5000);

  // Select product size
  if (productSize) {
    await page.type("select", productSize);
    await delay(1000);
  }

  // Check inventory amount
  await page.$eval("td[data-title='Inventory']", el => console.log(el));
  await delay(1000);
};

export const closeBrowser = async () => {
  ;await browser.close();
}

// const test = async () => {
//   console.log("HELLO");
//   await loadBaseUrl();
//   await setStoreLocation();
//   await getProductPage("bourbon", "buffalo-trace-bourbon", "750");
//   await closeBrowser();
// };
// test()