import styled from 'styled-components';
import BrandHeader from '../../shared/components/BrandHeader';
import { smoothTransitionProperties } from '../../styles/GlobalStyles';

export const Container = styled.div`
  min-height: 100vh;
  background-color: ${(props) => props.theme.backgroundGray};
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: 100%;
`;

export const Header = styled(BrandHeader)`
  height: auto;
  grid-row-start: 1;
`;

export const Content = styled.div`
  display: grid;
  grid-row-start: 2;
  grid-template-columns: repeat(6, minmax(0, 1fr));
`;

export const NavColumn = styled.div`
  grid-column-start: 1;
  display: grid;
  background-color: ${(props) => props.theme.surface};
`;

export const Navigation = styled.nav`
  margin-top: 2rem;
`;

export const UserDetailsSection = styled.section`
  align-self: end;
`;

export const PageContainer = styled.div`
  grid-column-start: 2;
  grid-column: span 5 / span 5;
`;

export const SideNavItem = styled.li.attrs(
  (props: { isSelected: boolean }) => ({
    isSelected: props.isSelected,
  })
)`
  cursor: pointer;
  padding: 0.5rem 0 0.5rem 2rem;
  font-size: 1.25rem;
  width: 80%;
  border-top-right-radius: 9999px;
  border-bottom-right-radius: 9999px;
  background-color: ${(props) =>
    props.isSelected ? props.theme.darkerGray : 'transparent'};
  font-weight: ${(props) => (props.isSelected ? '600' : 'normal')};
  ${smoothTransitionProperties};

  :hover {
    background-color: ${(props) =>
      props.isSelected ? '' : props.theme.lighterGray};
  }
`;
