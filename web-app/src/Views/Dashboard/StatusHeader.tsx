import React, { useEffect, useState } from 'react';
import VenueStatus from '../../Models/VenueStatus';

interface StatusHeaderPropTypes {
  status: VenueStatus;
  hideText?: boolean;
}

export default function StatusHeader(props: StatusHeaderPropTypes) {
  const [background, setBackground] = useState<string>('');
  const [statusText, setStatusText] = useState<string>('');

  useEffect(() => {
    switch (props.status) {
      case VenueStatus.Low:
        setBackground('bg-green-600');
        setStatusText('Low');
        break;
      case VenueStatus.High:
        setBackground('bg-orange-600');
        setStatusText('High');
        break;
      case VenueStatus.Evacuate:
        setBackground('bg-red-600');
        setStatusText('Evacuate');
        break;
    }
  }, [props.status]);

  return (
    <header className={`min-w-screen text-center py-2 w-screen ${background}`}>
      {!props.hideText && (
        <span className="text-white align-middle text-4xl">
          Current Venue Status: <span className="font-bold">{statusText}</span>
        </span>
      )}
    </header>
  );
}
