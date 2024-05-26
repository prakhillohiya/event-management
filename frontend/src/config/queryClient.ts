import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import toast from "react-hot-toast";

interface IResponse<T = any> {
  data: T;
  message: string;
}

export interface ICustomQuery {
  queryKey: string
  url: string;
  method: string;
  enabled: boolean
  headers?: { [key: string]: string }
  retry?: boolean
  retryDelay?: number
  withCredentials?: boolean
}

export interface IMutationQuery {
  mutationKey: string
  url: string;
  method: string;
  successCallback: () => void
  headers?: { [key: string]: string }
  retry?: boolean
  retryDelay?: number
  withCredentials?: boolean
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      refetchOnWindowFocus: false,

    },
    mutations: {},
  },
});

// useEffect(() => {
//   return () => {
//     queryClient.clear();
//     queryClient.unmount()
//   };
// }, [queryClient]);


// export const QueryClientProviderWrapper = ({ children }) => {
//   const queryClient = useQueryClient();
//   return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
// };

// export const QueryDevtools = () => <ReactQueryDevtools />;

export const useCustomQueryClient = <T>({ queryKey, method, url, enabled, headers, retry, retryDelay, withCredentials }: ICustomQuery) => {
  const query = useQuery<AxiosResponse<IResponse<T>>, Error>({
    queryKey: [queryKey],
    queryFn: () => {
      return toast.promise(
        axios<IResponse>({
          method: `${method}`,
          url: `${url}`,
          withCredentials: withCredentials ?? true,
          headers: headers
        }),
        {
          error: (err) => err.message,
          success: (data) => data.data.message,
          loading: "Loading",
        }
      )
    },
    enabled: enabled,
    refetchOnWindowFocus: false,
    retry: retry ?? 2,
    retryDelay: retryDelay ?? 3000,

  });

  return query;
};

export const useCustomMutationClient = <T>({ mutationKey, method, url, successCallback, headers, retry, retryDelay, withCredentials }: IMutationQuery) => {
  const mutation = useMutation({
    mutationKey: [mutationKey],
    mutationFn: (body: T) => {
      return toast.promise(
        axios<IResponse>({
          method: `${method}`,
          url: `${url}`,
          data: body,
          withCredentials: withCredentials ?? true,
          headers: headers
        }),
        {
          error: (err) => err.response.data.message,
          success: (data) => data.data.message,
          loading: "Loading",
        }
      );
    },
    retry: retry ?? 2,
    retryDelay: retryDelay ?? 3000,
    onSuccess: successCallback,

  });

  return mutation;
};
