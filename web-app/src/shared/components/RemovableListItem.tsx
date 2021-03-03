import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';

interface RemovableListItemProps {
  listKey: string;
  content: React.ReactNode;
  deleteAction: (key: string) => any;
}

const Container = styled.div`
  width: 100%;
  background-color: ${(props) => props.theme.surface};
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 0.375rem;
`;

const ContentContainer = styled.div`
  font-size: 1.5rem;
`;

const RemoveButton = styled.button`
  text-align: center;
  background-color: ${(props) => props.theme.negative};
  border-radius: 0.375rem;
  padding: 0.25rem;
  color: ${(props) => props.theme.onNegative};
  width: 2.5rem;
  height: 2.5rem;

  :hover {
    background-color: ${(props) => props.theme.negativeLight};
  }

  :focus {
    background-color: ${(props) => props.theme.negativeLight};
    outline: none;
  }
`;

const RemoveButtonIcon = styled(FontAwesomeIcon)`
  font-size: 1.5rem;
  vertical-align: middle;
`;

/**
 * Readonly display of data with a delete button
 */
export default function RemovableListItem(props: RemovableListItemProps) {
  return (
    <Container key={props.listKey}>
      <ContentContainer>{props.content}</ContentContainer>
      <RemoveButton
        type="button"
        onClick={() => {
          props.deleteAction(props.listKey);
        }}
      >
        <RemoveButtonIcon icon={faTrash} />
      </RemoveButton>
    </Container>
  );
}
