import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import useLocalAuth from '../../Hooks/useLocalAuth';
import BrandHeader from '../../Components/BrandHeader';
import LoggedInUser from '../../Components/LoggedInUser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import ManageStaff from './ManageStaff/ManageStaff';

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
            <h1 className="side-nav-title">Management</h1>
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
            <div className="self-end m-2 flex flex-row justify-between">
              <div
                onClick={() => history.push('/')}
                className="bg-lighter-gray text-center w-1/5 align-middle mr-2 text-2xl rounded-md hover:bg-darker-gray cursor-pointer"
              >
                <FontAwesomeIcon icon={faHome} className="h-full" />
              </div>
              <div className="w-4/5">
                <LoggedInUser />
              </div>
            </div>
          </section>
        </div>
        <div className="col-start-2 col-span-5">
          {selectedPage === ManagementPage.Venues && <div>Venues</div>}
          {selectedPage === ManagementPage.Events && <div>Events</div>}
          {selectedPage === ManagementPage.Staff && <ManageStaff />}
        </div>
      </div>
    </div>
  );
}
