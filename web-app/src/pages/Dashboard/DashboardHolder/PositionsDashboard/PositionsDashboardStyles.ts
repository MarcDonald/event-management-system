import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { size } from '../../../../styles/Breakpoints';

export const ListHeaders = styled.div`
  margin: 0 8rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  text-align: center;
  padding: 0.5rem 0;
  align-items: center;
  font-weight: bold;
  font-size: 1.5rem;
`;

export const PositionsList = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 66vh;

  @media (min-width: ${size.largeDesktop}) {
    max-height: 72vh;
  }
`;
