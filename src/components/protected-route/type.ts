import type { ReactNode } from 'react';

export type TProtectedRouteProps = {
  onlyUnAuth?: boolean;
  children: ReactNode;
};
