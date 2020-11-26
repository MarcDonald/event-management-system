import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

interface SideNavSearchPropTypes {
  search: (searchTerm: string) => any;
}

export function SideNavSearch(props: SideNavSearchPropTypes) {
  return (
    <form
      className="w-full text-center"
      onSubmit={(event) => event.preventDefault()}
    >
      <label htmlFor="staff-search" className="absolute">
        <FontAwesomeIcon
          icon={faSearch}
          className="mx-2 text-gray-700 align-middle mt-1"
        />
      </label>
      <input
        placeholder="Search"
        id="staff-search"
        type="search"
        onChange={(event) => props.search(event.target.value)}
        className="placeholder-gray-600 bg-lighter-gray appearance-none outline-none px-8 py-1 rounded-md w-4/5"
      />
    </form>
  );
}
