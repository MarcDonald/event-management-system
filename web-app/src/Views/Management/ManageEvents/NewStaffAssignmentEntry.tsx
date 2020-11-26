import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import Dropdown from '../../../Components/Dropdown';

interface NewStaffAssignmentEntryPropTypes {
  onSave: (name: string) => any;
}

export default function NewStaffAssignmentEntry(
  props: NewStaffAssignmentEntryPropTypes
) {
  let nameInput: HTMLInputElement;
  const [name, setName] = useState<string>('');

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (name) {
      props.onSave(name);
      setName('');
      nameInput.focus();
    } else {
      console.error('No name');
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
          list={[]}
          onSelected={() => {
            // TODO
          }}
        />
        <Dropdown
          className="mt-2"
          title="Select Position"
          list={[]}
          onSelected={() => {
            // TODO
          }}
        />
      </div>
      <button
        type="submit"
        className="text-center focus:outline-none bg-positive hover:bg-positive-light focus:bg-positive-light rounded-md p-1 text-white w-10 h-10"
      >
        <FontAwesomeIcon icon={faCheck} className={`text-2xl align-middle`} />
      </button>
    </form>
  );
}
