import { retrieveProductInfo, retrieveUserInfo } from "./manager";

export const handler = async () => {
  const userInfo = await retrieveUserInfo();
  const username = userInfo.Username;
  const products = await retrieveProductInfo(username);
  return;
};
