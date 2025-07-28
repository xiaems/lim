import {
    coupons
} from '../endpoints/couponeEndPoint'
import { GET_API } from '../methods';

export const couponListData = async () => {
    return GET_API(coupons)
        .then((res) => {
            return res;
        })
        .catch((e) => {
            return e?.response;
        });
};


const couponService = {
    couponListData,
};

export default couponService;
