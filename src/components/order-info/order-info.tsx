import { selectFeedOrders } from '@slices/feed';
import { selectIngredients } from '@slices/ingredients';
import { fetchOrderByNumber, selectOrderByNumber } from '@slices/order';
import { selectProfileOrders } from '@slices/profile-orders';
import { Preloader, OrderInfoUI } from '@ui';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

import type { TIngredient } from '@utils-types';

export const OrderInfo = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const number = Number(useParams().number);
  const ingredients = useSelector(selectIngredients);
  const feedOrders = useSelector(selectFeedOrders);
  const profileOrders = useSelector(selectProfileOrders);
  const orderByNumber = useSelector(selectOrderByNumber);

  // Заказ ищется в уже загруженных списках, а при прямом переходе запрашивается с сервера
  const orderData =
    feedOrders.find((order) => order.number === number) ??
    profileOrders.find((order) => order.number === number) ??
    (orderByNumber?.number === number ? orderByNumber : null);

  useEffect(() => {
    if (!orderData && number) void dispatch(fetchOrderByNumber(number));
  }, [dispatch, number, orderData]);

  /**
   * использование useMemo не обязательно
   */
  /* Готовим данные для отображения */
  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = Record<string, TIngredient & { count: number }>;

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1,
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total,
    };
  }, [orderData, ingredients]);

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
