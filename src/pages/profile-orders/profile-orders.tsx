import { fetchProfileOrders, selectProfileOrders } from '@slices/profile-orders';
import { ProfileOrdersUI } from '@ui-pages';
import { useEffect } from 'react';

import { useDispatch, useSelector } from '@services/store';
import { ORDERS_POLLING_INTERVAL } from '@utils/constants';

export const ProfileOrders = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const orders = useSelector(selectProfileOrders);

  // История периодически обновляется, чтобы статусы заказов менялись без перезагрузки
  useEffect(() => {
    void dispatch(fetchProfileOrders());
    const timer = setInterval(
      () => void dispatch(fetchProfileOrders()),
      ORDERS_POLLING_INTERVAL
    );
    return (): void => clearInterval(timer);
  }, [dispatch]);

  return <ProfileOrdersUI orders={orders} />;
};
