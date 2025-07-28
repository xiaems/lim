import { PACKAGE } from "../types/index";
import { packageServices } from "../../services/index";
import { createAsyncThunk } from '@reduxjs/toolkit';


export const packageDataGet = createAsyncThunk(PACKAGE, async () => {
  const response = await packageServices.packageDataGet();
  return response?.data;
},
);
