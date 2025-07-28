import {
  rentalVehicle,
  rental_vehicle,
  rentalRideRequest,
} from "../endpoints/rentalEndPoint";
import { RentalInterface } from "../interface/rentalinterface";
import { POST_API, GET_API } from "../methods";

export const rentalvehicleRequest = async (data: RentalInterface) => {
  return POST_API(data, rentalVehicle)
    .then((res) => {
      return res;
    })
    .catch((e) => {
      return e?.response;
    });
};

export const rentalRideRequests = async (data: RentalInterface) => {
  return POST_API(data, rentalRideRequest)
    .then((res) => {

      return res;
    })
    .catch((e) => {
      return e?.response;
    });
};

export const rentalVehicleList = async ({
  start_time,
  vehicle_type_id,
  lat,
  lng,
}: {
  start_time: number;
  vehicle_type_id: number;
  lat: number;
  lng: number;
}) => {
  return GET_API(
    `${rental_vehicle}?start_time=${start_time}&vehicle_type_id=${vehicle_type_id}&lat=${lat}&lng=${lng}`
  )
    .then((res) => {
      return res;
    })
    .catch((e) => {
      return e?.response;
    });
};

export const rentalVehicleListDetsils = async ({
  vehicle_type_id,
}: {
  vehicle_type_id: number;
}) => {
  return GET_API(`${rental_vehicle}/${vehicle_type_id}`)
    .then((res) => {

      return res;
    })
    .catch((e) => {
      return e?.response;
    });
};

const rentalVehicleServices = {
  rentalvehicleRequest,
  rentalVehicleList,
  rentalRideRequests,
  rentalVehicleListDetsils,
};

export default rentalVehicleServices;
