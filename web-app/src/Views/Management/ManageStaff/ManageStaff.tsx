import React, { useEffect, useState } from 'react';
import { SideNavSearch } from '../../../Components/SideNavSearch';
import ManagementEditHeader from '../ManagementEditHeader';
import User from '../../../Models/User';
import StaffCard from './StaffCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExclamationTriangle,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { useFormFields } from '../../../Hooks/useFormFields';
import UserRole from '../../../Models/UserRole';
import {
  createNewUser,
  deleteUser,
  getAllUsers,
  updateExistingUser,
} from '../../../Services/UserService';
import Loading from '../../../Components/Loading';
import Dropdown from '../../../Components/Dropdown';

interface ManageStaffFormFields {
  username: string;
  password: string;
  confirmPassword: string;
  givenName: string;
  familyName: string;
  role: UserRole | null;
  isNew: boolean;
}

const emptyFormFields = {
  username: '',
  password: '',
  confirmPassword: '',
  givenName: '',
  familyName: '',
  role: null,
  isNew: true,
};

export default function ManageStaff() {
  const [allStaff, setAllStaff] = useState<User[]>([]);
  const [displayedStaff, setDisplayedStaff] = useState<User[]>([]);
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
        displayedStaff.filter((user) => {
          if (
            user.username.toLowerCase().includes(searchContent) ||
            user.familyName.toLowerCase().includes(searchContent) ||
            user.givenName.toLowerCase().includes(searchContent)
          ) {
            return user;
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
      const staffList = await getAllUsers();
      setIsLoadingStaffMembers(false);
      setAllStaff(staffList);
      setDisplayedStaff(staffList);
    };
    setup().then();
  }, []);

  const selectUserToEdit = (username: string) => {
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

  const displayStaffList = () => {
    if (isLoadingStaffMembers) {
      return <Loading containerClassName="mt-4" />;
    } else {
      return displayedStaff.map((user) => {
        return (
          <StaffCard
            key={user.username}
            name={`${user.givenName} ${user.familyName}`}
            username={user.username}
            onClick={() => selectUserToEdit(user.username)}
          />
        );
      });
    }
  };

  const formSave = async () => {
    if (validateForm()) {
      setIsSaving(true);
      const userDetails = {
        username: fields.username,
        role: fields.role!,
        givenName: fields.givenName,
        familyName: fields.familyName,
        password: fields.password,
      };

      // TODO error handling
      if (fields.isNew) {
        const newUser = await createNewUser(userDetails);
        allStaff.push(newUser);
      } else {
        const updatedUser = await updateExistingUser(userDetails);
        const indexOfUser = allStaff.findIndex(
          (user) => user.username === userDetails.username
        );
        allStaff[indexOfUser] = {
          ...allStaff[indexOfUser],
          ...updatedUser,
        };
      }
      setupNewUser();
      setIsSaving(false);
    }
  };

  const formDelete = async () => {
    setIsDeleting(true);
    await deleteUser(fields.username);
    const listWithoutDeletedUser = allStaff.filter(
      (user) => user.username !== fields.username
    );
    setAllStaff(listWithoutDeletedUser);
    setDisplayedStaff(listWithoutDeletedUser);
    setupNewUser();
    setIsDeleting(false);
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

  const convertDropdownRoleToUserRole = (
    key: string | number
  ): UserRole | null => {
    switch (key) {
      case 'Steward':
        return UserRole.Steward;
      case 'ControlRoomOperator':
        return UserRole.ControlRoomOperator;
      case 'Administrator':
        return UserRole.Administrator;
      default:
        return null;
    }
  };

  const userDetailsForm = () => {
    return (
      <form onSubmit={formSave} className="flex flex-col mt-4">
        <label htmlFor="username">Username</label>
        <input
          id="username"
          inputMode="text"
          type="text"
          value={fields.username}
          className="outline-none border border-gray-400 focus:border-brand rounded-md p-2"
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
          className="outline-none border border-gray-400 focus:border-brand rounded-md p-2"
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
          className="outline-none border border-gray-400 focus:border-brand rounded-md p-2"
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
          className="outline-none border border-gray-400 focus:border-brand rounded-md p-2"
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
          className="outline-none border border-gray-400 focus:border-brand rounded-md p-2"
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
        {error && (
          <div className="text-center mt-2 mb-8">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="text-error mr-2"
            />
            <span>{error.message}</span>
          </div>
        )}
      </form>
    );
  };

  const rightSide = () => {
    return (
      <div className="bg-white h-full flex flex-col items-center">
        <h2 className="side-nav-title">Staff</h2>
        <SideNavSearch search={userSearch} />
        <button className="btn w-4/5 mt-2" onClick={setupNewUser}>
          <FontAwesomeIcon icon={faPlus} className="mr-4" />
          <span>New Staff Member</span>
        </button>
        <div className="w-4/5">{displayStaffList()}</div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-5 h-full">
      <div className="col-span-4 mx-16">
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
        {userDetailsForm()}
      </div>
      {rightSide()}
    </div>
  );
}
