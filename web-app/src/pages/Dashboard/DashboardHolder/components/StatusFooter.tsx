import React, { useEffect, useState } from 'react';
import VenueStatus from '../../../../shared/models/VenueStatus';
import useVenueStatusColors from '../../../../shared/hooks/useVenueStatusColors';
import styled from 'styled-components';

interface StatusFooterProps {
  status: VenueStatus;
}

const Footer = styled.footer.attrs((props: { backgroundColor: string }) => ({
  backgroundColor: props.backgroundColor,
}))`
  text-align: center;
  height: 3rem;
  background-color: ${(props) => props.backgroundColor};
`;

/**
 * Colored footer displaying the current venue status color
 */
export default function StatusFooter(props: StatusFooterProps) {
  const venueStatusColorCalculator = useVenueStatusColors();

  const [background, setBackground] = useState<string>('');

  useEffect(() => {
    setBackground(venueStatusColorCalculator.getVenueStatusColor(props.status));
  }, [props.status]);

  return <Footer backgroundColor={background} />;
}
