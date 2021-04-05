import styled from 'styled-components';
import { Card } from '../../../styles/GlobalStyles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const Container = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: 1fr 1fr;
  margin: 0.5rem;
`;

export const HomeButtonContainer = styled.div`
  grid-column-start: 1;
  grid-column: span 1 / span 1;
  grid-row-start: 2;
`;

export const HomeCard = styled(Card)`
  text-align: center;
  vertical-align: middle;
  font-size: 1.5rem;
  padding: 0.75rem;
  margin-right: 0.5rem;
`;

export const HomeIcon = styled(FontAwesomeIcon)`
  height: 100%;
`;

export const ActionContainer = styled.div.attrs(
  (props: { showHomeButton: boolean }) => ({
    showHomeButton: props.showHomeButton,
  })
)`
  outline: none;
  box-sizing: border-box;
  position: relative;
  width: 100%;
  grid-row-start: 1;
  grid-column-start: ${(props) => (props.showHomeButton ? '2' : '1')};
  grid-column: span 2 / span 2;
  height: 100%;
`;

export const ActionCard = styled(Card)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  font-size: 1.25rem;
  height: 80%;
`;

export const LoggedInUserContainer = styled.div.attrs(
  (props: { showHomeButton: boolean }) => ({
    showHomeButton: props.showHomeButton,
  })
)`
  grid-column-start: ${(props) => {
    return props.showHomeButton ? '2' : '1';
  }};
  grid-column: ${(props) => {
    return props.showHomeButton ? 'span 1 / span 1' : 'span 2 / span 2';
  }};
  grid-row-start: 2;
`;

export const LoginDetailsCard = styled(Card)`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding: 0.5rem;
  cursor: default;

  :hover,
  :focus {
    transition: none;
    transform: none;
  }
`;

export const LoggedInUserDetails = styled.span`
  display: flex;
  flex-direction: column;
  text-align: right;
`;

export const Username = styled.span`
  font-weight: 600;
`;

export const Role = styled.span`
  font-size: 0.875rem;
`;
