import StateAction from '../../../../Utils/StateAction';
import ManageStaffStateActions from './ManageStaffStateActions';
import StaffRole from '../../../../Models/StaffRole';
import StaffMember from '../../../../Models/StaffMember';

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
  disableButtons: boolean;
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
  isLoadingStaffMembers: true,
  disableButtons: false,
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
    case ManageStaffStateActions.FieldChange: {
      return {
        ...state,
        [parameters?.fieldName]: parameters?.fieldValue,
      };
    }
    case ManageStaffStateActions.Save: {
      return {
        ...state,
        disableButtons: true,
      };
    }
    case ManageStaffStateActions.SaveError: {
      return {
        ...state,
        disableButtons: false,
      };
    }
    case ManageStaffStateActions.StaffMemberAdded: {
      return {
        ...state,
        allStaff: [...state.allStaff, parameters?.newStaffMember],
        displayedStaff: [...state.allStaff, parameters?.newStaffMember],
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
        disableButtons: false,
      };
    }
    case ManageStaffStateActions.Delete: {
      return {
        ...state,
        disableButtons: true,
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
      };
    }
    default:
      break;
  }
  return state;
}
