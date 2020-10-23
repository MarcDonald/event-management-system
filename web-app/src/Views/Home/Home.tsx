import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import BrandHeader from '../../Components/BrandHeader';
import useLocalAuth from '../../Hooks/useLocalAuth';
import User from '../../Models/User';
import LoggedInUser from '../../Components/LoggedInUser';

export default function Home() {
  const localAuth = useLocalAuth();
  const history = useHistory();
  const [user, setUser] = useState<null | User>(null);

  useEffect(() => {
    const redirectToLogin = async () => {
      const user = await localAuth.getLoggedInUser();
      if (user) {
        setUser(user);
      } else {
        history.replace('/login');
      }
    };

    redirectToLogin().then();
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
        <div className="row-start-2 grid grid-cols-4">
          <div className="col-start-1 grid">
            <div className="self-end m-2">
              <div style={{ width: '250px' }}>
                <LoggedInUser />
              </div>
            </div>
          </div>
          <div className="col-start-2 col-span-2">
            <section>
              <h1 className="text-3xl font-bold text-center mt-4">
                Upcoming Events
              </h1>
              <div>TODO</div>
            </section>
            {localAuth.isAdmin(user) && (
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
