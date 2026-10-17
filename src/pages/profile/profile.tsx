import { selectUpdateUserError, selectUser, updateUser } from '@slices/user';
import { ProfileUI } from '@ui-pages';
import { type SyntheticEvent, useEffect, useState } from 'react';

import { useDispatch, useSelector } from '@services/store';

import type { TRegisterData } from '@api';

export const Profile = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const updateUserError = useSelector(selectUpdateUserError);
  // Маршрут защищён, поэтому пользователь здесь всегда есть
  const user = useSelector(selectUser) ?? { name: '', email: '' };

  const [formValue, setFormValue] = useState({
    name: user.name,
    email: user.email,
    password: '',
  });

  useEffect(() => {
    setFormValue((prevState) => ({
      ...prevState,
      name: user.name,
      email: user.email,
    }));
  }, [user.name, user.email]);

  const isFormChanged =
    formValue.name !== user.name ||
    formValue.email !== user.email ||
    !!formValue.password;

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();
    if (!isFormChanged) return;

    const changes: Partial<TRegisterData> = {};
    if (formValue.name !== user.name) changes.name = formValue.name;
    if (formValue.email !== user.email) changes.email = formValue.email;
    if (formValue.password) changes.password = formValue.password;

    void dispatch(updateUser(changes))
      .unwrap()
      .then(() => setFormValue((prevState) => ({ ...prevState, password: '' })))
      .catch(() => {
        // Ошибка сохраняется в сторе и выводится под формой
      });
  };

  const handleCancel = (e: SyntheticEvent): void => {
    e.preventDefault();
    setFormValue({
      name: user.name,
      email: user.email,
      password: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormValue((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <ProfileUI
      formValue={formValue}
      isFormChanged={isFormChanged}
      updateUserError={updateUserError?.message}
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
    />
  );
};
