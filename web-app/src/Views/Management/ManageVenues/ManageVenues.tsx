import React, { useEffect, useState } from 'react';
import ManagementEditHeader from '../ManagementEditHeader';
import ListPanel from '../ListPanel';
import Venue from '../../../Models/Venue';
import {
  addVenuePositions,
  createNewVenue,
  deleteVenue,
  deleteVenuePositions,
  getAllVenues,
  NewPosition,
  updateVenueMetadata,
} from '../../../Services/VenueService';
import Loading from '../../../Components/Loading';
import VenueCard from './VenueCard';
import { useFormFields } from '../../../Hooks/useFormFields';
import Position from '../../../Models/Position';
import ErrorMessage from '../../../Components/ErrorMessage';
import NewPositionEntry from './NewPositionEntry';
import RemovableListItem from '../../../Components/RemovableListItem';

interface ManageVenueFormFields {
  id: string | null;
  name: string;
  positions: Position[];
}

const emptyFormFields = {
  id: null,
  name: '',
  positions: [],
};

export default function ManageVenues() {
  const [allVenues, setAllVenues] = useState<Venue[]>([]);
  const [displayedVenues, setDisplayedVenues] = useState<Venue[]>([]);
  const [fields, setFields, setFieldsDirectly] = useFormFields<
    ManageVenueFormFields
  >(emptyFormFields);
  const [error, setError] = useState<Error | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isLoadingVenues, setIsLoadingVenues] = useState<boolean>(true);
  const [positionsToDelete, setPositionsToDelete] = useState<Array<string>>([]);
  const [positionsToAdd, setPositionsToAdd] = useState<Array<NewPosition>>([]);

  const venueSearch = (searchContent: string) => {
    if (searchContent) {
      searchContent = searchContent.toLowerCase();
      setDisplayedVenues(
        displayedVenues.filter((venue) => {
          if (venue.name.toLowerCase().includes(searchContent)) {
            return venue;
          }
        })
      );
    } else {
      setDisplayedVenues(allVenues);
    }
  };

  useEffect(() => {
    const setup = async () => {
      const venueList = await getAllVenues();
      setIsLoadingVenues(false);
      setAllVenues(venueList);
      setDisplayedVenues(venueList);
    };
    setup().then();
  }, []);

  const setupNewVenue = () => {
    setFieldsDirectly(emptyFormFields);
    setPositionsToAdd([]);
    setPositionsToDelete([]);
  };

  const selectVenueToEdit = (id: string) => {
    const venue = allVenues.find((venue) => venue.venueId === id);
    if (venue) {
      setFieldsDirectly({
        id: venue.venueId,
        name: venue.name,
        positions: venue.positions,
      });
      setPositionsToAdd([]);
      setPositionsToDelete([]);
    } else {
      console.log(`Setup new venue`);
      setupNewVenue();
    }
  };

  const validateForm = (): boolean => {
    if (fields.name.length < 1) {
      setError(new Error('Name is too short'));
      return false;
    }
    if (fields.positions.length < 1) {
      setError(new Error('Cannot create a venue with no positions'));
      return false;
    }
    return true;
  };

  const updateVenue = async (): Promise<Venue> => {
    if (fields.id) {
      await updateVenueMetadata(fields.id, {
        name: fields.name,
      });
      await addVenuePositions(fields.id, positionsToAdd);
      await deleteVenuePositions(fields.id, positionsToDelete);
    }
    return {
      venueId: fields.id!!,
      name: fields.name,
      positions: fields.positions,
    };
  };

  const formSave = async (event: React.FormEvent<HTMLFormElement> | null) => {
    if (event) event.preventDefault();
    if (validateForm()) {
      setIsSaving(true);
      try {
        const newDetails = {
          name: fields.name,
          positions: fields.positions,
        };

        if (!fields.id) {
          const newVenue = await createNewVenue(newDetails);
          allVenues.push(newVenue);
        } else {
          const updatedVenue = await updateVenue();
          const indexOfVenue = allVenues.findIndex(
            (venue) => venue.venueId === fields.id
          );
          allVenues[indexOfVenue] = {
            ...allVenues[indexOfVenue],
            ...updatedVenue,
          };
        }
        setupNewVenue();
      } catch (e) {
        console.error(JSON.stringify(e, null, 2));
        setError(e);
      }
      setIsSaving(false);
    }
  };

  const formDelete = async () => {
    setIsDeleting(true);
    if (fields.id) {
      await deleteVenue(fields.id);
      const listWithoutDeletedVenue = allVenues.filter(
        (venue) => venue.venueId !== fields.id
      );
      setAllVenues(listWithoutDeletedVenue);
      setDisplayedVenues(listWithoutDeletedVenue);
    }
    setupNewVenue();
    setIsDeleting(false);
  };

  const addNewPosition = (name: string) => {
    const newPositions = [...fields.positions];
    newPositions.push({
      positionId: name,
      name,
    });
    setFieldsDirectly({
      ...fields,
      positions: newPositions,
    });
    setPositionsToAdd([...positionsToAdd, { name }]);
    setError(null);
  };

  const deletePosition = (id: string) => {
    const newPositions = fields.positions.filter(
      (position) => id !== position.positionId
    );
    setFieldsDirectly({
      ...fields,
      positions: newPositions,
    });
    setPositionsToDelete([...positionsToDelete, id]);
  };

  const header = () => {
    return (
      <>
        {fields.name && (
          <ManagementEditHeader
            delete={formDelete}
            title={fields.name}
            save={() => formSave(null)}
            isDeleting={isDeleting}
            isSaving={isSaving}
          />
        )}
        {!fields.name && (
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
            isSelected={venue.venueId === fields.id}
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
          value={fields.name}
          className="form-input"
          placeholder="Name"
          onChange={(event) => {
            setFields(event);
            setError(null);
          }}
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
    return fields.positions.map((position) => {
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
            {error && <ErrorMessage message={error.message} />}
          </div>
        </div>
      </div>
      <ListPanel
        title="Venues"
        newButtonClick={setupNewVenue}
        newButtonText="New Venue"
        onSearch={venueSearch}
        displayedList={venueList()}
      />
    </div>
  );
}
