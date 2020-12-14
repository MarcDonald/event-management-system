import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import BrandHeader from '../../Components/BrandHeader';
import useLoggedInUserDetails from '../../Hooks/useLoggedInUserDetails';
import StaffMember from '../../Models/StaffMember';
import LoginStateDisplay from '../../Components/LoginStateDisplay/LoginStateDisplay';
import UpcomingEvents from './UpcomingEvents';
import usePageProtection from '../../Hooks/usePageProtection';

/**
 * Home page for logged in users
 */
export default function Home() {
  const loggedInUserDetails = useLoggedInUserDetails();
  const pageProtection = usePageProtection();
  const history = useHistory();
  const [user, setUser] = useState<null | StaffMember>(null);

  useEffect(() => {
    pageProtection.loggedInProtection().then(async () => {
      const user = await loggedInUserDetails.getLoggedInUser();
      setUser(user);
    });
  }, []);

  if (user) {
    return (
      <div
        className="min-h-screen bg-background-gray"
        style={{
          display: 'grid',
          gridTemplateRows: 'auto 1fr auto',
          gridTemplateColumns: '100%',
        }}
      >
        <div className="row-start-1 h-auto">
          <BrandHeader />
        </div>
        <div className="row-start-2 grid grid-cols-6">
          <div className="col-start-1 grid">
            <div className="self-end">
              <LoginStateDisplay />
            </div>
          </div>
          <div className="col-start-2 col-span-4 mx-32">
            {loggedInUserDetails.isSteward(user) && (
              <section className="mt-16">
                <h1 className="text-center text-2xl font-bold">
                  This dashboard is for Control Room Operators and
                  Administrators only
                </h1>
              </section>
            )}
            {(loggedInUserDetails.isControlRoomOperator(user) ||
              loggedInUserDetails.isAdmin(user)) && (
              <section className="flex flex-col">
                <UpcomingEvents />
              </section>
            )}
            {loggedInUserDetails.isAdmin(user) && (
              <section className="flex flex-col">
                <h2 className="text-2xl font-bold text-center mt-4">
                  Management
                </h2>
                <button
                  className="btn w-1/2 self-center m-2"
                  onClick={() => history.push('/management/venues')}
                >
                  Manage Venues
                </button>
                <button
                  className="btn w-1/2 self-center m-2"
                  onClick={() => history.push('/management/events')}
                >
                  Manage Events
                </button>
                <button
                  className="btn w-1/2 self-center m-2"
                  onClick={() => history.push('/management/staff')}
                >
                  Manage Staff
                </button>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  } else {
    return <></>;
  }
}
