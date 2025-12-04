import { createCrudSlice } from "@/store/helpers/createCrudSlice";

const { reducer, thunks, selectors } = createCrudSlice({
  name: "user",
  endpoint: "user-master/resource",
});

export const { getAll, getById, createItem, updateItem, deleteItem } = thunks;

export const {
  selectList: selectUserList,
  selectSelected: selectUserItem,
  selectLoading: selectUserLoading,
  selectError: selectUserError,
} = selectors;

export default reducer;
