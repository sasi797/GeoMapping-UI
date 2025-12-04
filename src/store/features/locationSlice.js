import { createCrudSlice } from "@/store/helpers/createCrudSlice";

const { reducer, thunks, selectors } = createCrudSlice({
  name: "location",
  endpoint: "location-master/resource",
});

export const { getAll, getById, createItem, updateItem, deleteItem } = thunks;

export const {
  selectList: selectLocationList,
  selectSelected: selectLocationItem,
  selectLoading: selectLocationLoading,
  selectError: selectLocationError,
} = selectors;

export default reducer;
