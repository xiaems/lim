import { RENTAL_VEHICLE, RENTAL_VEHICLE_LIST, RENTAL_RIDE_REQUEST, RENTAL_VEHICLE_LIST_DETAILS } from "../types/index";
import { rentalVehicleServices } from "../../services/index";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { RideRequestInterface } from "../../interface/rideRequestInterface";

export const rentalvehicleRequest = createAsyncThunk(
  RENTAL_VEHICLE,
  async (data: RideRequestInterface) => {
    const response = await rentalVehicleServices.rentalvehicleRequest(data);
    return response?.data;
  }
);

export const rentalRideRequests = createAsyncThunk(
  RENTAL_RIDE_REQUEST,
  async (data: RideRequestInterface) => {
    const response = await rentalVehicleServices.rentalRideRequests(data);
    return response?.data;
  }
);

export const rentalVehicleList = createAsyncThunk(
  RENTAL_VEHICLE_LIST,
  async ({ start_time, vehicle_type_id, lat, lng }: { start_time: number, vehicle_type_id: number, lat: number, lng: number }) => {
    const response = await rentalVehicleServices.rentalVehicleList({ start_time, vehicle_type_id, lat, lng });
    return response?.data;
  },
);

export const rentalVehicleListDetsils = createAsyncThunk(
  RENTAL_VEHICLE_LIST_DETAILS,
  async ({ vehicle_type_id }: { vehicle_type_id: number }) => {
    const response = await rentalVehicleServices.rentalVehicleListDetsils({ vehicle_type_id });
    return response?.data;

  },
);
