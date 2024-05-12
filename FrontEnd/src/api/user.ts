// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/utils/axios';

// utils

// ----------------------------------------------------------------------
export function useGetUser() {
  const URL = `${endpoints.auth.me}`;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, {
    revalidateOnFocus: false,
  });

  const memoizedValue = useMemo(
    () => ({
      user: data as  any,
      userLoading: isLoading,
      userError: error,
      userValidating: isValidating,
    }),
    [data, isLoading, error, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------
// export async function changePassword(data: any) {
//   const URL = endpoints.auth.changePassword;
//   await axios.patch(`${URL}`, data);
// }
// export async function updateAuthUser(data: any) {
//   const URL = endpoints.auth.updateAdmins;
//   await axios.patch(`${URL}`, data);
// }
