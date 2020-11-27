import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import useLocalAuth from '../../Hooks/useLocalAuth';
import BrandHeader from '../../Components/BrandHeader';
import ManageStaff from './ManageStaff/ManageStaff';
import ManageVenues from './ManageVenues/ManageVenues';
import ManageEvents from './ManageEvents/ManageEvents';
import LoginStateDisplay from '../../Components/LoginStateDisplay/LoginStateDisplay';

export enum ManagementPage {
  Venues = 'venues',
  Events = 'events',
  Staff = 'staff',
}

interface ManagementPropTypes {
  initialSelectedPage: ManagementPage;
}

export default function Management(props: ManagementPropTypes) {
  const localAuth = useLocalAuth();
  const history = useHistory();
  const [selectedPage, setSelectedPage] = useState<ManagementPage>(
    props.initialSelectedPage
  );

  useEffect(() => {
    const authorizeUser = async () => {
      const user = await localAuth.getLoggedInUser();
      if (!user || !localAuth.isAdmin(user)) {
        history.replace('/404');
      }
    };

    authorizeUser().then();
  }, []);

  const changeTab = (page: ManagementPage) => {
    setSelectedPage(page);
    history.push(`/management/${page.toString()}`);
  };

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
        <div className="col-start-1 grid bg-white">
          <section>
            <h1 className="side-nav-title">Manage</h1>
            <nav className="mt-8">
              <ul>
                <li
                  className={`${
                    selectedPage === ManagementPage.Venues
                      ? 'side-nav side-nav-selected'
                      : 'side-nav'
                  } pl-8 text-xl py-2 w-4/5 rounded-r-full`}
                  onClick={() => changeTab(ManagementPage.Venues)}
                >
                  Venues
                </li>
                <li
                  className={`${
                    selectedPage === ManagementPage.Events
                      ? 'side-nav side-nav-selected'
                      : 'side-nav'
                  } pl-8 text-xl py-2 w-4/5 rounded-r-full`}
                  onClick={() => changeTab(ManagementPage.Events)}
                >
                  Events
                </li>
                <li
                  className={`${
                    selectedPage === ManagementPage.Staff
                      ? 'side-nav side-nav-selected'
                      : 'side-nav'
                  } pl-8 text-xl py-2 w-4/5 rounded-r-full`}
                  onClick={() => changeTab(ManagementPage.Staff)}
                >
                  Staff
                </li>
              </ul>
            </nav>
          </section>
          <section className="self-end">
            <LoginStateDisplay showHomeButton={true} />
          </section>
        </div>
        <div className="col-start-2 col-span-5">
          {selectedPage === ManagementPage.Venues && <ManageVenues />}
          {selectedPage === ManagementPage.Events && <ManageEvents />}
          {selectedPage === ManagementPage.Staff && <ManageStaff />}
        </div>
      </div>
    </div>
  );
}
