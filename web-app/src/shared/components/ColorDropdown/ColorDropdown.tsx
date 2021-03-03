import React, { useEffect, useState } from 'react';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import ColorDropdownItem from './ColorDropdownItem';
import {
  Container,
  SelectedTitleDisplay,
  DropdownListItem,
  DropdownCaret,
  DropdownList,
  DropdownListItemText,
} from './ColorDropdownStyles';

interface ColorDropdownProps {
  title: string;
  list: ColorDropdownItem[];
  currentlySelectedKey?: string;
  onSelected: (key: string, name?: string) => any;
  id?: string;
  disabled?: boolean;
}

/**
 * Dropdown that highlights each option in a given color
 */
export default function ColorDropdown(props: ColorDropdownProps) {
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
          textColor={item.textColor}
          backgroundColor={item.backgroundColor}
          backgroundHoverColor={item.backgroundHoverColor}
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
    return '';
  };

  const getCurrentlySelectedColor = () => {
    const listItemSelected = props.list.find(
      (listItem) => listItem.key === currentlySelected
    );
    if (listItemSelected) return listItemSelected.backgroundColor;
    return '';
  };

  const getCurrentlySelectedHoverColor = () => {
    const listItemSelected = props.list.find(
      (listItem) => listItem.key === currentlySelected
    );
    if (listItemSelected) return listItemSelected.backgroundHoverColor;
    return '';
  };

  const getCurrentlySelectedTextColor = () => {
    const listItemSelected = props.list.find(
      (listItem) => listItem.key === currentlySelected
    );
    if (listItemSelected) return listItemSelected.textColor;
    return '';
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
      <SelectedTitleDisplay
        isOpen={isOpen}
        backgroundColor={getCurrentlySelectedColor()}
        hoverColor={getCurrentlySelectedHoverColor()}
        textColor={getCurrentlySelectedTextColor()}
      >
        <span>
          {currentlySelected ? getCurrentlySelectedName() : props.title}
        </span>
        <DropdownCaret icon={isOpen ? faCaretUp : faCaretDown} />
      </SelectedTitleDisplay>
      {isOpen && <DropdownList>{displayList()}</DropdownList>}
    </Container>
  );
}
