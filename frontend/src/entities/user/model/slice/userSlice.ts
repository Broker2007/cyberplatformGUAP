import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUser, UserSchema } from '../types/UserSchema';

const initialState:UserSchema = {
    user: null,
};

const userSlice = createSlice({
    name: 'userSlice',
    initialState,
    reducers: {
        logout: () => initialState,
        setUser: (state, action:PayloadAction<IUser>) => {
            state.user = action.payload;
        },
    },
});

export const { actions: userActions } = userSlice;
export const { reducer: userReducer } = userSlice;
