import User from '../Models/User';
import UserRole from '../Models/UserRole';
import config from '../config.json';
import axios from 'axios';
import { Auth } from 'aws-amplify';

const baseUrl = config.API.BASE_URL;

const getIdToken = async () => {
  const session = await Auth.currentSession();
  return session.getIdToken().getJwtToken();
};

export async function getAllUsers(): Promise<Array<User>> {
  const token = await getIdToken();
  const result = await axios.get(`${baseUrl}/users`, {
    headers: {
      Authorization: token,
    },
  });
  return result.data;
}

interface EditableUserDetails {
  username: string;
  givenName: string;
  familyName: string;
  role: UserRole;
  password: string;
}

export async function createNewUser(
  userToCreate: EditableUserDetails
): Promise<User> {
  const token = await getIdToken();
  const result = await axios.post(
    `${baseUrl}/users`,
    {
      username: userToCreate.username,
      password: userToCreate.password,
      role: userToCreate.role,
      givenName: userToCreate.givenName,
      familyName: userToCreate.familyName,
    },
    {
      headers: {
        Authorization: token,
      },
    }
  );

  return result.data;
}

export async function updateExistingUser(
  userToEdit: EditableUserDetails
): Promise<EditableUserDetails> {
  const token = await getIdToken();

  await axios.put(
    `${baseUrl}/users/${userToEdit.username}`,
    {
      password: userToEdit.password,
      role: userToEdit.role,
      givenName: userToEdit.givenName,
      familyName: userToEdit.familyName,
    },
    {
      headers: {
        Authorization: token,
      },
    }
  );

  return userToEdit;
}

export async function deleteUser(username: string): Promise<string> {
  const token = await getIdToken();
  await axios.delete(`${baseUrl}/users/${username}`, {
    headers: {
      Authorization: token,
    },
  });
  return username;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
