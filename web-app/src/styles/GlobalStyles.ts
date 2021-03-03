import styled, { createGlobalStyle } from 'styled-components';
import DatePicker from 'react-datepicker';

export const GlobalStyle = createGlobalStyle`
  * {
    font-family: 'Montserrat', sans-serif;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  ol,
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  *,
  ::before,
  ::after {
    border-width: 0;
    border-style: solid;
    border-color: theme('borderColor.default', currentColor);
  }
`;

export const GlobalThemedStyle = styled.div`
  html {
    background-color: ${(props) => props.theme.backgroundGray};
  }
`;

export const smoothTransitionProperties = `
  transition-property: background-color, border-color, color, fill, stroke,
    opacity, box-shadow, transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
`;

export const Button = styled.button`
  font-size: 1rem;
  cursor: pointer;
  background-color: ${(props) => props.theme.brand};
  border-radius: 0.375rem;
  color: ${(props) => props.theme.onBrand};
  font-weight: bold;
  padding: 0.5rem;
  outline: none;
  ${smoothTransitionProperties};

  :hover {
    background-color: ${(props) => props.theme.brandLight};
    transform: scale(1.02);
  }

  :focus {
    outline: none;
    transform: scale(1.02);
    background-color: ${(props) => props.theme.brandLight};
  }

  :disabled {
    background: darkgray;
    cursor: not-allowed;
    transition: none;
    transform: none;
  }
`;

export const NegativeButton = styled(Button)`
  background-color: ${(props) => props.theme.negative};

  :hover {
    background-color: ${(props) => props.theme.negativeLight};
  }

  :focus {
    background-color: ${(props) => props.theme.negativeLight};
  }
`;

export const PositiveButton = styled(Button)`
  background-color: ${(props) => props.theme.positive};

  :hover {
    background-color: ${(props) => props.theme.positiveLight};
  }

  :focus {
    background-color: ${(props) => props.theme.positiveLight};
  }
`;

export const SideNavTitle = styled.h1`
  text-align: center;
  font-weight: bold;
  font-size: 1.5rem;
  margin-top: 0.5rem;
`;

export const FormInput = styled.input`
  outline: none;
  border-width: 1px;
  border-color: ${(props) => props.theme.darkerGray};
  border-radius: 0.375rem;
  padding: 0.5rem;

  :focus {
    border-color: ${(props) => props.theme.brand};
  }

  :disabled {
    cursor: not-allowed;
  }
`;

export const DatePickerInput = styled(DatePicker)`
  outline: none;
  width: 100%;
  border-width: 1px;
  border-color: ${(props) => props.theme.darkerGray};
  border-radius: 0.375rem;
  padding: 0.5rem;

  :focus {
    border-color: ${(props) => props.theme.brand};
  }

  :disabled {
    cursor: not-allowed;
  }
`;

export const Card = styled.div.attrs((props: { isSelected: boolean }) => ({
  isSelected: props.isSelected,
}))`
  cursor: pointer;
  margin: 0.5rem 0;
  padding: 0.5rem;
  border-radius: 0.375rem;
  background-color: ${(props) => {
    return props.isSelected ? props.theme.darkerGray : props.theme.lighterGray;
  }};
  ${smoothTransitionProperties}

  :hover {
    background-color: ${(props) => {
      return props.isSelected
        ? props.theme.darkestGray
        : props.theme.darkerGray;
    }};
    transform: scale(1.02);
  }
`;
