import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Dropdown, {
  DropdownItem,
} from '../../../../../shared/components/Dropdown';
import styled from 'styled-components';
import { PositiveButton } from '../../../../../styles/GlobalStyles';

interface NewStaffAssignmentEntryProps {
  onSave: (staffSelectedId: string, positionSelectedId: string) => any;
  staffToShow: DropdownItem[];
  positionsToShow: DropdownItem[];
}

const Form = styled.form`
  width: 100%;
  background-color: ${(props) => props.theme.surface};
  padding: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 0.375rem;
`;

const DropdownContainer = styled.div`
  width: 75%;
`;

const AddButtonIcon = styled(FontAwesomeIcon)`
  font-size: 1.5rem;
  vertical-align: middle;
`;

const DivWithTopGap = styled.div`
  margin-top: 0.5rem;
`;

/**
 * Input area for assigning a new staff member to an event
 */
export default function NewStaffAssignmentEntry(
  props: NewStaffAssignmentEntryProps
) {
  const [staffSelected, setStaffSelected] = useState<string>('');
  const [positionSelected, setPositionSelected] = useState<string>('');

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (staffSelected && positionSelected) {
      props.onSave(staffSelected, positionSelected);
      setStaffSelected('');
      setPositionSelected('');
    }
  };

  return (
    <Form onSubmit={submit}>
      <DropdownContainer>
        <Dropdown
          title="Select Staff Member"
          list={props.staffToShow}
          currentlySelectedKey={staffSelected}
          onSelected={setStaffSelected}
          disabled={props.staffToShow.length === 0}
        />
        <DivWithTopGap>
          <Dropdown
            title="Select Position"
            list={props.positionsToShow}
            currentlySelectedKey={positionSelected}
            onSelected={setPositionSelected}
            disabled={props.positionsToShow.length === 0}
          />
        </DivWithTopGap>
      </DropdownContainer>
      <PositiveButton type="submit">
        <AddButtonIcon
          icon={faPlus}
          title="Add Staff Member"
          aria-label="Add Staff Member"
        />
      </PositiveButton>
    </Form>
  );
}
