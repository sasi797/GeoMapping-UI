import useDecrypt from "@/app/components/datasecurity/useDecrypt";
import { deleteApi } from "@/utils/deleteApiMethod";
import { getApi } from "@/utils/getApiMethod";
import { postApi } from "@/utils/postApiMethod";
import { putApi } from "@/utils/putApiMethod";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export function createCrudSlice({ name, endpoint }) {
  const getAll = createAsyncThunk(
    `${name}/getAll`,
    async (_, { rejectWithValue }) => {
      try {
        const { decrypt } = useDecrypt();
        const response = await getApi(endpoint);

        let data;
        if (response?.encryptedData) {
          const decrypted = await decrypt(response.encryptedData);
          // Only parse if it's a string
          data =
            typeof decrypted === "string" ? JSON.parse(decrypted) : decrypted;
        } else {
          data = response;
        }

        console.log("Fetched data:", data);
        return data;
      } catch (err) {
        console.error("Error fetching data:", err);
        return rejectWithValue(err.message);
      }
    }
  );

  const getById = createAsyncThunk(
    `${name}/getById`,
    async (id, { rejectWithValue }) => {
      try {
        const { decrypt } = useDecrypt();
        const response = await getApi(`${endpoint}/${id}`);

        let data;
        if (response?.encryptedData) {
          const decrypted = await decrypt(response.encryptedData);
          // Only parse if it's a string
          data =
            typeof decrypted === "string" ? JSON.parse(decrypted) : decrypted;
        } else {
          data = response;
        }

        console.log("Fetched data:", data);
        return data;
      } catch (err) {
        return rejectWithValue(err.message);
      }
    }
  );

  const createItem = createAsyncThunk(
    `${name}/create`,
    async (data, { rejectWithValue }) => {
      try {
        const { decrypt } = useDecrypt();
        const response = await postApi(endpoint, data);

        return response?.encryptedData
          ? JSON.parse(await decrypt(response.encryptedData))
          : response;
      } catch (err) {
        return rejectWithValue(err.message);
      }
    }
  );

  const updateItem = createAsyncThunk(
    `${name}/update`,
    async ({ id, data }, { rejectWithValue }) => {
      try {
        const { decrypt } = useDecrypt();
        const response = await putApi(`${endpoint}/${id}`, data);

        let result;
        if (response?.encryptedData) {
          const decrypted = await decrypt(response.encryptedData);
          result =
            typeof decrypted === "string" ? JSON.parse(decrypted) : decrypted;
        } else {
          result = response;
        }

        console.log("Updated driver:", result);
        return result;
      } catch (err) {
        return rejectWithValue(err.message);
      }
    }
  );

  const deleteItem = createAsyncThunk(
    `${name}/delete`,
    async (id, { rejectWithValue }) => {
      try {
        const { decrypt } = useDecrypt();
        const response = await deleteApi(`${endpoint}/${id}`);

        return response?.encryptedData
          ? JSON.parse(await decrypt(response.encryptedData))
          : response;
      } catch (err) {
        return rejectWithValue(err.message);
      }
    }
  );

  // 🔹 Initial State
  const initialState = {
    list: [],
    selected: null,
    loading: {
      getAll: false,
      getById: false,
      create: false,
      update: false,
      delete: false,
    },
    error: {
      getAll: null,
      getById: null,
      create: null,
      update: null,
      delete: null,
    },
  };

  const slice = createSlice({
    name,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      const setPending = (state, key) => {
        state.loading[key] = true;
        state.error[key] = null;
      };
      const setRejected = (state, key, action) => {
        state.loading[key] = false;
        state.error[key] = action.payload;
      };

      builder
        .addCase(getAll.pending, (s) => setPending(s, "getAll"))
        .addCase(getAll.fulfilled, (s, a) => {
          s.loading.getAll = false;
          // s.list = a.payload;
          s.list = a.payload.data || [];
        })
        .addCase(getAll.rejected, (s, a) => setRejected(s, "getAll", a))

        .addCase(getById.pending, (s) => setPending(s, "getById"))
        .addCase(getById.fulfilled, (s, a) => {
          s.loading.getById = false;
          s.selected = a.payload;
        })
        .addCase(getById.rejected, (s, a) => setRejected(s, "getById", a))

        .addCase(createItem.pending, (s) => setPending(s, "create"))
        .addCase(createItem.fulfilled, (s, a) => {
          s.loading.create = false;
          s.list.push(a.payload);
        })
        .addCase(createItem.rejected, (s, a) => setRejected(s, "create", a))

        .addCase(updateItem.pending, (s) => setPending(s, "update"))
        .addCase(updateItem.fulfilled, (s, a) => {
          s.loading.update = false;
          const index = s.list.findIndex((i) => i.id === a.payload.id);
          if (index !== -1) s.list[index] = a.payload;
        })
        .addCase(updateItem.rejected, (s, a) => setRejected(s, "update", a))

        .addCase(deleteItem.pending, (s) => setPending(s, "delete"))
        .addCase(deleteItem.fulfilled, (s, a) => {
          s.loading.delete = false;
          // s.list = s.list.filter((i) => i.id !== a.payload);
          s.list = s.list.filter((i) => i.user_id !== a.payload);
        })
        .addCase(deleteItem.rejected, (s, a) => setRejected(s, "delete", a));
    },
  });

  // 🔹 Auto selectors
  const selectors = {
    selectList: (state) => state[name].list,
    selectSelected: (state) => state[name].selected,
    selectLoading: (state) => state[name].loading,
    selectError: (state) => state[name].error,
  };

  return {
    reducer: slice.reducer,
    thunks: { getAll, getById, createItem, updateItem, deleteItem },
    selectors,
  };
}
