import React, { useEffect, useState } from 'react';
import ManagementEditHeader from '../ManagementEditHeader';
import ListPanel from '../ListPanel';
import Venue from '../../../Models/Venue';
import {
  createNewVenue,
  deleteVenue,
  getAllVenues,
  updateExistingVenue,
} from '../../../Services/VenueService';
import Loading from '../../../Components/Loading';
import VenueCard from './VenueCard';
import { useFormFields } from '../../../Hooks/useFormFields';
import Position from '../../../Models/Position';
import ErrorMessage from '../../../Components/ErrorMessage';

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
      console.log(venueList);
      setIsLoadingVenues(false);
      setAllVenues(venueList);
      setDisplayedVenues(venueList);
    };
    setup().then();
  }, []);

  const setupNewVenue = () => {
    setFieldsDirectly(emptyFormFields);
  };

  const selectVenueToEdit = (id: string) => {
    const venue = allVenues.find((venue) => venue.id === id);
    if (venue) {
      console.log(`Selected ${id}`);
      setFieldsDirectly({
        id: venue.id,
        name: venue.name,
        positions: venue.positions,
      });
    } else {
      console.log(`Setup new venue`);
      setupNewVenue();
    }
  };

  const displayVenueList = () => {
    if (isLoadingVenues) {
      return <Loading containerClassName="mt-4" />;
    } else {
      return displayedVenues.map((venue) => {
        return (
          <VenueCard
            key={venue.id}
            name={venue.name}
            onClick={() => selectVenueToEdit(venue.id)}
          />
        );
      });
    }
  };

  const formSave = async () => {
    if (validateForm()) {
      setIsSaving(true);
      try {
        if (!fields.id) {
          const newVenue = await createNewVenue({
            name: fields.name,
            positions: fields.positions,
          });
          allVenues.push(newVenue);
        } else {
          const updatedVenue = await updateExistingVenue({
            id: fields.id!!,
            name: fields.name,
            positions: fields.positions,
          });
          const indexOfVenue = allVenues.findIndex(
            (venue) => venue.id === fields.id
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
        (venue) => venue.id !== fields.id
      );
      setAllVenues(listWithoutDeletedVenue);
      setDisplayedVenues(listWithoutDeletedVenue);
    }
    setupNewVenue();
    setIsDeleting(false);
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

  const venueDetailsForm = () => {
    return (
      <form onSubmit={formSave} className="flex flex-col mt-4">
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
        <label htmlFor="positions" className="mt-2">
          Positions
        </label>
        <div>TODO</div>
        {error && <ErrorMessage message={error.message} />}
      </form>
    );
  };

  return (
    <div className="grid grid-cols-5 h-full">
      <div className="col-span-4 mx-16">
        {fields.name && (
          <ManagementEditHeader
            delete={formDelete}
            title={fields.name}
            save={formSave}
            isDeleting={isDeleting}
            isSaving={isSaving}
          />
        )}
        {!fields.name && (
          <ManagementEditHeader
            delete={formDelete}
            title="New Venue"
            save={formSave}
            isDeleting={isDeleting}
            isSaving={isSaving}
          />
        )}
        {venueDetailsForm()}
      </div>
      <ListPanel
        title="Venues"
        newButtonClick={setupNewVenue}
        newButtonText="New Venue"
        onSearch={venueSearch}
        displayedList={displayVenueList()}
      />
    </div>
  );
}
