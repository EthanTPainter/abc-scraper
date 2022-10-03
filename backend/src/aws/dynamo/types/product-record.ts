export type ProductRecord = {
  Username: string; // {User}_Product
  ProductName: string; // ${ProductUrlName}-${ProductSize}
  ProductUrlName: string;
  ProductType: string;
  ProductTitle: string;
  ProductSize?: string;
  PreviousAlertDate?: string; // Format is YYYY-MM-DD
};
