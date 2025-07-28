import { COUPON } from '../types'
import { couponService } from '../../services/index'
import { createAsyncThunk } from '@reduxjs/toolkit';


export const couponListData = createAsyncThunk(
    COUPON,
    async () => {
        const response = await couponService.couponListData();
        return response?.data;
    },
);
