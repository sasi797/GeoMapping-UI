import { createCrudSlice } from "@/store/helpers/createCrudSlice";

const { reducer, thunks, selectors } = createCrudSlice({
  name: "client",
  endpoint: "client-master/resource",
});

export const { getAll, getById, createItem, updateItem, deleteItem } = thunks;

export const {
  selectList: selectClientList,
  selectSelected: selectClientItem,
  selectLoading: selectClientLoading,
  selectError: selectClientError,
} = selectors;

export default reducer;
