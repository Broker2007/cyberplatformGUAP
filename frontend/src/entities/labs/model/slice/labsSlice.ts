// import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { fetchLabById, fetchLabsData } from '../services/fetchLabsData';
// import { LabsResponse, LabsSchema } from '../types/labs';

// const initialState:LabsSchema = {
//     isLoading: false,
//     error: undefined,
//     items: [],
//     meta: null,
//     currentLab: null,
//     isLoadingCurrent: false,
// };

// const labsSlice = createSlice({
//     name: 'labs',
//     initialState,
//     reducers: {
//         clearLabs: (state) => {
//             state.items = [];
//             state.meta = null;
//             state.error = undefined;
//         },
//         clearCurrentLab: (state) => {
//             state.currentLab = null;
//             state.isLoadingCurrent = false;
//         },
//         clearError: (state) => {
//             state.error = undefined;
//         },

//     },
//     extraReducers: (builder) => {
//         builder
//             // Получение всех лаб
//             .addCase(fetchLabsData.pending, (state) => {
//                 state.error = undefined;
//                 state.isLoading = true;
//             })
//             .addCase(fetchLabsData.fulfilled, (state, action:PayloadAction<LabsResponse>) => {
//                 state.isLoading = false;
//                 state.items = action.payload.items;
//                 state.meta = action.payload.meta;
//             })
//             .addCase(fetchLabsData.rejected, (state, action) => {
//                 state.isLoading = false;
//                 state.error = action.payload as string;
//                 state.items = [];
//                 state.meta = null;
//             })
//             // Получение лабы по ID
//             .addCase(fetchLabById.pending, (state) => {
//                 state.isLoadingCurrent = true;
//                 state.error = undefined;
//             })
//             .addCase(fetchLabById.fulfilled, (state, action) => {
//                 state.isLoadingCurrent = false;
//                 state.currentLab = action.payload;
//             })
//             .addCase(fetchLabById.rejected, (state, action) => {
//                 state.isLoadingCurrent = false;
//                 state.error = action.payload as string;
//                 state.currentLab = null;
//             });
//     },
// });

// export const { actions: labsActions } = labsSlice;
// export const { reducer: labsReducer } = labsSlice;
