import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const Container = styled.div.attrs((props: { isDisabled: boolean }) => ({
  isDisabled: props.isDisabled,
}))`
  cursor: ${(props) => (props.isDisabled ? 'not-allowed' : 'pointer')};
  background-color: ${(props) =>
    props.isDisabled ? props.theme.lighterGray : props.theme.surface};
  width: 100%;
  border-radius: 0.375rem;
`;

export const SelectedTitleDisplay = styled.div.attrs(
  (props: {
    isOpen: boolean;
    backgroundColor: string;
    hoverColor: string;
    textColor: string;
  }) => ({
    isOpen: props.isOpen,
    backgroundColor: props.backgroundColor,
    hoverColor: props.hoverColor,
    textColor: props.textColor,
  })
)`
  outline: none;
  padding: 0.5rem;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-width: 1px;
  border-color: ${(props) =>
    props.isOpen ? props.theme.brand : props.theme.darkerGray};
  border-radius: 0.375rem 0.375rem
    ${(props) => (props.isOpen ? '0rem' : '0.375rem')}
    ${(props) => (props.isOpen ? '0rem' : '0.375rem')};
  background-color: ${(props) => props.backgroundColor};
  color: ${(props) => props.textColor};

  :hover {
    background-color: ${(props) => props.hoverColor};
  }
`;

export const DropdownCaret = styled(FontAwesomeIcon)`
  align-self: center;
  margin-right: 0.5rem;
  font-size: 1.25rem;
`;

export const DropdownList = styled.div`
  outline: none;
  border-width: 1px;
  border-color: ${(props) => props.theme.brand};
  border-top: 0;
  border-radius: 0 0 0.375rem 0.375rem;
`;

export const DropdownListItem = styled.div.attrs(
  (props: {
    isFinal: boolean;
    textColor: string;
    backgroundColor: string;
    backgroundHoverColor: string;
  }) => ({
    isFinal: props.isFinal,
    textColor: props.textColor,
    backgroundColor: props.backgroundColor,
    backgroundHoverColor: props.backgroundHoverColor,
  })
)`
  border-radius: 0 0 ${(props) => (props.isFinal ? '0.375rem 0.375rem' : '0 0')};
  border-color: ${(props) => props.backgroundColor};
  color: ${(props) => props.textColor};
  background-color: ${(props) => props.backgroundColor};

  :hover {
    background-color: ${(props) => props.backgroundHoverColor};
  }
`;

export const DropdownListItemText = styled.p`
  margin: 0 0.5rem;
  padding: 0.5rem 0;
`;
