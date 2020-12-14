import React, { useState } from 'react';
import VenueStatus from '../../../Models/VenueStatus';
import ColorDropdown, {
  ColorDropdownItem,
} from '../../../Components/ColorDropdown';
import useVenueStatusColors from '../../../Hooks/useVenueStatusColors';
import { updateEventStatus } from '../../../Services/EventService';

interface VenueStatusChangerPropTypes {
  status: VenueStatus;
  eventId: string;
  onVenueStatusChange: (venueStatus: VenueStatus) => void;
}

/**
 * Dropdown for a control room operator to change the status of a venue from the dashboard
 */
export default function VenueStatusChanger(props: VenueStatusChangerPropTypes) {
  const colorCalculator = useVenueStatusColors();

  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const statusList: Array<ColorDropdownItem> = [
    {
      key: VenueStatus.Low,
      name: VenueStatus.Low,
      backgroundColorClass: colorCalculator.getVenueStatusColor(
        VenueStatus.Low
      ),
      backgroundColorHoverClass: colorCalculator.getLightVenueStatusColor(
        VenueStatus.Low
      ),
      textColorClass: 'text-white',
    },
    {
      key: VenueStatus.High,
      name: VenueStatus.High,
      backgroundColorClass: colorCalculator.getVenueStatusColor(
        VenueStatus.High
      ),
      backgroundColorHoverClass: colorCalculator.getLightVenueStatusColor(
        VenueStatus.High
      ),
      textColorClass: 'text-white',
    },
    {
      key: VenueStatus.Evacuate,
      name: VenueStatus.Evacuate,
      backgroundColorClass: colorCalculator.getVenueStatusColor(
        VenueStatus.Evacuate
      ),
      backgroundColorHoverClass: colorCalculator.getLightVenueStatusColor(
        VenueStatus.Evacuate
      ),
      textColorClass: 'text-white',
    },
  ];

  const changeVenueStatus = async (newStatus: string) => {
    setIsUpdating(true);
    const result = await updateEventStatus(
      props.eventId,
      newStatus as VenueStatus
    );
    props.onVenueStatusChange(result);
    setIsUpdating(false);
  };

  return (
    <div className="flex flex-col items-center my-3">
      <label htmlFor="venueStatus">
        {isUpdating ? 'Updating...' : 'Change Venue Status'}
      </label>
      <ColorDropdown
        currentlySelectedKey={props.status.toString()}
        id="venueStatus"
        className="w-1/5"
        title="Change Venue Status"
        list={statusList}
        onSelected={changeVenueStatus}
      />
    </div>
  );
}
