import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import DropdownItem from './DropdownItem';
import {
  Container,
  SelectedTitleDisplay,
  DropdownCaret,
  DropdownList,
  DropdownListItem,
  DropdownListItemText,
} from './DropdownStyles';

interface DropdownProps {
  title: string;
  list: DropdownItem[];
  currentlySelectedKey?: string;
  onSelected: (key: string, name?: string) => any;
  id?: string;
  disabled?: boolean;
}

/**
 * Dropdown that displays various options and returns the key of an option when one is selected
 */
export default function Dropdown(props: DropdownProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentlySelected, setCurrentlySelected] = useState<
    string | number | null
  >(null);

  useEffect(() => {
    if (props.currentlySelectedKey) {
      setCurrentlySelected(props.currentlySelectedKey);
    } else {
      setCurrentlySelected(null);
    }
  }, [props.currentlySelectedKey]);

  const selectItem = (keySelected: string) => {
    setIsOpen(false);
    setCurrentlySelected(keySelected);
    const selectedItem = props.list.find((item) => item.key === keySelected);
    props.onSelected(keySelected, selectedItem?.name);
  };

  const displayList = () => {
    return props.list.map((item, index) => {
      return (
        <DropdownListItem
          key={item.key}
          isFinal={index === props.list.length - 1}
          onClick={() => selectItem(item.key)}
        >
          <DropdownListItemText>{item.name}</DropdownListItemText>
        </DropdownListItem>
      );
    });
  };

  const getCurrentlySelectedName = () => {
    const listItemSelected = props.list.find(
      (listItem) => listItem.key === currentlySelected
    );
    if (listItemSelected) return listItemSelected.name;
    return currentlySelected;
  };

  return (
    <Container
      onMouseEnter={() => {
        if (!props.disabled) setIsOpen(true);
      }}
      onMouseLeave={() => {
        if (!props.disabled) setIsOpen(false);
      }}
      id={props.id}
      isDisabled={props.disabled}
    >
      <SelectedTitleDisplay isOpen={isOpen}>
        <span>
          {currentlySelected ? getCurrentlySelectedName() : props.title}
        </span>
        <DropdownCaret icon={isOpen ? faCaretUp : faCaretDown} />
      </SelectedTitleDisplay>
      {isOpen && <DropdownList>{displayList()}</DropdownList>}
    </Container>
  );
}
