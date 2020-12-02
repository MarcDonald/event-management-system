import React, { useEffect, useState } from 'react';
import VenueStatus from '../../../Models/VenueStatus';
import useVenueStatusColors from '../../../Hooks/useVenueStatusColors';

interface StatusFooterPropTypes {
  status: VenueStatus;
}

/**
 * Colored footer displaying the current venue status color
 */
export default function StatusFooter(props: StatusFooterPropTypes) {
  const venueStatusColorCalculator = useVenueStatusColors();

  const [background, setBackground] = useState<string>('');

  useEffect(() => {
    setBackground(venueStatusColorCalculator.getVenueStatusColor(props.status));
  }, [props.status]);

  return <footer className={`text-center h-12 ${background}`} />;
}
