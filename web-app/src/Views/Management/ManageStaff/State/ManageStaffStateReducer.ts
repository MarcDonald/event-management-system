import StateAction from '../../../../Utils/StateAction';
import ManageStaffStateActions from './ManageStaffStateActions';
import StaffRole from '../../../../Models/StaffRole';
import StaffMember from '../../../../Models/StaffMember';
import SuccessMessage from '../../../../Models/SuccessMessage';

interface ManageStaffState {
  username: string;
  password: string;
  confirmPassword: string;
  givenName: string;
  familyName: string;
  role: StaffRole | null;
  isNew: boolean;
  allStaff: StaffMember[];
  displayedStaff: StaffMember[];
  error: Error | null;
  success: SuccessMessage | null;
  isSaving: boolean;
  isDeleting: boolean;
  isLoadingStaffMembers: boolean;
}

export const manageStaffDefaultState: ManageStaffState = {
  username: '',
  password: '',
  confirmPassword: '',
  givenName: '',
  familyName: '',
  role: null,
  isNew: true,
  allStaff: [],
  displayedStaff: [],
  error: null,
  success: null,
  isDeleting: false,
  isLoadingStaffMembers: true,
  isSaving: false,
};

export default function ManageStaffStateReducer(
  state: ManageStaffState,
  action: StateAction<ManageStaffStateActions>
): ManageStaffState {
  const { type, parameters } = action;
  switch (type) {
    case ManageStaffStateActions.Load: {
      return {
        ...manageStaffDefaultState,
      };
    }
    case ManageStaffStateActions.StaffMembersLoaded: {
      if (parameters?.staffList) {
        return {
          ...state,
          isLoadingStaffMembers: false,
          allStaff: parameters.staffList,
          displayedStaff: parameters.staffList,
        };
      }
      return { ...state };
    }
    case ManageStaffStateActions.StaffSearch: {
      if (parameters?.searchContent) {
        const searchContentLower = parameters.searchContent.toLowerCase();
        return {
          ...state,
          displayedStaff: state.displayedStaff.filter((staffMember) => {
            if (
              staffMember.username.toLowerCase().includes(searchContentLower) ||
              staffMember.familyName
                .toLowerCase()
                .includes(searchContentLower) ||
              staffMember.givenName.toLowerCase().includes(searchContentLower)
            ) {
              return staffMember;
            }
          }),
        };
      }
      return {
        ...state,
        displayedStaff: state.allStaff,
      };
    }
    case ManageStaffStateActions.SetupNewStaff: {
      return {
        ...manageStaffDefaultState,
        allStaff: state.allStaff,
        displayedStaff: state.displayedStaff,
        isLoadingStaffMembers: false,
      };
    }
    case ManageStaffStateActions.SelectStaffToEdit: {
      if (parameters?.username) {
        const user = state.allStaff.find(
          (user) => user.username === parameters.username
        );
        if (user) {
          return {
            ...state,
            username: user.username,
            password: '',
            confirmPassword: '',
            givenName: user.givenName,
            familyName: user.familyName,
            role: user.role,
            isNew: false,
          };
        }
      }
      return {
        ...manageStaffDefaultState,
        allStaff: state.allStaff,
        displayedStaff: state.displayedStaff,
        isLoadingStaffMembers: false,
      };
    }
    case ManageStaffStateActions.FormInvalid: {
      return {
        ...state,
        error: parameters?.error,
      };
    }
    case ManageStaffStateActions.FieldChange: {
      return {
        ...state,
        [parameters?.fieldName]: parameters?.fieldValue,
        error: null,
      };
    }
    case ManageStaffStateActions.Save: {
      return {
        ...state,
        isSaving: true,
      };
    }
    case ManageStaffStateActions.SaveError: {
      console.error(JSON.stringify(parameters?.error, null, 2));
      return {
        ...state,
        error: parameters?.error,
        isSaving: false,
      };
    }
    case ManageStaffStateActions.StaffMemberAdded: {
      return {
        ...state,
        allStaff: [...state.allStaff, parameters?.newStaffMember],
        displayedStaff: [...state.allStaff, parameters?.newStaffMember],
        success: new SuccessMessage('Staff Added Successfully'),
      };
    }
    case ManageStaffStateActions.StaffMemberUpdated: {
      const indexOfStaff = state.allStaff.findIndex(
        (user) => user.username === parameters?.updatedStaffMember.username
      );
      // Updates staff details in the list
      const staffMembers = [...state.allStaff];
      staffMembers[indexOfStaff] = {
        ...staffMembers[indexOfStaff],
        ...parameters?.updatedStaffMember,
      };
      return {
        ...manageStaffDefaultState,
        allStaff: staffMembers,
        displayedStaff: staffMembers,
        isLoadingStaffMembers: false,
        isSaving: false,
        success: new SuccessMessage('Staff Updated Successfully'),
      };
    }
    case ManageStaffStateActions.Delete: {
      return {
        ...state,
        isDeleting: true,
      };
    }
    case ManageStaffStateActions.StaffMemberDeleted: {
      const listWithoutDeletedUser = state.allStaff.filter(
        (user) => user.username !== state.username
      );
      return {
        ...manageStaffDefaultState,
        allStaff: listWithoutDeletedUser,
        displayedStaff: listWithoutDeletedUser,
        isLoadingStaffMembers: false,
        success: new SuccessMessage('Staff Deleted Successfully'),
      };
    }
    default:
      break;
  }
  return state;
}
