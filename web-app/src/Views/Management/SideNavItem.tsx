import React from 'react';

interface SideNavItemPropTypes {
  name: string;
  onClick: () => void;
  isSelected: boolean;
}

/**
 * Half-pill shaped box to display navigation options on a side navigation drawer
 */
export default function SideNavItem(props: SideNavItemPropTypes) {
  let selectedStyle = '';
  let hoverStyle = 'hover:bg-lighter-gray';

  if (props.isSelected) {
    selectedStyle = 'font-semibold bg-darker-gray';
    hoverStyle = '';
  }

  return (
    <li
      className={`cursor-pointer pl-8 text-xl py-2 w-4/5 rounded-r-full transition duration-150 ease-in-out ${selectedStyle} ${hoverStyle}`}
      onClick={props.onClick}
    >
      {props.name}
    </li>
  );
}
