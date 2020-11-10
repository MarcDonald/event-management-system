import React, { useState } from 'react';
import { SideNavSearch } from '../../Components/SideNavSearch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

interface ListPanelPropTypes<T> {
  title: string;
  onSearch: (searchContent: string) => any;
  newButtonClick: () => any;
  newButtonText: string;
  displayedList: T;
}

export default function ListPanel<T, K>(props: ListPanelPropTypes<T>) {
  return (
    <div className="bg-white h-full flex flex-col items-center">
      <h2 className="side-nav-title">{props.title}</h2>
      <SideNavSearch search={props.onSearch} />
      <button className="btn w-4/5 mt-2" onClick={props.newButtonClick}>
        <FontAwesomeIcon icon={faPlus} className="mr-4" />
        <span>{props.newButtonText}</span>
      </button>
      <div className="w-4/5">{props.displayedList}</div>
    </div>
  );
}
