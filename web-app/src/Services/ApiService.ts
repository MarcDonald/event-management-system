import { Auth } from 'aws-amplify';
import axios from 'axios';
import { AxiosRequestConfig } from 'axios';

const getIdToken = async () => {
  const session = await Auth.currentSession();
  return session.getIdToken().getJwtToken();
};

export async function get(url: string): Promise<any> {
  const token = await getIdToken();
  return axios.get(url, {
    headers: {
      Authorization: token,
    },
  });
}

export async function post(url: string, data: object): Promise<any> {
  const token = await getIdToken();
  return axios.post(url, data, {
    headers: {
      Authorization: token,
    },
  });
}

export async function put(url: string, data: object): Promise<any> {
  const token = await getIdToken();
  return axios.put(url, data, {
    headers: {
      Authorization: token,
    },
  });
}

// Can't name a function 'delete' in JS
export async function delet(url: string, data?: object): Promise<any> {
  const token = await getIdToken();
  const config: AxiosRequestConfig = {
    headers: {
      Authorization: token,
    },
  };
  if (data) config.data = data;

  return axios.delete(url, config);
}
