import { Auth } from 'aws-amplify';
import axios from 'axios';

const getIdToken = async () => {
  const session = await Auth.currentSession();
  return session.getIdToken().getJwtToken();
};

export const get = async (url: string): Promise<any> => {
  const token = await getIdToken();
  return axios.get(url, {
    headers: {
      Authorization: token,
    },
  });
};

export const post = async (url: string, data: object): Promise<any> => {
  const token = await getIdToken();
  return axios.post(url, data, {
    headers: {
      Authorization: token,
    },
  });
};

export const put = async (url: string, data: object): Promise<any> => {
  const token = await getIdToken();
  return axios.put(url, data, {
    headers: {
      Authorization: token,
    },
  });
};

export const delet = async (url: string): Promise<any> => {
  const token = await getIdToken();
  return axios.delete(url, {
    headers: {
      Authorization: token,
    },
  });
};

// TODO remove - only for debugging
export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
