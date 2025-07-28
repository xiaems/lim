import { hourlyPackage } from "../endpoints/packageEndPoint";
import { GET_API } from "../methods";

export const packageDataGet = async () => {
  return GET_API(hourlyPackage)
    .then((res) => {
      return res;
    })
    .catch((e) => {
      return e?.response;
    });
};

const packageServices = {
    packageDataGet,
};

export default packageServices;
