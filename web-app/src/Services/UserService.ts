import User from '../Models/User';
import UserRole from '../Models/UserRole';

export async function getAllUsers(): Promise<Array<User>> {
  return [
    {
      username: 'testUser1',
      attributes: {
        sub: '1234',
        role: UserRole.Administrator,
        givenName: 'Marc',
        familyName: 'Donald',
      },
    },
    {
      username: 'testUser2',
      attributes: {
        sub: '1235',
        role: UserRole.Steward,
        givenName: 'John',
        familyName: 'Smith',
      },
    },
    {
      username: 'testUser3',
      attributes: {
        sub: '1236',
        role: UserRole.ControlRoomOperator,
        givenName: 'Joe',
        familyName: 'Bloggs',
      },
    },
  ];
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
  console.log(`Create user ${JSON.stringify(userToCreate)}`);
  await sleep(1000);
  return {
    username: userToCreate.username,
    attributes: {
      sub: 'astring',
      role: userToCreate.role,
      givenName: userToCreate.givenName,
      familyName: userToCreate.familyName,
    },
  };
}

export async function updateExistingUser(userToCreate: EditableUserDetails) {
  console.log(`Updating[ user ${JSON.stringify(userToCreate)}`);
  await sleep(1000);
  return {
    username: userToCreate.username,
    attributes: {
      sub: 'astring',
      role: userToCreate.role,
      givenName: userToCreate.givenName,
      familyName: userToCreate.familyName,
    },
  };
}

export async function deleteUser(username: string) {
  console.log(`Deleting user ${username}`);
  await sleep(1000);
}

// TODO temporary to test in progress states
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
