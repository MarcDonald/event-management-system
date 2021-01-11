import React, { useEffect, useReducer } from 'react';
import ManagementEditHeader from '../ManagementEditHeader';
import StaffCard from './StaffCard';
import StaffRole from '../../../Models/StaffRole';
import {
  createNewStaffMember,
  deleteStaffMember,
  getAllStaffMembers,
  updateExistingStaffMember,
} from '../../../Services/StaffService';
import Loading from '../../../Components/Loading';
import Dropdown from '../../../Components/Dropdown';
import ItemListDrawer from '../ItemListDrawer';
import ManageStaffStateReducer, {
  manageStaffDefaultState,
} from './State/ManageStaffStateReducer';
import ManageStaffStateActions from './State/ManageStaffStateActions';
import { toast } from 'react-hot-toast';
import { Auth } from 'aws-amplify';

/**
 * Staff management page
 */
export default function ManageStaff() {
  const [state, dispatch] = useReducer(
    ManageStaffStateReducer,
    manageStaffDefaultState
  );

  const staffSearch = (searchContent: string) => {
    dispatch({
      type: ManageStaffStateActions.StaffSearch,
      parameters: {
        searchContent,
      },
    });
  };

  useEffect(() => {
    const setup = async () => {
      dispatch({
        type: ManageStaffStateActions.Load,
      });
      const staffList = await getAllStaffMembers();
      dispatch({
        type: ManageStaffStateActions.StaffMembersLoaded,
        parameters: {
          staffList,
        },
      });
    };
    setup().then();
  }, []);

  const selectStaffMemberToEdit = (username: string) => {
    dispatch({
      type: ManageStaffStateActions.SelectStaffToEdit,
      parameters: {
        username,
      },
    });
  };

  const validateForm = (): boolean => {
    try {
      if (state.username.length < 1) {
        throw new Error('Username too short');
      }
      if (state.isNew || state.password.length !== 0) {
        if (state.password !== state.confirmPassword) {
          throw new Error('Passwords must match');
        }
        if (state.password.length < 8) {
          throw new Error('Password must be more than 8 characters');
        }
      }
      if (state.givenName.length < 1) {
        throw new Error('Given name is too short');
      }
      if (state.familyName.length < 1) {
        throw new Error('Family name is too short');
      }
      if (!state.role) {
        throw new Error('Must select a role');
      }
    } catch (error) {
      toast.error(error.message);
      return false;
    }
    return true;
  };

  const formSave = async () => {
    if (validateForm()) {
      dispatch({
        type: ManageStaffStateActions.Save,
      });
      const userDetails = {
        username: state.username,
        // Safe non-null assertion because the form has already been validated
        role: state.role!,
        givenName: state.givenName,
        familyName: state.familyName,
        password: state.password,
      };

      try {
        if (state.isNew) {
          const newStaffMember = await toast.promise(
            createNewStaffMember(userDetails),
            {
              error: (e) => {
                console.log(e);
                return 'Error Adding New Staff Member';
              },
              loading: 'Adding New Staff Member',
              success: 'New Staff Member Added',
            }
          );
          dispatch({
            type: ManageStaffStateActions.StaffMemberAdded,
            parameters: {
              newStaffMember,
            },
          });
        } else {
          const updatedStaffMember = await toast.promise(
            updateExistingStaffMember(userDetails),
            {
              error: (e) => {
                console.error(e);
                return 'Error Updating Staff Member';
              },
              loading: 'Updating Staff Member',
              success: 'Staff Member Updated',
            }
          );
          // Updates the details in the list with the new details of the user
          dispatch({
            type: ManageStaffStateActions.StaffMemberUpdated,
            parameters: {
              updatedStaffMember,
            },
          });
        }
        dispatch({ type: ManageStaffStateActions.SetupNewStaff });
      } catch (error) {
        dispatch({
          type: ManageStaffStateActions.SaveError,
          parameters: {
            error,
          },
        });
      }
    }
  };

  const isCurrentUser = async () => {
    const currentUser = await Auth.currentUserInfo();
    if (currentUser) {
      return currentUser.username === state.username;
    }
    return true;
  };

  const formDelete = async () => {
    if (!state.isNew) {
      if (await isCurrentUser()) {
        toast.error('You cannot delete yourself');
      } else {
        dispatch({ type: ManageStaffStateActions.Delete });
        await toast.promise(deleteStaffMember(state.username), {
          error: 'Error Deleting Staff Member',
          loading: 'Deleting Staff Member',
          success: 'Staff Member Deleted',
        });
        dispatch({ type: ManageStaffStateActions.StaffMemberDeleted });
      }
    } else {
      dispatch({ type: ManageStaffStateActions.SetupNewStaff });
    }
  };

  const convertDropdownRoleToUserRole = (
    key: string | number
  ): StaffRole | null => {
    switch (key) {
      case 'Steward':
        return StaffRole.Steward;
      case 'ControlRoomOperator':
        return StaffRole.ControlRoomOperator;
      case 'Administrator':
        return StaffRole.Administrator;
      default:
        return null;
    }
  };

  const header = () => {
    return (
      <>
        {(state.givenName || state.familyName) && (
          <ManagementEditHeader
            delete={formDelete}
            title={`${state.givenName} ${state.familyName}`}
            save={formSave}
            disableButtons={state.disableButtons}
          />
        )}
        {!state.givenName && !state.familyName && (
          <ManagementEditHeader
            delete={formDelete}
            title="New User"
            save={formSave}
            disableButtons={state.disableButtons}
          />
        )}
      </>
    );
  };

  const staffList = () => {
    if (state.isLoadingStaffMembers) {
      return <Loading containerClassName="mt-4" />;
    } else {
      return state.displayedStaff.map((user) => {
        return (
          <StaffCard
            key={user.username}
            name={`${user.givenName} ${user.familyName}`}
            username={user.username}
            isSelected={user.username === state.username}
            onClick={() => selectStaffMemberToEdit(user.username)}
          />
        );
      });
    }
  };

  const userDetailsForm = () => {
    return (
      <form
        onSubmit={formSave}
        className="flex flex-col col-start-2 col-span-2 mt-4"
      >
        <label htmlFor="username">Username</label>
        <input
          id="username"
          disabled={!state.isNew}
          inputMode="text"
          type="text"
          value={state.username}
          className="form-input"
          placeholder="Username"
          onChange={(event) =>
            dispatch({
              type: ManageStaffStateActions.FieldChange,
              parameters: {
                fieldName: event.target.id,
                fieldValue: event.target.value,
              },
            })
          }
        />
        <label htmlFor="password" className="mt-2">
          Password
        </label>
        <input
          id="password"
          inputMode="text"
          type="password"
          value={state.password}
          className="form-input"
          placeholder="Password"
          onChange={(event) =>
            dispatch({
              type: ManageStaffStateActions.FieldChange,
              parameters: {
                fieldName: event.target.id,
                fieldValue: event.target.value,
              },
            })
          }
        />
        <label htmlFor="confirmPassword" className="mt-2">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          inputMode="text"
          type="password"
          value={state.confirmPassword}
          className="form-input"
          placeholder="Confirm Password"
          onChange={(event) =>
            dispatch({
              type: ManageStaffStateActions.FieldChange,
              parameters: {
                fieldName: event.target.id,
                fieldValue: event.target.value,
              },
            })
          }
        />
        <label htmlFor="givenName" className="mt-2">
          Given Name
        </label>
        <input
          id="givenName"
          inputMode="text"
          type="text"
          value={state.givenName}
          className="form-input"
          placeholder="Given Name"
          onChange={(event) =>
            dispatch({
              type: ManageStaffStateActions.FieldChange,
              parameters: {
                fieldName: event.target.id,
                fieldValue: event.target.value,
              },
            })
          }
        />
        <label htmlFor="familyName" className="mt-2">
          Family Name
        </label>
        <input
          id="familyName"
          inputMode="text"
          type="text"
          value={state.familyName}
          className="form-input"
          placeholder="Family Name"
          onChange={(event) =>
            dispatch({
              type: ManageStaffStateActions.FieldChange,
              parameters: {
                fieldName: event.target.id,
                fieldValue: event.target.value,
              },
            })
          }
        />
        <label htmlFor="role" className="mt-2">
          Role
        </label>
        <Dropdown
          id="role"
          title="Select Role"
          list={[
            {
              key: 'Steward',
              name: 'Steward',
            },
            {
              key: 'ControlRoomOperator',
              name: 'Control Room Operator',
            },
            {
              key: 'Administrator',
              name: 'Administrator',
            },
          ]}
          onSelected={(key) => {
            dispatch({
              type: ManageStaffStateActions.FieldChange,
              parameters: {
                fieldName: 'role',
                fieldValue: convertDropdownRoleToUserRole(key),
              },
            });
          }}
          currentlySelectedKey={state.role ? state.role : ''}
        />
      </form>
    );
  };

  return (
    <div className="grid grid-cols-5 h-full">
      <div className="col-span-4 mx-16">
        {header()}
        <div className="grid grid-cols-4">{userDetailsForm()}</div>
      </div>
      <ItemListDrawer
        title="Staff"
        newButtonClick={() =>
          dispatch({
            type: ManageStaffStateActions.SetupNewStaff,
          })
        }
        newButtonText="New Staff Member"
        onSearch={staffSearch}
        displayedList={staffList()}
      />
    </div>
  );
}
