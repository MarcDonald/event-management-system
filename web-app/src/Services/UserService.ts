import User from '../Models/User';
import UserRole from '../Models/UserRole';
import config from '../config.json';
import { delet, get, post, put } from './ApiService';

const baseUrl = `${config.API.BASE_URL}/users`;

export async function getAllUsers(): Promise<Array<User>> {
  const result = await get(baseUrl);
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
  const result = await post(baseUrl, {
    username: userToCreate.username,
    password: userToCreate.password,
    role: userToCreate.role,
    givenName: userToCreate.givenName,
    familyName: userToCreate.familyName,
  });
  return result.data;
}

export async function updateExistingUser(
  userToEdit: EditableUserDetails
): Promise<EditableUserDetails> {
  await put(`${baseUrl}/${userToEdit.username}`, {
    password: userToEdit.password,
    role: userToEdit.role,
    givenName: userToEdit.givenName,
    familyName: userToEdit.familyName,
  });

  return userToEdit;
}

export async function deleteUser(username: string): Promise<string> {
  await delet(`${baseUrl}/${username}`);
  return username;
}
