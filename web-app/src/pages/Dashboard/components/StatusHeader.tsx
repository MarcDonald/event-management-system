import React, { useEffect, useState } from 'react';
import VenueStatus from '../../../shared/models/VenueStatus';
import useVenueStatusColors from '../../../shared/hooks/useVenueStatusColors';
import styled from 'styled-components';

interface StatusHeaderProps {
  status: VenueStatus;
}

const Header = styled.header<{ backgroundColor: string }>`
  min-width: 100vw;
  width: 100vw;
  height: 6vh;
  text-align: center;
  padding: 0.5rem 0;
  display: flex;
  background-color: ${(props) => props.backgroundColor};
`;

const HeaderText = styled.span`
  color: white;
  vertical-align: middle;
  font-size: 2.25rem;
  margin: auto;
`;

const Status = styled.span`
  font-weight: bold;
`;

/**
 * Header that displays the current venue status
 */
export default function StatusHeader(props: StatusHeaderProps) {
  const venueStatusColorCalculator = useVenueStatusColors();

  const [background, setBackground] = useState<string>('');

  useEffect(() => {
    setBackground(venueStatusColorCalculator.getVenueStatusColor(props.status));
  }, [props.status]);

  return (
    <Header backgroundColor={background}>
      <HeaderText>
        Current Venue Status: <Status>{props.status.toString()}</Status>
      </HeaderText>
    </Header>
  );
}
