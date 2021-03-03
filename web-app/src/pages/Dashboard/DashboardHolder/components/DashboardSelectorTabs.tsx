import React from 'react';
import { Button } from '../../../../styles/GlobalStyles';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  margin-bottom: 1rem;
`;

const DisabledOption = styled(Button)`
  background-color: darkgray;
  font-size: 1.5rem;

  :hover {
    background-color: gray;
  }
`;

const EnabledOption = styled(Button)`
  font-size: 1.5rem;
`;

/**
 * Tabs for selecting a type of dashboard to display
 */
export default function DashboardSelectorTabs() {
  return (
    <Container>
      <DisabledOption>Incidents</DisabledOption>
      <EnabledOption>Positions</EnabledOption>
    </Container>
  );
}
