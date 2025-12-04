import { createCrudSlice } from "@/store/helpers/createCrudSlice";

const { reducer, thunks, selectors } = createCrudSlice({
  name: "vehicle",
  endpoint: "vehicle-master/resource",
});

export const { getAll, getById, createItem, updateItem, deleteItem } = thunks;

export const {
  selectList: selectVehicleList,
  selectSelected: selectVehicleItem,
  selectLoading: selectVehicleLoading,
  selectError: selectVehicleError,
} = selectors;

export default reducer;
