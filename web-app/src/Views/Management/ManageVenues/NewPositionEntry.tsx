import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

interface NewPositionEntryPropTypes {
  onSave: (name: string) => any;
}

export default function NewPositionEntry(props: NewPositionEntryPropTypes) {
  let nameInput: HTMLInputElement;
  const [name, setName] = useState<string>('');

  const buttonClick = () => {
    if (name) {
      props.onSave(name);
      setName('');
      nameInput.focus();
    } else {
      console.error('No name');
    }
  };

  return (
    <div className="w-full bg-white p-2 flex justify-between items-center rounded-md">
      <input
        ref={(input: HTMLInputElement) => {
          if (input) nameInput = input;
        }}
        id="new-position-name"
        className="form-input w-3/4"
        placeholder="Name"
        onChange={(event) => setName(event.target.value)}
        value={name}
      />
      <button
        type="button"
        onClick={buttonClick}
        className="text-center focus:outline-none bg-positive hover:bg-positive-light focus:bg-positive-light rounded-md p-1 text-white w-10 h-10"
      >
        <FontAwesomeIcon icon={faCheck} className={`text-2xl align-middle`} />
      </button>
    </div>
  );
}
