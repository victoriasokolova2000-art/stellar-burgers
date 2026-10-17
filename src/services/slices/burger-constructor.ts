import { createSlice, nanoid } from '@reduxjs/toolkit';

import { createOrder } from './order';

import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  TConstructorIngredient,
  TConstructorState,
  TIngredient,
} from '@utils-types';

const initialState: TConstructorState = {
  bun: null,
  ingredients: [],
};

export const burgerConstructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState,
  reducers: {
    addIngredient: {
      reducer: (state, action: PayloadAction<TConstructorIngredient>) => {
        if (action.payload.type === 'bun') {
          state.bun = action.payload;
        } else {
          state.ingredients.push(action.payload);
        }
      },
      prepare: (ingredient: TIngredient) => ({
        payload: { ...ingredient, id: nanoid() },
      }),
    },
    removeIngredient: (state, action: PayloadAction<string>) => {
      state.ingredients = state.ingredients.filter((item) => item.id !== action.payload);
    },
    moveIngredient: (state, action: PayloadAction<{ from: number; to: number }>) => {
      const { from, to } = action.payload;
      if (to < 0 || to >= state.ingredients.length) return;
      const [item] = state.ingredients.splice(from, 1);
      state.ingredients.splice(to, 0, item);
    },
    resetConstructor: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(createOrder.fulfilled, () => initialState);
  },
  selectors: {
    selectConstructorItems: (state) => state,
  },
});

export const { addIngredient, removeIngredient, moveIngredient, resetConstructor } =
  burgerConstructorSlice.actions;

export const { selectConstructorItems } = burgerConstructorSlice.selectors;
