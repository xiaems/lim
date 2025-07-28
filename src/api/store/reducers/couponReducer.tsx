import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {couponListData} from '../actions/couponAction';
import { CouponsInterface } from '../../interface/couponInterface';

const initialState: CouponsInterface = {
    couponsList: [],
    success: false,
    loading: false,
    statusCode: null,
};

const couponSlice = createSlice({
    name: 'coupon',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder.addCase(couponListData.pending, (state, action) => {
            state.loading = true;
        });
        builder.addCase(couponListData.fulfilled, (state, action: PayloadAction<any[]>) => {
            state.couponsList = action.payload;
            state.statusCode = action.payload.status; 
            state.loading = false;
        });
        builder.addCase(couponListData.rejected, (state) => {
            state.loading = false;
            state.success = false;            
            state.statusCode = action.payload?.status || 500; 
          });
    },

});

export default couponSlice.reducer;
