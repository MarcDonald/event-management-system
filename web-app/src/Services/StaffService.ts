import StaffMember from '../Models/StaffMember';
import StaffRole from '../Models/StaffRole';
import config from '../config.json';
import { delet, get, post, put } from './ApiService';

const baseUrl = `${config.API.BASE_URL}/staff`;

export async function getAllStaffMembers(): Promise<Array<StaffMember>> {
  const result = await get(baseUrl);
  return result.data;
}

interface EditableStaffDetails {
  username: string;
  givenName: string;
  familyName: string;
  role: StaffRole;
  password: string;
}

export async function createNewStaffMember(
  staffMemberToCreate: EditableStaffDetails
): Promise<StaffMember> {
  const result = await post(baseUrl, {
    username: staffMemberToCreate.username,
    password: staffMemberToCreate.password,
    role: staffMemberToCreate.role,
    givenName: staffMemberToCreate.givenName,
    familyName: staffMemberToCreate.familyName,
  });
  return result.data;
}

export async function updateExistingStaffMember(
  staffMemberToEdit: EditableStaffDetails
): Promise<EditableStaffDetails> {
  await put(`${baseUrl}/${staffMemberToEdit.username}`, {
    password: staffMemberToEdit.password,
    role: staffMemberToEdit.role,
    givenName: staffMemberToEdit.givenName,
    familyName: staffMemberToEdit.familyName,
  });

  return staffMemberToEdit;
}

export async function deleteStaffMember(username: string): Promise<string> {
  await delet(`${baseUrl}/${username}`);
  return username;
}
