import { createCrudSlice } from "@/store/helpers/createCrudSlice";

const { reducer, thunks, selectors } = createCrudSlice({
  name: "route",
  endpoint: "route-master/resource",
});

export const { getAll, getById, createItem, updateItem, deleteItem } = thunks;

export const {
  selectList: selectRouteList,
  selectSelected: selectRouteItem,
  selectLoading: selectRouteLoading,
  selectError: selectRouteError,
} = selectors;

export default reducer;
