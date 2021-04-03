import React, { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FormInput } from '../../../../styles/GlobalStyles';
import styled from 'styled-components';

interface NewPositionEntryProps {
  onSave: (name: string) => any;
}

const Form = styled.form`
  width: 100%;
  background-color: ${(props) => props.theme.surface};
  padding: 0.5rem;
  display: flex;
  justify-content: space-between;
  justify-items: center;
  border-radius: 0.375rem;
`;

const PositionNameInput = styled(FormInput)`
  width: 75%;
`;

const SubmitButton = styled.button`
  text-align: center;
  background-color: ${(props) => props.theme.positive};
  border-radius: 0.375rem;
  padding: 0.25rem;
  color: white;
  width: 2.5rem;
  height: 2.5rem;

  :hover {
    background-color: ${(props) => props.theme.positiveLight};
  }

  :focus {
    outline: none;
    background-color: ${(props) => props.theme.positiveLight};
  }
`;

const SubmitButtonIcon = styled(FontAwesomeIcon)`
  font-size: 1.5rem;
  vertical-align: middle;
`;

/**
 * Input area for creating a new position at a venue
 */
export default function NewPositionEntry(props: NewPositionEntryProps) {
  const nameInput = useRef<HTMLInputElement>(null);
  const [name, setName] = useState<string>('');

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (name) {
      props.onSave(name);
      setName('');
      nameInput.current?.focus();
    } else {
      console.error('No name');
    }
  };

  return (
    <Form onSubmit={submit}>
      <PositionNameInput
        ref={nameInput}
        id="new-position-name"
        placeholder="Name"
        onChange={(event) => setName(event.target.value)}
        value={name}
      />
      <SubmitButton type="submit">
        <SubmitButtonIcon
          icon={faPlus}
          title="Add Position"
          aria-label="Add Position"
        />
      </SubmitButton>
    </Form>
  );
}
