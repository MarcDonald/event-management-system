import { Auth } from 'aws-amplify';
import axios, {
  AxiosRequestConfig,
  CancelToken,
  CancelTokenSource,
} from 'axios';
import Sockette from 'sockette';
import Api from './Api';

interface UseApi extends Api {
  get: (url: string, cancelToken: CancelToken) => Promise<any>;
  post: (url: string, data: object) => Promise<any>;
  put: (url: string, data: object) => Promise<any>;
  del: (url: string, data?: object) => Promise<any>;
  connectToWebsocket: (
    url: string,
    eventId: string,
    name: string,
    onMessage: (e: MessageEvent) => void
  ) => Promise<Sockette>;
}

/**
 * Hook that provides easy access to the API
 */
export default function useApi(): UseApi {
  const getIdToken = async () => {
    const session = await Auth.currentSession();
    return session.getIdToken().getJwtToken();
  };

  const getCancelTokenSource = (): CancelTokenSource =>
    axios.CancelToken.source();

  const get = async (url: string, cancelToken: CancelToken): Promise<any> => {
    const token = await getIdToken();
    return axios.get(url, {
      cancelToken: cancelToken,
      headers: {
        Authorization: token,
      },
    });
  };

  const post = async (url: string, data: object): Promise<any> => {
    const token = await getIdToken();
    return axios.post(url, data, {
      headers: {
        Authorization: token,
      },
    });
  };

  const put = async (url: string, data: object): Promise<any> => {
    const token = await getIdToken();
    return axios.put(url, data, {
      headers: {
        Authorization: token,
      },
    });
  };

  // Can't name a function 'delete' in JS
  const del = async (url: string, data?: object): Promise<any> => {
    const token = await getIdToken();
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: token,
      },
    };
    if (data) config.data = data;

    return axios.delete(url, config);
  };

  const connectToWebsocket = async (
    url: string,
    eventId: string,
    name: string,
    onMessage: (e: MessageEvent) => void
  ): Promise<Sockette> => {
    const token = await getIdToken();
    return new Sockette(`${url}?eventId=${eventId}&Authorization=${token}`, {
      timeout: 5e3,
      maxAttempts: 1,
      onmessage: (e) => onMessage(e),
      onclose: (e) => {
        console.log(`Closed ${name} : ${JSON.stringify(e)}`);
      },
      onerror: (e) => {
        console.error(`Error to ${name}: ${JSON.stringify(e)}`);
      },
      onopen: (e) => {
        console.log(`Connected to ${name}: ${JSON.stringify(e)}`);
      },
    });
  };

  return {
    get,
    post,
    put,
    del,
    connectToWebsocket,
    getCancelTokenSource,
  };
}
