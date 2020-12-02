import React, { useEffect, useState } from 'react';
import VenueStatus from '../../Models/VenueStatus';
import useVenueStatusColors from '../../Hooks/useVenueStatusColors';

interface StatusHeaderPropTypes {
  status: VenueStatus;
}

/**
 * Header that displays the current venue status
 */
export default function StatusHeader(props: StatusHeaderPropTypes) {
  const venueStatusColorCalculator = useVenueStatusColors();

  const [background, setBackground] = useState<string>('');

  useEffect(() => {
    setBackground(venueStatusColorCalculator.getVenueStatusColor(props.status));
  }, [props.status]);

  return (
    <header className={`min-w-screen text-center py-2 w-screen ${background}`}>
      <span className="text-white align-middle text-4xl">
        Current Venue Status:{' '}
        <span className="font-bold">{props.status.toString()}</span>
      </span>
    </header>
  );
}
