import React from 'react';
import { NegativeButton, Button } from '../../../styles/GlobalStyles';
import styled from 'styled-components';

interface ManagementEditHeaderProps {
  title: string;
  delete: () => any;
  save: () => any;
  disableButtons: boolean;
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background-color: ${(props) => props.theme.surface};
  margin-top: 2rem;
  padding: 1rem;
  border-radius: 0.375rem;
`;

const DeleteButton = styled(NegativeButton)`
  padding-right: 2rem;
  padding-left: 2rem;
`;

const Title = styled.h1`
  font-weight: bold;
  font-size: 2.25rem;
`;

const SaveButton = styled(Button)`
  padding-right: 2rem;
  padding-left: 2rem;
`;

/**
 * Header with a save and delete button and a title that can change on the fly.
 * For use with editable management pages
 */
export default function ManagementEditHeader(props: ManagementEditHeaderProps) {
  return (
    <Container>
      <DeleteButton disabled={props.disableButtons} onClick={props.delete}>
        Delete
      </DeleteButton>
      <Title>{props.title}</Title>
      <SaveButton disabled={props.disableButtons} onClick={props.save}>
        Save
      </SaveButton>
    </Container>
  );
}
