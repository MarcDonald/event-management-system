import config from '../../../config.json';
import StaffRole from '../../models/StaffRole';
import StaffMember from '../../models/StaffMember';
import useApi from './useApi';
import Api from './Api';
import { CancelToken } from 'axios';

interface EditableStaffDetails {
  username: string;
  givenName: string;
  familyName: string;
  role: StaffRole;
  password: string;
}

interface UseStaffApi extends Api {
  getAllStaffMembers: (cancelToken: CancelToken) => Promise<Array<StaffMember>>;
  createNewStaffMember: (
    staffMemberToCreate: EditableStaffDetails
  ) => Promise<StaffMember>;
  updateExistingStaffMember: (
    staffMemberToEdit: EditableStaffDetails
  ) => Promise<EditableStaffDetails>;
  deleteStaffMember: (username: string) => Promise<string>;
}

const baseUrl = `${config.API.BASE_URL}/staff`;

/**
 * Hook that provides easy access to the staff API
 */
export default function useStaffApi(): UseStaffApi {
  const api = useApi();
  const { get, put, post, del } = api;

  const getAllStaffMembers = async (
    cancelToken: CancelToken
  ): Promise<Array<StaffMember>> => {
    try {
      const result = await get(baseUrl, cancelToken);
      return result.data;
    } catch (e) {
      throw e;
    }
  };

  const createNewStaffMember = async (
    staffMemberToCreate: EditableStaffDetails
  ): Promise<StaffMember> => {
    try {
      const result = await post(baseUrl, {
        username: staffMemberToCreate.username,
        password: staffMemberToCreate.password,
        role: staffMemberToCreate.role,
        givenName: staffMemberToCreate.givenName,
        familyName: staffMemberToCreate.familyName,
      });
      return result.data;
    } catch (e) {
      throw e;
    }
  };

  const updateExistingStaffMember = async (
    staffMemberToEdit: EditableStaffDetails
  ): Promise<EditableStaffDetails> => {
    await put(`${baseUrl}/${staffMemberToEdit.username}`, {
      password: staffMemberToEdit.password,
      role: staffMemberToEdit.role,
      givenName: staffMemberToEdit.givenName,
      familyName: staffMemberToEdit.familyName,
    });

    return staffMemberToEdit;
  };

  const deleteStaffMember = async (username: string): Promise<string> => {
    await del(`${baseUrl}/${username}`);
    return username;
  };

  return {
    getAllStaffMembers,
    createNewStaffMember,
    updateExistingStaffMember,
    deleteStaffMember,
    getCancelTokenSource: api.getCancelTokenSource,
  };
}
