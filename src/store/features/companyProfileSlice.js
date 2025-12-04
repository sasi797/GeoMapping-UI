import { createCrudSlice } from "@/store/helpers/createCrudSlice";

const { reducer, thunks, selectors } = createCrudSlice({
  name: "companyprofile",
  endpoint: "company-profile-master/resource",
});

export const { getAll, getById, createItem, updateItem, deleteItem } = thunks;

export const {
  selectList: selectCompanyProfileList,
  selectSelected: selectCompanyProfileItem,
  selectLoading: selectCompanyProfileLoading,
  selectError: selectCompanyProfileError,
} = selectors;

export default reducer;
