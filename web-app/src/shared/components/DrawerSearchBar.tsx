import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';

interface DrawerSearchBarProps {
  search: (searchTerm: string) => any;
}

const Form = styled.form`
  width: 100%;
  text-align: center;
`;

const SearchLabel = styled.label`
  position: absolute;
`;

const SearchIcon = styled(FontAwesomeIcon)`
  margin: 0.25rem 0.5rem 0 0.5rem;
  color: ${(props) => props.theme.darkestGray};
  vertical-align: middle;
`;

const SearchInput = styled.input`
  background-color: ${(props) => props.theme.lighterGray};
  appearance: none;
  outline: none;
  padding: 0.25rem 2rem;
  border-radius: 0.375rem;
  width: 80%;

  ::placeholder {
    color: ${(props) => props.theme.darkerGray};
  }
`;

/**
 * Search bar for use in a side drawer
 */
export function DrawerSearchBar(props: DrawerSearchBarProps) {
  return (
    <Form
      // event.preventDefault() prevents the page from being reloaded if the user hits enter
      onSubmit={(event) => event.preventDefault()}
    >
      <SearchLabel htmlFor="staff-search">
        <SearchIcon icon={faSearch} title="Search" aria-hidden={true} />
      </SearchLabel>
      <SearchInput
        placeholder="Search"
        id="staff-search"
        type="search"
        onChange={(event) => props.search(event.target.value)}
      />
    </Form>
  );
}
