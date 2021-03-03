import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import ManageStaff from './ManageStaff/ManageStaff';
import ManageVenues from './ManageVenues/ManageVenues';
import ManageEvents from './ManageEvents/ManageEvents';
import LoginStateDisplay from '../../shared/components/LoginStateDisplay/LoginStateDisplay';
import usePageProtection from '../../shared/hooks/usePageProtection';
import StaffRole from '../../shared/models/StaffRole';
import { Toaster } from 'react-hot-toast';
import { toastErrorStyle } from '../../styles/ToastStyles';
import { SideNavTitle } from '../../styles/GlobalStyles';
import {
  Container,
  Content,
  Header,
  NavColumn,
  Navigation,
  PageContainer,
  SideNavItem,
  UserDetailsSection,
} from './ManagementStyles';

export enum ManagementPage {
  Venues = 'venues',
  Events = 'events',
  Staff = 'staff',
}

interface ManagementProps {
  initialSelectedPage: ManagementPage;
}

/**
 * Container for all management pages
 */
export default function Management(props: ManagementProps) {
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
    <Container>
      <Toaster
        position="top-center"
        toastOptions={{
          error: toastErrorStyle,
          duration: 1500,
        }}
      />
      <Header />
      <Content>
        <NavColumn>
          <section>
            <SideNavTitle>Manage</SideNavTitle>
            <Navigation>
              <ul>
                <SideNavItem
                  onClick={() => changeTab(ManagementPage.Venues)}
                  isSelected={selectedPage === ManagementPage.Venues}
                >
                  Venues
                </SideNavItem>
                <SideNavItem
                  onClick={() => changeTab(ManagementPage.Events)}
                  isSelected={selectedPage === ManagementPage.Events}
                >
                  Events
                </SideNavItem>
                <SideNavItem
                  onClick={() => changeTab(ManagementPage.Staff)}
                  isSelected={selectedPage === ManagementPage.Staff}
                >
                  Staff
                </SideNavItem>
              </ul>
            </Navigation>
          </section>
          <UserDetailsSection>
            <LoginStateDisplay showHomeButton={true} />
          </UserDetailsSection>
        </NavColumn>
        <PageContainer>
          {selectedPage === ManagementPage.Venues && <ManageVenues />}
          {selectedPage === ManagementPage.Events && <ManageEvents />}
          {selectedPage === ManagementPage.Staff && <ManageStaff />}
        </PageContainer>
      </Content>
    </Container>
  );
}
