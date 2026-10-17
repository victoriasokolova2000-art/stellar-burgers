import { fetchFeeds, selectFeedOrders } from '@slices/feed';
import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { useEffect } from 'react';

import { useDispatch, useSelector } from '@services/store';
import { ORDERS_POLLING_INTERVAL } from '@utils/constants';

export const Feed = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const orders = useSelector(selectFeedOrders);

  const handleGetFeeds = (): void => {
    void dispatch(fetchFeeds());
  };

  // Лента периодически обновляется, чтобы новые заказы появлялись без перезагрузки
  useEffect(() => {
    void dispatch(fetchFeeds());
    const timer = setInterval(
      () => void dispatch(fetchFeeds()),
      ORDERS_POLLING_INTERVAL
    );
    return (): void => clearInterval(timer);
  }, [dispatch]);

  if (!orders.length) {
    return <Preloader />;
  }

  return <FeedUI orders={orders} handleGetFeeds={handleGetFeeds} />;
};
