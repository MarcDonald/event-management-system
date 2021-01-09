import React, { useEffect, useReducer } from 'react';
import ManagementEditHeader from '../ManagementEditHeader';
import ItemListDrawer from '../ItemListDrawer';
import Venue from '../../../Models/Venue';
import {
  addVenuePositions,
  createNewVenue,
  deleteVenue,
  deleteVenuePositions,
  getAllVenues,
  updateVenueInformation,
} from '../../../Services/VenueService';
import Loading from '../../../Components/Loading';
import VenueCard from './VenueCard';
import NewPositionEntry from './NewPositionEntry';
import RemovableListItem from '../../../Components/RemovableListItem';
import ManageVenuesStateReducer, {
  manageVenuesDefaultState,
} from './State/ManageVenuesStateReducer';
import ManageVenuesStateActions from './State/ManageVenuesStateActions';
import { toast } from 'react-hot-toast';

/**
 * Venue management page
 */
export default function ManageVenues() {
  const [state, dispatch] = useReducer(
    ManageVenuesStateReducer,
    manageVenuesDefaultState
  );
  const {
    allVenues,
    displayedVenues,
    error,
    isSaving,
    isDeleting,
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
    const setup = async () => {
      const venueList = await getAllVenues();
      dispatch({
        type: ManageVenuesStateActions.VenuesLoaded,
        parameters: {
          venues: venueList,
        },
      });
    };
    setup().then();
  }, []);

  useEffect(() => {
    if (state.error) toast.error(state.error.message);
  }, [state.error]);

  useEffect(() => {
    if (state.success) toast.success(state.success.message);
  }, [state.success]);

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
    if (state.name.length < 1) {
      dispatch({
        type: ManageVenuesStateActions.FormInvalid,
        parameters: { error: new Error('Name is too short') },
      });
      return false;
    }
    if (state.positions.length < 1) {
      dispatch({
        type: ManageVenuesStateActions.FormInvalid,
        parameters: {
          error: new Error('Cannot create a venue with no positions'),
        },
      });
      return false;
    }
    return true;
  };

  const updateVenue = async (): Promise<Venue> => {
    if (id) {
      await updateVenueInformation(id, {
        name: name,
      });
      await addVenuePositions(id, positionsToAdd);
      await deleteVenuePositions(id, positionsToDelete);
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
          const newVenue = await createNewVenue(newDetails);
          dispatch({
            type: ManageVenuesStateActions.VenueAdded,
            parameters: { newVenue },
          });
        } else {
          const updatedVenue = await updateVenue();
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
    dispatch({ type: ManageVenuesStateActions.DeleteVenue });
    if (id) {
      try {
        await deleteVenue(id);
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

  const header = () => {
    return (
      <>
        {name && (
          <ManagementEditHeader
            delete={formDelete}
            title={name}
            save={() => formSave(null)}
            isDeleting={isDeleting}
            isSaving={isSaving}
          />
        )}
        {!name && (
          <ManagementEditHeader
            delete={formDelete}
            title="New Venue"
            save={() => formSave(null)}
            isDeleting={isDeleting}
            isSaving={isSaving}
          />
        )}
      </>
    );
  };

  const venueList = () => {
    if (isLoadingVenues) {
      return <Loading containerClassName="mt-4" />;
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

  const venueDetailsForm = () => {
    return (
      <form onSubmit={formSave} className="flex flex-col">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          inputMode="text"
          type="text"
          value={name}
          className="form-input"
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
      </form>
    );
  };

  const positionsSection = () => {
    return (
      <section className="my-2">
        <h3 className="my-2 text-center font-bold text-2xl">Positions</h3>
        {positionsList()}
        <NewPositionEntry onSave={addNewPosition} />
      </section>
    );
  };

  const positionsList = () => {
    return positions.map((position) => {
      return (
        <RemovableListItem
          key={position.positionId}
          listKey={position.positionId}
          content={position.name}
          deleteAction={(key) => deletePosition(key)}
        />
      );
    });
  };

  return (
    <div className="grid grid-cols-5 h-full">
      <div className="col-span-4 mx-16">
        {header()}
        <div className="grid grid-cols-4">
          <div className="col-start-2 col-span-2 mt-4 text-center">
            {venueDetailsForm()}
            {positionsSection()}
          </div>
        </div>
      </div>
      <ItemListDrawer
        title="Venues"
        newButtonClick={setupNewVenue}
        newButtonText="New Venue"
        onSearch={venueSearch}
        displayedList={venueList()}
      />
    </div>
  );
}
