import React from 'react';
import { Button } from '../../../../styles/GlobalStyles';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  margin-bottom: 1rem;
`;

export const TabOption = styled(Button).attrs(
  (props: { enabled: boolean }) => ({
    enabled: props.enabled,
  })
)`
  font-size: 1.5rem;

  background-color: ${(props) => (props.enabled ? '' : 'darkgray')};
  cursor: ${(props) => (props.enabled ? 'initial' : 'pointer')};

  :hover {
    background-color: ${(props) => (props.enabled ? '' : 'darkgray')};
  }
`;

export enum Dashboards {
  Incidents,
  Positions,
}

interface DashboardSelectorTabsProps {
  onTabChange: (dashboardChangedTo: Dashboards) => void;
  currentTab: Dashboards;
}

/**
 * Tabs for selecting a type of dashboard to display
 */
export default function DashboardSelectorTabs({
  onTabChange,
  currentTab,
}: DashboardSelectorTabsProps) {
  return (
    <Container>
      <TabOption
        enabled={currentTab === Dashboards.Incidents}
        onClick={() => onTabChange(Dashboards.Incidents)}
      >
        Incidents
      </TabOption>
      <TabOption
        enabled={currentTab === Dashboards.Positions}
        onClick={() => onTabChange(Dashboards.Positions)}
      >
        Positions
      </TabOption>
    </Container>
  );
}
