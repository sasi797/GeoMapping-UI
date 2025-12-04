import { createCrudSlice } from "@/store/helpers/createCrudSlice";

const { reducer, thunks, selectors } = createCrudSlice({
  name: "vehiclemasterpost",
  endpoint: "vehicle",
});

export const { createItem } = thunks;

export const {
  selectList: selectVehicleList,
  selectSelected: selectVehicleItem,
  selectLoading: selectVehicleLoading,
  selectError: selectVehicleError,
} = selectors;

export default reducer;
