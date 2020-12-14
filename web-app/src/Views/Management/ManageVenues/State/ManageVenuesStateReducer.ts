import StateAction from '../../../../Utils/StateAction';
import Venue from '../../../../Models/Venue';
import Position from '../../../../Models/Position';
import { NewPosition } from '../../../../Services/VenueService';
import ManageVenuesStateActions from './ManageVenuesStateActions';

interface ManageVenuesState {
  allVenues: Venue[];
  displayedVenues: Venue[];
  id: string | null;
  name: string;
  positions: Position[];
  error: Error | null;
  isSaving: boolean;
  isDeleting: boolean;
  isLoadingVenues: boolean;
  positionsToDelete: string[];
  positionsToAdd: NewPosition[];
}

export const manageVenuesDefaultState: ManageVenuesState = {
  allVenues: [],
  displayedVenues: [],
  isLoadingVenues: true,
  id: null,
  name: '',
  positions: [],
  error: null,
  isSaving: false,
  isDeleting: false,
  positionsToDelete: [],
  positionsToAdd: [],
};

export default function ManageVenuesStateReducer(
  state: ManageVenuesState,
  action: StateAction<ManageVenuesStateActions>
): ManageVenuesState {
  const { type, parameters } = action;
  switch (type) {
    case ManageVenuesStateActions.VenueSearch: {
      const searchContent = parameters?.searchContent.toLowerCase();
      const searchResults = state.displayedVenues.filter((venue) => {
        if (venue.name.toLowerCase().includes(searchContent)) {
          return venue;
        }
      });
      return {
        ...state,
        displayedVenues: searchResults,
      };
    }
    case ManageVenuesStateActions.ResetVenueSearch: {
      return {
        ...state,
        displayedVenues: state.allVenues,
      };
    }
    case ManageVenuesStateActions.VenuesLoaded: {
      return {
        ...state,
        allVenues: parameters?.venues,
        displayedVenues: parameters?.venues,
        isLoadingVenues: false,
      };
    }
    case ManageVenuesStateActions.SetupNewVenue: {
      return {
        ...manageVenuesDefaultState,
        allVenues: state.allVenues,
        displayedVenues: state.displayedVenues,
        isLoadingVenues: false,
      };
    }
    case ManageVenuesStateActions.SelectVenueToEdit: {
      return {
        ...state,
        id: parameters?.venue.venueId,
        name: parameters?.venue.name,
        positions: parameters?.venue.positions,
        positionsToAdd: [],
        positionsToDelete: [],
      };
    }
    case ManageVenuesStateActions.SaveVenue: {
      return {
        ...state,
        isSaving: true,
      };
    }
    case ManageVenuesStateActions.FormInvalid: {
      return {
        ...state,
        error: parameters?.error,
      };
    }
    case ManageVenuesStateActions.VenueAdded: {
      const allVenuesWithNewVenue = [...state.allVenues, parameters?.newVenue];
      return {
        ...manageVenuesDefaultState,
        allVenues: allVenuesWithNewVenue,
        displayedVenues: allVenuesWithNewVenue,
        isSaving: false,
        isLoadingVenues: false,
      };
    }
    case ManageVenuesStateActions.VenueUpdated: {
      const indexOfVenue = state.allVenues.findIndex(
        (venue) => venue.venueId === parameters?.id
      );
      // Updates venue details in the list
      const venues = [...state.allVenues];
      venues[indexOfVenue] = {
        ...venues[indexOfVenue],
        ...parameters?.updatedVenue,
      };
      return {
        ...manageVenuesDefaultState,
        allVenues: venues,
        displayedVenues: venues,
        isLoadingVenues: false,
        isSaving: false,
      };
    }
    case ManageVenuesStateActions.SaveError: {
      console.error(JSON.stringify(parameters?.error, null, 2));
      return {
        ...state,
        error: parameters?.error,
        isSaving: false,
      };
    }
    case ManageVenuesStateActions.DeleteVenue: {
      return {
        ...state,
        isDeleting: true,
      };
    }
    case ManageVenuesStateActions.SuccessfulVenueDeletion: {
      const listWithoutDeletedVenue = state.allVenues.filter(
        (venue) => venue.venueId !== parameters?.id
      );
      return {
        ...manageVenuesDefaultState,
        allVenues: listWithoutDeletedVenue,
        displayedVenues: listWithoutDeletedVenue,
        isDeleting: false,
        isLoadingVenues: false,
      };
    }
    case ManageVenuesStateActions.DeleteError: {
      return {
        ...state,
        error: parameters?.error,
      };
    }
    case ManageVenuesStateActions.AddNewPosition: {
      const newPositions = [...state.positions];
      newPositions.push({
        positionId: parameters?.name,
        name: parameters?.name,
      });

      return {
        ...state,
        positions: newPositions,
        positionsToAdd: [...state.positionsToAdd, { name: parameters?.name }],
        error: null,
      };
    }
    case ManageVenuesStateActions.DeletePosition: {
      const newPositions = state.positions.filter(
        (position) => parameters?.id !== position.positionId
      );

      return {
        ...state,
        positions: newPositions,
        positionsToDelete: [...state.positionsToDelete, parameters?.id],
      };
    }
    case ManageVenuesStateActions.FieldChange: {
      return {
        ...state,
        [parameters?.fieldName]: parameters?.fieldValue,
        error: null,
      };
    }
    default:
      break;
  }
  return state;
}
