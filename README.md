# abc-scraper
Scraper for information about specific ABC products.

The project is separated into two major folders:
1) frontend
2) backend

## Frontend

Allows the user to login and view the abc products they are interested in.

## Backend

Code for creating the infra and maintaining a status check for each user for the available product.

### Deploying backend

First, install AWS SAM CLI.

Then within the backend folder, run the following:
`sam deploy cloudformation --stack-name ABC-Scraper-Stack -t template.yaml`

### Local Debugging

To test the scraper (scraper.ts) code specifically, copy the following code and add to the bottom of the scraper.ts file.
```
// Local code for testing
// Can use command `npx ts-node scraper.ts` from terminal
const test = async () => {
  console.log("STARTING TEST");
  await loadBaseUrl();
  await setStoreLocation();

  // Rare Item
  const table = await getProductInventory("bourbon", "buffalo-trace-bourbon", "750");

  // Common Item
  // const table = await getProductInventory(
  //   "bourbon",
  //   "buffalo-trace-bourbon-cream-liqueur",
  //   "750"
  // );

  if (!table) {
    await closeBrowser();
    return;
  };
  const response = await parseInventoryTable(table);
  console.log(`RESPONSE: `, response);
  await closeBrowser();
};
test();
```
This will test a rare bourbon called the buffalo trace bourbon with the size 750ml. To test the common item, add `//` directly below the line with `// Rare Item`, and remove the `//` from from the lines below the `// Common Item`.