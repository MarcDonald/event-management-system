import React, { useState } from 'react';
import VenueStatus from '../../../../shared/models/VenueStatus';
import ColorDropdown, {
  ColorDropdownItem,
} from '../../../../shared/components/ColorDropdown';
import useVenueStatusColors from '../../../../shared/hooks/useVenueStatusColors';
import styled from 'styled-components';
import useEventApi from '../../../../shared/hooks/api/useEventApi';

interface VenueStatusChangerProps {
  status: VenueStatus;
  eventId: string;
  onVenueStatusChange: (venueStatus: VenueStatus) => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0.75rem 0;
`;

const DropdownContainer = styled.div`
  width: 30%;
`;

/**
 * Dropdown for a control room operator to change the status of a venue from the dashboard
 */
export default function VenueStatusChanger(props: VenueStatusChangerProps) {
  const eventApi = useEventApi();
  const colorCalculator = useVenueStatusColors();
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const statusList: ColorDropdownItem[] = [
    {
      key: VenueStatus.Low,
      name: VenueStatus.Low,
      backgroundColor: colorCalculator.getVenueStatusColor(VenueStatus.Low),
      backgroundHoverColor: colorCalculator.getLightVenueStatusColor(
        VenueStatus.Low
      ),
      textColor: '#FFFFFF',
    },
    {
      key: VenueStatus.High,
      name: VenueStatus.High,
      backgroundColor: colorCalculator.getVenueStatusColor(VenueStatus.High),
      backgroundHoverColor: colorCalculator.getLightVenueStatusColor(
        VenueStatus.High
      ),
      textColor: '#FFFFFF',
    },
    {
      key: VenueStatus.Evacuate,
      name: VenueStatus.Evacuate,
      backgroundColor: colorCalculator.getVenueStatusColor(
        VenueStatus.Evacuate
      ),
      backgroundHoverColor: colorCalculator.getLightVenueStatusColor(
        VenueStatus.Evacuate
      ),
      textColor: '#FFFFFF',
    },
  ];

  const changeVenueStatus = async (newStatus: string) => {
    setIsUpdating(true);
    const result = await eventApi.updateEventStatus(
      props.eventId,
      newStatus as VenueStatus
    );
    props.onVenueStatusChange(result);
    setIsUpdating(false);
  };

  return (
    <Container>
      <label htmlFor="venueStatus">
        {isUpdating ? 'Updating...' : 'Change Venue Status'}
      </label>
      <DropdownContainer>
        <ColorDropdown
          currentlySelectedKey={props.status.toString()}
          id="venueStatus"
          title="Change Venue Status"
          list={statusList}
          onSelected={changeVenueStatus}
        />
      </DropdownContainer>
    </Container>
  );
}
