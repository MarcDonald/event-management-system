import React, { useState } from 'react';
import { DrawerSearchBar } from '../../Components/DrawerSearchBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

interface ItemListDrawerPropTypes<T> {
  title: string;
  onSearch: (searchContent: string) => any;
  newButtonClick: () => any;
  newButtonText: string;
  displayedList: T;
}

/**
 * Drawer that displays a searchable list of items
 */
export default function ItemListDrawer<T, K>(
  props: ItemListDrawerPropTypes<T>
) {
  return (
    <div className="bg-white h-full flex flex-col items-center">
      <h2 className="side-nav-title">{props.title}</h2>
      <DrawerSearchBar search={props.onSearch} />
      <button className="btn w-4/5 mt-2" onClick={props.newButtonClick}>
        <FontAwesomeIcon icon={faPlus} className="mr-4" />
        <span>{props.newButtonText}</span>
      </button>
      <div className="w-4/5">{props.displayedList}</div>
    </div>
  );
}
