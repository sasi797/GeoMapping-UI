import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/userSlice";
import vehicleReducer from "./features/vehicleSlice";
import locationReducer from "./features/locationSlice";
import driverReducer from "./features/driverSlice";
import clientReducer from "./features/clientSlice";
import routeReducer from "./features/routeSlice";
import companyProfileReducer from "./features/companyProfileSlice";
import vehiclePostReducer from "./features/vehicleMasterPost";

export const store = configureStore({
  reducer: {
    user: userReducer,
    vehicle: vehicleReducer,
    vehiclemasterpost: vehiclePostReducer,
    location: locationReducer,
    driver: driverReducer,
    client: clientReducer,
    route: routeReducer,
    companyprofile: companyProfileReducer,
  },
});
