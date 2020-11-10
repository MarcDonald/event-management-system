import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretDown,
  faCaretUp,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';

interface DropdownItem {
  key: string | number;
  name: string;
}

interface DropdownPropTypes {
  title: string;
  list: DropdownItem[];
  currentlySelectedKey?: string | number;
  onSelected: (key: string | number) => any;
  id?: string;
}

export default function Dropdown(props: DropdownPropTypes) {
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

  const selectItem = (keySelected: string | number) => {
    setIsOpen(false);
    setCurrentlySelected(keySelected);
    props.onSelected(keySelected);
  };

  const displayList = () => {
    return props.list.map((item, index) => {
      return (
        <div
          key={item.key}
          className={`cursor-pointer hover:bg-lighter-gray ${
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
    return currentlySelected;
  };

  return (
    <div
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      id={props.id}
    >
      <div
        className={`outline-none border border-gray-400 p-2 flex flex-row justify-between ${
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
