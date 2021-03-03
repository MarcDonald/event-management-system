import StaffRole from '../models/StaffRole';
import { useHistory } from 'react-router-dom';
import useLoggedInUserDetails from './useLoggedInUserDetails';
import StaffMember from '../models/StaffMember';

interface PageProtection {
  protectPage: (...allowedRoles: StaffRole[]) => Promise<void>;
  loggedOutProtection: () => Promise<void>;
  loggedInProtection: () => Promise<void>;
}

/**
 * Hook that redirects a user if they are not permitted to view a page
 */
export default function usePageProtection(): PageProtection {
  const history = useHistory();
  const loggedInUserDetails = useLoggedInUserDetails();

  const protectPage = async (...allowedRoles: StaffRole[]): Promise<void> => {
    const user: StaffMember = await loggedInUserDetails.getLoggedInUser();
    if (!user || !allowedRoles.includes(user.role)) {
      history.replace('/404');
    }
  };

  /**
   * Redirects to the homepage if the user is logged in
   */
  const loggedOutProtection = async (): Promise<void> => {
    const user = await loggedInUserDetails.getLoggedInUser();
    if (user) {
      history.replace('/');
    }
  };

  /**
   * Redirects to the login page if the user is not logged in
   */
  const loggedInProtection = async (): Promise<void> => {
    const user = await loggedInUserDetails.getLoggedInUser();
    if (!user) {
      history.replace('/login');
    }
  };

  return {
    protectPage,
    loggedOutProtection,
    loggedInProtection,
  };
}
