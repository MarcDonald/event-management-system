import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import { NegativeButton } from '../../styles/GlobalStyles';

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

const RemoveButton = styled(NegativeButton)`
  text-align: center;
  border-radius: 0.375rem;
  padding: 0.25rem;
  width: 2.5rem;
  height: 2.5rem;

  :hover,
  :focus {
    transition: none;
    transform: none;
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
        <RemoveButtonIcon icon={faTrash} title="Remove" aria-label="Remove" />
      </RemoveButton>
    </Container>
  );
}
