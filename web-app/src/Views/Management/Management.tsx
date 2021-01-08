import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import BrandHeader from '../../Components/BrandHeader';
import ManageStaff from './ManageStaff/ManageStaff';
import ManageVenues from './ManageVenues/ManageVenues';
import ManageEvents from './ManageEvents/ManageEvents';
import LoginStateDisplay from '../../Components/LoginStateDisplay/LoginStateDisplay';
import SideNavItem from './SideNavItem';
import usePageProtection from '../../Hooks/usePageProtection';
import StaffRole from '../../Models/StaffRole';
import { Toaster } from 'react-hot-toast';
import { toastErrorStyle } from '../../Utils/ToastStyles';

export enum ManagementPage {
  Venues = 'venues',
  Events = 'events',
  Staff = 'staff',
}

interface ManagementPropTypes {
  initialSelectedPage: ManagementPage;
}

/**
 * Container for all management pages
 */
export default function Management(props: ManagementPropTypes) {
  const pageProtection = usePageProtection();
  const history = useHistory();
  const [selectedPage, setSelectedPage] = useState<ManagementPage>(
    props.initialSelectedPage
  );

  useEffect(() => {
    pageProtection.protectPage(StaffRole.Administrator).then();
  }, []);

  const changeTab = (page: ManagementPage) => {
    setSelectedPage(page);
    history.push(`/management/${page.toString()}`);
  };

  return (
    <div
      className="min-h-screen bg-background-gray"
      // This grid layout allows us to have an auto-sized header and footer, and have the entire middle area taken up by our main content
      style={{
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        gridTemplateColumns: '100%',
      }}
    >
      <Toaster
        position="bottom-center"
        toastOptions={{
          error: toastErrorStyle,
          duration: 1500,
        }}
      />
      <div className="row-start-1 h-auto">
        <BrandHeader />
      </div>
      <div className="row-start-2 grid grid-cols-6">
        <div className="col-start-1 grid bg-white">
          <section>
            <h1 className="side-nav-title">Manage</h1>
            <nav className="mt-8">
              <ul>
                <SideNavItem
                  name="Venues"
                  onClick={() => changeTab(ManagementPage.Venues)}
                  isSelected={selectedPage === ManagementPage.Venues}
                />
                <SideNavItem
                  name="Events"
                  onClick={() => changeTab(ManagementPage.Events)}
                  isSelected={selectedPage === ManagementPage.Events}
                />
                <SideNavItem
                  name="Staff"
                  onClick={() => changeTab(ManagementPage.Staff)}
                  isSelected={selectedPage === ManagementPage.Staff}
                />
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
