import React from 'react';
import { DrawerSearchBar } from '../../../shared/components/DrawerSearchBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../../styles/GlobalStyles';
import { SideNavTitle } from '../../../styles/GlobalStyles';
import styled from 'styled-components';

interface ItemListDrawerProps<T> {
  title: string;
  onSearch: (searchContent: string) => any;
  newButtonClick: () => any;
  newButtonText: string;
  displayedList: T;
}

const Container = styled.div`
  background-color: ${(props) => props.theme.surface};
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const NewButton = styled(Button)`
  width: 80%;
  margin-top: 0.5rem;
`;

const NewButtonIcon = styled(FontAwesomeIcon)`
  margin-right: 1rem;
`;

const List = styled.div`
  width: 80%;
`;

/**
 * Drawer that displays a searchable list of items
 */
export default function ItemListDrawer<T, K>(props: ItemListDrawerProps<T>) {
  return (
    <Container>
      <SideNavTitle>{props.title}</SideNavTitle>
      <DrawerSearchBar search={props.onSearch} />
      <NewButton onClick={props.newButtonClick}>
        <NewButtonIcon icon={faPlus} title="New" aria-label="New" />
        <span>{props.newButtonText}</span>
      </NewButton>
      <List>{props.displayedList}</List>
    </Container>
  );
}
