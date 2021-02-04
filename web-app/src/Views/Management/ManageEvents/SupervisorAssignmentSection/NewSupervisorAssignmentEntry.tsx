import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPlus } from '@fortawesome/free-solid-svg-icons';
import Dropdown, { DropdownItem } from '../../../../Components/Dropdown';

interface NewSupervisorAssignmentEntryPropTypes {
  onSave: (staffSelectedId: string, areaOfSupervision: string) => any;
  staffToShow: DropdownItem[];
}

/**
 * Input area for assigning a new supervisor member to an event
 */
export default function NewSupervisorAssignmentEntry(
  props: NewSupervisorAssignmentEntryPropTypes
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
    <form
      className="w-full bg-white p-2 flex justify-between items-center rounded-md"
      onSubmit={submit}
    >
      <div>
        <Dropdown
          title="Select Staff Member"
          list={props.staffToShow}
          currentlySelectedKey={supervisorSelected}
          onSelected={setSupervisorSelected}
        />
        <input
          id="area-of-supervision"
          className="form-input mt-2"
          placeholder="Area of Supervision"
          onChange={(event) => setAreaOfSupervision(event.target.value)}
          value={areaOfSupervision}
        />
      </div>
      <button
        type="submit"
        className="text-center disabled:cursor-not-allowed focus:outline-none bg-positive hover:bg-positive-light focus:bg-positive-light rounded-md p-1 text-white w-10 h-10"
      >
        <FontAwesomeIcon icon={faPlus} className={`text-2xl align-middle`} />
      </button>
    </form>
  );
}
