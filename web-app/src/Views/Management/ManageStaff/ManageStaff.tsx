import React, { useEffect, useState } from 'react';
import ManagementEditHeader from '../ManagementEditHeader';
import StaffMember from '../../../Models/StaffMember';
import StaffCard from './StaffCard';
import { useFormFields } from '../../../Hooks/useFormFields';
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
import ErrorMessage from '../../../Components/ErrorMessage';

interface ManageStaffFormFields {
  username: string;
  password: string;
  confirmPassword: string;
  givenName: string;
  familyName: string;
  role: StaffRole | null;
  isNew: boolean;
}

// This is used as the default values when resetting the form
const emptyFormFields = {
  username: '',
  password: '',
  confirmPassword: '',
  givenName: '',
  familyName: '',
  role: null,
  isNew: true,
};

/**
 * Staff management page
 */
export default function ManageStaff() {
  const [allStaff, setAllStaff] = useState<StaffMember[]>([]);
  const [displayedStaff, setDisplayedStaff] = useState<StaffMember[]>([]);
  const [fields, setFields, setFieldsDirectly] = useFormFields<
    ManageStaffFormFields
  >(emptyFormFields);
  const [error, setError] = useState<Error | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isLoadingStaffMembers, setIsLoadingStaffMembers] = useState<boolean>(
    true
  );

  const userSearch = (searchContent: string) => {
    if (searchContent) {
      searchContent = searchContent.toLowerCase();
      setDisplayedStaff(
        displayedStaff.filter((staffMember) => {
          if (
            staffMember.username.toLowerCase().includes(searchContent) ||
            staffMember.familyName.toLowerCase().includes(searchContent) ||
            staffMember.givenName.toLowerCase().includes(searchContent)
          ) {
            return staffMember;
          }
        })
      );
    } else {
      setDisplayedStaff(allStaff);
    }
  };

  const setupNewUser = () => {
    setFieldsDirectly(emptyFormFields);
  };

  useEffect(() => {
    const setup = async () => {
      setupNewUser();
      const staffList = await getAllStaffMembers();
      setIsLoadingStaffMembers(false);
      setAllStaff(staffList);
      setDisplayedStaff(staffList);
    };
    setup().then();
  }, []);

  const selectStaffMemberToEdit = (username: string) => {
    const user = allStaff.find((user) => user.username === username);
    if (user) {
      setFieldsDirectly({
        username: user.username,
        password: '',
        confirmPassword: '',
        givenName: user.givenName,
        familyName: user.familyName,
        role: user.role,
        isNew: false,
      });
    } else {
      setupNewUser();
    }
  };

  const validateForm = (): boolean => {
    if (fields.username.length < 1) {
      setError(new Error('Username too short'));
      return false;
    }
    if (fields.isNew || fields.password.length !== 0) {
      if (fields.password !== fields.confirmPassword) {
        setError(new Error('Passwords must match'));
        return false;
      }
      if (fields.password.length < 8) {
        setError(new Error('Password must be more than 8 characters'));
        return false;
      }
    }
    if (fields.givenName.length < 1) {
      setError(new Error('Given name is too short'));
      return false;
    }
    if (fields.familyName.length < 1) {
      setError(new Error('Family name is too short'));
      return false;
    }
    if (!fields.role) {
      setError(new Error('Must select a role'));
      return false;
    }
    return true;
  };

  const formSave = async () => {
    if (validateForm()) {
      setIsSaving(true);
      const userDetails = {
        username: fields.username,
        // Safe non-null assertion because the form has already been validated
        role: fields.role!,
        givenName: fields.givenName,
        familyName: fields.familyName,
        password: fields.password,
      };

      try {
        if (fields.isNew) {
          const newUser = await createNewStaffMember(userDetails);
          allStaff.push(newUser);
        } else {
          const updatedUser = await updateExistingStaffMember(userDetails);
          const indexOfUser = allStaff.findIndex(
            (user) => user.username === userDetails.username
          );
          // Updates the details in the list with the new details of the user
          allStaff[indexOfUser] = {
            ...allStaff[indexOfUser],
            ...updatedUser,
          };
        }
        setupNewUser();
      } catch (e) {
        console.error(JSON.stringify(e, null, 2));
        setError(e);
      }
      setIsSaving(false);
    }
  };

  const formDelete = async () => {
    setIsDeleting(true);
    await deleteStaffMember(fields.username);
    const listWithoutDeletedUser = allStaff.filter(
      (user) => user.username !== fields.username
    );
    setAllStaff(listWithoutDeletedUser);
    setDisplayedStaff(listWithoutDeletedUser);
    setupNewUser();
    setIsDeleting(false);
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
        {(fields.givenName || fields.familyName) && (
          <ManagementEditHeader
            delete={formDelete}
            title={`${fields.givenName} ${fields.familyName}`}
            save={formSave}
            isDeleting={isDeleting}
            isSaving={isSaving}
          />
        )}
        {!fields.givenName && !fields.familyName && (
          <ManagementEditHeader
            delete={formDelete}
            title="New User"
            save={formSave}
            isDeleting={isDeleting}
            isSaving={isSaving}
          />
        )}
      </>
    );
  };

  const staffList = () => {
    if (isLoadingStaffMembers) {
      return <Loading containerClassName="mt-4" />;
    } else {
      return displayedStaff.map((user) => {
        return (
          <StaffCard
            key={user.username}
            name={`${user.givenName} ${user.familyName}`}
            username={user.username}
            isSelected={user.username === fields.username}
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
          disabled={!fields.isNew}
          inputMode="text"
          type="text"
          value={fields.username}
          className="form-input"
          placeholder="Username"
          onChange={(event) => {
            setFields(event);
            setError(null);
          }}
        />
        <label htmlFor="password" className="mt-2">
          Password
        </label>
        <input
          id="password"
          inputMode="text"
          type="password"
          value={fields.password}
          className="form-input"
          placeholder="Password"
          onChange={(event) => {
            setFields(event);
            setError(null);
          }}
        />
        <label htmlFor="confirmPassword" className="mt-2">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          inputMode="text"
          type="password"
          value={fields.confirmPassword}
          className="form-input"
          placeholder="Confirm Password"
          onChange={(event) => {
            setFields(event);
            setError(null);
          }}
        />
        <label htmlFor="givenName" className="mt-2">
          Given Name
        </label>
        <input
          id="givenName"
          inputMode="text"
          type="text"
          value={fields.givenName}
          className="form-input"
          placeholder="Given Name"
          onChange={(event) => {
            setFields(event);
            setError(null);
          }}
        />
        <label htmlFor="familyName" className="mt-2">
          Family Name
        </label>
        <input
          id="familyName"
          inputMode="text"
          type="text"
          value={fields.familyName}
          className="form-input"
          placeholder="Family Name"
          onChange={(event) => {
            setFields(event);
            setError(null);
          }}
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
            setFieldsDirectly({
              ...fields,
              role: convertDropdownRoleToUserRole(key),
            });
          }}
          currentlySelectedKey={fields.role ? fields.role : ''}
        />
        {error && <ErrorMessage message={error.message} />}
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
        newButtonClick={setupNewUser}
        newButtonText="New Staff Member"
        onSearch={userSearch}
        displayedList={staffList()}
      />
    </div>
  );
}
