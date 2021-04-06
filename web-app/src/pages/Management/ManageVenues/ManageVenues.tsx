import React, { useEffect, useReducer } from 'react';
import ManagementEditHeader from '../components/ManagementEditHeader';
import ItemListDrawer from '../components/ItemListDrawer';
import Venue from '../../../shared/models/Venue';
import Loading from '../../../shared/components/Loading';
import VenueCard from './components/VenueCard';
import NewPositionEntry from './components/NewPositionEntry';
import RemovableListItem from '../../../shared/components/RemovableListItem';
import ManageVenuesStateReducer, {
  manageVenuesDefaultState,
} from './state/ManageVenuesStateReducer';
import ManageVenuesStateActions from './state/ManageVenuesStateActions';
import { toast } from 'react-hot-toast';
import { FormInput } from '../../../styles/GlobalStyles';
import {
  Container,
  MainSection,
  FormContainer,
  FormGrid,
  Form,
  PositionSelectionSection,
  PositionsTitle,
  LoadingContainer,
} from './ManageVenuesStyles';
import useVenueApi from '../../../shared/hooks/api/useVenueApi';

/**
 * Venue management page
 */
export default function ManageVenues() {
  const api = useVenueApi();

  const [state, dispatch] = useReducer(
    ManageVenuesStateReducer,
    manageVenuesDefaultState
  );
  const {
    allVenues,
    displayedVenues,
    isLoadingVenues,
    positionsToDelete,
    positionsToAdd,
    name,
    id,
    positions,
  } = state;

  const venueSearch = (searchContent: string) => {
    if (searchContent) {
      dispatch({
        type: ManageVenuesStateActions.VenueSearch,
        parameters: {
          searchContent,
        },
      });
    } else {
      dispatch({ type: ManageVenuesStateActions.ResetVenueSearch });
    }
  };

  useEffect(() => {
    const cancelTokenSource = api.getCancelTokenSource();

    const setup = async () => {
      const venueList = await api.getAllVenues(cancelTokenSource.token);
      dispatch({
        type: ManageVenuesStateActions.VenuesLoaded,
        parameters: {
          venues: venueList,
        },
      });
    };

    setup()
      .then()
      .catch((err) => {
        if (err.message === 'Component unmounted') return;
        else console.error(err);
      });

    return () => cancelTokenSource.cancel('Component unmounted');
  }, []);

  const setupNewVenue = () => {
    dispatch({ type: ManageVenuesStateActions.SetupNewVenue });
  };

  const selectVenueToEdit = (id: string) => {
    const venue = allVenues.find((venue) => venue.venueId === id);
    if (venue) {
      dispatch({
        type: ManageVenuesStateActions.SelectVenueToEdit,
        parameters: {
          venue,
        },
      });
    } else {
      dispatch({ type: ManageVenuesStateActions.SetupNewVenue });
    }
  };

  const validateForm = (): boolean => {
    try {
      if (state.name.length < 1) {
        throw new Error('Name is too short');
      }
      if (state.positions.length < 1) {
        throw new Error('Cannot create a venue with no positions');
      }
    } catch (e) {
      toast.error(e.message);
      return false;
    }
    return true;
  };

  const updateVenue = async (): Promise<Venue> => {
    if (id) {
      await api.updateVenueInformation(id, {
        name: name,
      });
      await api.addVenuePositions(id, positionsToAdd);
      await api.deleteVenuePositions(id, positionsToDelete);
    }
    return {
      venueId: id!,
      name: name,
      positions: positions,
    };
  };

  const formSave = async (event: React.FormEvent<HTMLFormElement> | null) => {
    if (event) event.preventDefault();
    if (validateForm()) {
      dispatch({ type: ManageVenuesStateActions.SaveVenue });
      try {
        const newDetails = {
          name: name,
          positions: positions,
        };

        if (!id) {
          const newVenue = await toast.promise(api.createNewVenue(newDetails), {
            error: 'Error Adding Venue',
            loading: 'Adding New Venue',
            success: 'New Venue Added',
          });
          dispatch({
            type: ManageVenuesStateActions.VenueAdded,
            parameters: { newVenue },
          });
        } else {
          const updatedVenue = await toast.promise(updateVenue(), {
            error: 'Error Updating Venue',
            loading: 'Updating Venue',
            success: 'Venue Updated',
          });
          dispatch({
            type: ManageVenuesStateActions.VenueUpdated,
            parameters: {
              id: id,
              updatedVenue,
            },
          });
        }
      } catch (e) {
        dispatch({
          type: ManageVenuesStateActions.SaveError,
          parameters: { error: e },
        });
      }
    }
  };

  const formDelete = async () => {
    if (id) {
      dispatch({ type: ManageVenuesStateActions.DeleteVenue });
      try {
        await toast.promise(api.deleteVenue(id), {
          error: 'Error Deleting Venue',
          loading: 'Deleting Venue',
          success: 'Venue Deleted',
        });
        dispatch({
          type: ManageVenuesStateActions.SuccessfulVenueDeletion,
          parameters: {
            id: id,
          },
        });
      } catch (e) {
        dispatch({
          type: ManageVenuesStateActions.DeleteError,
          parameters: { error: e },
        });
      }
    } else {
      dispatch({ type: ManageVenuesStateActions.SetupNewVenue });
    }
  };

  const addNewPosition = (name: string) => {
    dispatch({
      type: ManageVenuesStateActions.AddNewPosition,
      parameters: { name },
    });
  };

  const deletePosition = (id: string) => {
    dispatch({
      type: ManageVenuesStateActions.DeletePosition,
      parameters: { id },
    });
  };

  const venueList = () => {
    if (isLoadingVenues) {
      return (
        <LoadingContainer>
          <Loading />
        </LoadingContainer>
      );
    } else {
      return displayedVenues.map((venue) => {
        return (
          <VenueCard
            key={venue.venueId}
            name={venue.name}
            isSelected={venue.venueId === id}
            onClick={() => selectVenueToEdit(venue.venueId)}
          />
        );
      });
    }
  };

  return (
    <Container>
      <MainSection>
        <ManagementEditHeader
          delete={formDelete}
          title={name ? name : 'New Venue'}
          save={() => formSave(null)}
          disableButtons={state.disableButtons}
        />
        <FormGrid>
          <FormContainer>
            <Form onSubmit={formSave}>
              <label htmlFor="name">Name</label>
              <FormInput
                id="name"
                inputMode="text"
                type="text"
                value={name}
                placeholder="Name"
                onChange={(event) =>
                  dispatch({
                    type: ManageVenuesStateActions.FieldChange,
                    parameters: {
                      fieldName: event.target.id,
                      fieldValue: event.target.value,
                    },
                  })
                }
              />
            </Form>
            <PositionSelectionSection>
              <PositionsTitle>Positions</PositionsTitle>
              {positions.map((position) => {
                return (
                  <RemovableListItem
                    key={position.positionId}
                    listKey={position.positionId}
                    content={position.name}
                    deleteAction={(key) => deletePosition(key)}
                  />
                );
              })}
              <NewPositionEntry onSave={addNewPosition} />
            </PositionSelectionSection>
          </FormContainer>
        </FormGrid>
      </MainSection>
      <ItemListDrawer
        title="Venues"
        newButtonClick={setupNewVenue}
        newButtonText="New Venue"
        onSearch={venueSearch}
        displayedList={venueList()}
      />
    </Container>
  );
}
