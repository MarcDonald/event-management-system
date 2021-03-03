import styled from 'styled-components';
import BrandHeader from '../../shared/components/BrandHeader';
import { Button } from '../../styles/GlobalStyles';

export const Container = styled.div`
  height: 100vh;
  min-height: 100vh;
  background-color: ${(props) => props.theme.backgroundGray};
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: 100%;
`;

export const Header = styled(BrandHeader)`
  grid-row-start: 1;
  height: auto;
`;

export const Content = styled.div`
  grid-row-start: 2;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
`;

export const UserDetailsRow = styled.div`
  grid-column-start: 1;
  display: grid;
`;

export const UserDetailsWrapper = styled.div`
  align-self: flex-end;
`;

export const ActionsContainer = styled.div`
  grid-column-start: 2;
  grid-column: span 4 / span 4;
  margin: 0 8rem;
`;

export const StewardAccessWarning = styled.h1`
  text-align: center;
  margin-top: 4rem;
  font-size: 1.5rem;
  font-weight: bold;
`;

export const UpcomingEventsSection = styled.section`
  display: flex;
  flex-direction: column;
`;

export const ManagementSection = styled.section`
  display: flex;
  flex-direction: column;
`;

export const ManagementTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  margin-top: 1rem;
`;

export const ManagementButton = styled(Button)`
  width: 50%;
  align-self: center;
  margin: 0.5rem;
`;
