import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Dropdown, { DropdownItem } from '../../../../Components/Dropdown';

interface NewStaffAssignmentEntryPropTypes {
  onSave: (staffSelectedId: string, positionSelectedId: string) => any;
  staffToShow: DropdownItem[];
  positionsToShow: DropdownItem[];
}

/**
 * Input area for assigning a new staff member to an event
 */
export default function NewStaffAssignmentEntry(
  props: NewStaffAssignmentEntryPropTypes
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
    <form
      className="w-full bg-white p-2 flex justify-between items-center rounded-md"
      onSubmit={submit}
    >
      <div>
        <Dropdown
          title="Select Staff Member"
          list={props.staffToShow}
          currentlySelectedKey={staffSelected}
          onSelected={setStaffSelected}
        />
        <Dropdown
          className="mt-2"
          title="Select Position"
          list={props.positionsToShow}
          currentlySelectedKey={positionSelected}
          onSelected={setPositionSelected}
        />
      </div>
      <button
        type="submit"
        className="text-center focus:outline-none bg-positive hover:bg-positive-light focus:bg-positive-light rounded-md p-1 text-white w-10 h-10"
      >
        <FontAwesomeIcon icon={faPlus} className={`text-2xl align-middle`} />
      </button>
    </form>
  );
}
