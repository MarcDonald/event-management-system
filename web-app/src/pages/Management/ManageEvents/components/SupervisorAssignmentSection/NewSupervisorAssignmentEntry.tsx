import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Dropdown, {
  DropdownItem,
} from '../../../../../shared/components/Dropdown';
import { FormInput, PositiveButton } from '../../../../../styles/GlobalStyles';
import styled from 'styled-components';

interface NewSupervisorAssignmentEntryProps {
  onSave: (staffSelectedId: string, areaOfSupervision: string) => any;
  staffToShow: DropdownItem[];
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

const FormContainer = styled.div`
  width: 75%;
`;

const AreaOfSupervisionInput = styled(FormInput)`
  width: 100%;
  margin-top: 0.5rem;
`;

const AddButtonIcon = styled(FontAwesomeIcon)`
  font-size: 1.5rem;
  vertical-align: middle;
`;

/**
 * Input area for assigning a new supervisor member to an event
 */
export default function NewSupervisorAssignmentEntry(
  props: NewSupervisorAssignmentEntryProps
) {
  const [supervisorSelected, setSupervisorSelected] = useState<string>('');
  const [areaOfSupervision, setAreaOfSupervision] = useState<string>('');

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (supervisorSelected && areaOfSupervision) {
      props.onSave(supervisorSelected, areaOfSupervision);
      setSupervisorSelected('');
      setAreaOfSupervision('');
    }
  };

  return (
    <Form onSubmit={submit}>
      <FormContainer>
        <Dropdown
          title="Select Staff Member"
          list={props.staffToShow}
          currentlySelectedKey={supervisorSelected}
          onSelected={setSupervisorSelected}
        />
        <AreaOfSupervisionInput
          id="area-of-supervision"
          placeholder="Area of Supervision"
          onChange={(event) => setAreaOfSupervision(event.target.value)}
          value={areaOfSupervision}
        />
      </FormContainer>
      <PositiveButton type="submit">
        <AddButtonIcon
          icon={faPlus}
          title="Add Supervisor"
          aria-label="Add Supervisor"
        />
      </PositiveButton>
    </Form>
  );
}
