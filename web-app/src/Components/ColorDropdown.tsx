import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';

export interface ColorDropdownItem {
  key: string;
  name: string;
  textColorClass: string;
  backgroundColorClass: string;
  backgroundColorHoverClass: string;
}

interface ColorDropdownPropTypes {
  title: string;
  list: ColorDropdownItem[];
  currentlySelectedKey?: string;
  onSelected: (key: string, name?: string) => any;
  id?: string;
  className?: string | null;
  disabled?: boolean;
}

/**
 * Dropdown that highlights each option in a given color
 */
export default function ColorDropdown(props: ColorDropdownPropTypes) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentlySelected, setCurrentlySelected] = useState<
    string | number | null
  >(null);

  let additionalClassName = props.className ? props.className : '';

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
        <div
          key={item.key}
          className={`${item.textColorClass} hover:${
            item.backgroundColorHoverClass
          } ${item.backgroundColorClass} ${
            index === props.list.length - 1 ? 'rounded-md rounded-t-none' : ''
          }`}
          onClick={() => selectItem(item.key)}
        >
          <p className="mx-2 py-2">{item.name}</p>
        </div>
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
    if (listItemSelected) return listItemSelected.backgroundColorClass;
    return '';
  };

  const getCurrentlySelectedHoverColor = () => {
    const listItemSelected = props.list.find(
      (listItem) => listItem.key === currentlySelected
    );
    if (listItemSelected) return listItemSelected.backgroundColorHoverClass;
    return '';
  };

  const getCurrentlySelectedTextColor = () => {
    const listItemSelected = props.list.find(
      (listItem) => listItem.key === currentlySelected
    );
    if (listItemSelected) return listItemSelected.textColorClass;
    return '';
  };

  return (
    <div
      onMouseEnter={() => {
        if (!props.disabled) setIsOpen(true);
      }}
      onMouseLeave={() => {
        if (!props.disabled) setIsOpen(false);
      }}
      id={props.id}
      className={`${additionalClassName} ${
        props.disabled
          ? 'cursor-not-allowed bg-lighter-gray'
          : 'cursor-pointer bg-white'
      } `}
    >
      <div
        className={`${getCurrentlySelectedColor()} hover:${getCurrentlySelectedHoverColor()} ${getCurrentlySelectedTextColor()} outline-none border border-gray-400 p-2 flex flex-row justify-between ${
          isOpen ? 'rounded-md rounded-b-none border-brand' : 'rounded-md'
        }`}
      >
        <h1>{currentlySelected ? getCurrentlySelectedName() : props.title}</h1>
        <FontAwesomeIcon
          icon={isOpen ? faCaretUp : faCaretDown}
          className="self-center mr-2 text-xl"
        />
      </div>
      {isOpen && (
        <div className="outline-none border border-brand rounded-md border-t-0 rounded-md rounded-t-none">
          {displayList()}
        </div>
      )}
    </div>
  );
}