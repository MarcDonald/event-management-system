import React, { useEffect, useState } from 'react';
import VenueStatus from '../../../shared/models/VenueStatus';
import useVenueStatusColors from '../../../shared/hooks/useVenueStatusColors';
import styled from 'styled-components';

interface StatusHeaderProps {
  status: VenueStatus;
}

const Header = styled.header.attrs((props: { backgroundColor: string }) => ({
  backgroundColor: props.backgroundColor,
}))`
  min-width: 100vw;
  width: 100vw;
  text-align: center;
  padding: 0.5rem 0;
  background-color: ${(props) => props.backgroundColor};
`;

const HeaderText = styled.span`
  color: white;
  vertical-align: middle;
  font-size: 2.25rem;
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
