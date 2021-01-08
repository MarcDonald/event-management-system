import ManageEventsStateActions from './ManageEventsStateActions';
import StateAction from '../../../../Utils/StateAction';
import Venue from '../../../../Models/Venue';
import AssignedSupervisor from '../../../../Models/AssignedSupervisor';
import AssignedStaffMember from '../../../../Models/AssignedStaffMember';
import { DropdownItem } from '../../../../Components/Dropdown';
import StaffMember from '../../../../Models/StaffMember';
import Position from '../../../../Models/Position';
import Event from '../../../../Models/Event';
import { toast } from 'react-hot-toast';

interface ManageEventsState {
  id: string | null;
  name: string;
  venue: Venue | null;
  start: Date;
  end: Date;
  supervisors: AssignedSupervisor[];
  staff: AssignedStaffMember[];
  allEvents: Event[];
  displayedEvents: Event[];
  error: Error | null;
  success: string | null;
  isSaving: boolean;
  isDeleting: boolean;
  isLoadingEvents: boolean;
  dropdownVenues: DropdownItem[];
  allStaff: StaffMember[];
  selectableStaff: StaffMember[];
  selectablePositions: Position[];
  allVenues: Venue[];
}

export const manageEventsDefaultState: ManageEventsState = {
  id: null,
  name: '',
  venue: null,
  start: new Date(),
  end: new Date(),
  supervisors: [],
  staff: [],
  allEvents: [],
  displayedEvents: [],
  allStaff: [],
  allVenues: [],
  dropdownVenues: [],
  error: null,
  success: null,
  isDeleting: false,
  isLoadingEvents: false,
  isSaving: false,
  selectablePositions: [],
  selectableStaff: [],
};

export default function ManageEventsStateReducer(
  state: ManageEventsState,
  action: StateAction<ManageEventsStateActions>
): ManageEventsState {
  const { type, parameters } = action;
  switch (type) {
    case ManageEventsStateActions.DataLoaded: {
      if (
        parameters?.eventsList &&
        parameters?.venuesList &&
        parameters?.staffList
      ) {
        return {
          ...state,
          isLoadingEvents: false,
          allEvents: parameters.eventsList,
          displayedEvents: parameters.eventsList,
          allVenues: parameters.venuesList,
          dropdownVenues: parameters.venuesList.map((venue: Venue) => {
            return {
              key: venue.venueId,
              name: venue.name,
            };
          }),
          allStaff: parameters.staffList,
          selectableStaff: parameters.staffList,
        };
      }
      return {
        ...state,
        error: new Error(
          'Missing one or more of eventsList, venuesList, or staffList'
        ),
      };
    }
    case ManageEventsStateActions.SetupNewEvent: {
      return {
        ...manageEventsDefaultState,
        allStaff: state.allStaff,
        allVenues: state.allVenues,
        allEvents: state.allEvents,
        displayedEvents: state.displayedEvents,
        dropdownVenues: state.dropdownVenues,
        selectableStaff: state.allStaff,
        selectablePositions: [],
        isLoadingEvents: false,
        error: null,
      };
    }
    case ManageEventsStateActions.Search: {
      if (parameters?.searchContent) {
        const searchContentLower = parameters.searchContent.toLowerCase();
        return {
          ...state,
          displayedEvents: state.displayedEvents.filter((event) => {
            if (event.name.toLowerCase().includes(searchContentLower)) {
              return event;
            }
          }),
        };
      }
      return {
        ...state,
        displayedEvents: state.allEvents,
      };
    }
    case ManageEventsStateActions.SelectEventToEdit: {
      if (parameters?.selectedId) {
        const event = state.allEvents.find(
          (event) => event.eventId === parameters.selectedId
        );
        if (event) {
          const assignedSupervisors = event.supervisors.map(
            (assignedSupervisor) => {
              return assignedSupervisor.staffMember.username;
            }
          );
          const assignedStaffMembers = event.staff.map(
            (assignedStaffMember) => {
              return assignedStaffMember.staffMember.username;
            }
          );
          const allAssignedStaff = [
            ...assignedStaffMembers,
            ...assignedSupervisors,
          ];
          const selectableStaff = [...state.allStaff].filter((staffMember) => {
            return !allAssignedStaff.includes(staffMember.username);
          });

          return {
            ...state,
            id: parameters.selectedId,
            name: event.name,
            venue: event.venue,
            // Have to multiply by 1000 because JavaScript uses milliseconds instead of seconds to store epoch time
            start: new Date(event.start * 1000),
            end: new Date(event.end * 1000),
            supervisors: event.supervisors,
            staff: event.staff,
            selectablePositions: event.venue.positions,
            selectableStaff,
          };
        } else {
          return {
            ...manageEventsDefaultState,
            allStaff: state.allStaff,
            allVenues: state.allVenues,
            allEvents: state.allEvents,
            displayedEvents: state.displayedEvents,
            selectableStaff: state.allStaff,
            selectablePositions: [],
            isLoadingEvents: false,
          };
        }
      }
      return { ...state, error: new Error('No selected ID') };
    }
    case ManageEventsStateActions.ExistingEventUpdated: {
      if (parameters?.updatedId && parameters?.updatedName) {
        const indexOfEvent = state.allEvents.findIndex(
          (event) => event.eventId === parameters.updatedId
        );
        // Updates the event in the list with the new details
        const updatedAllEvents = [...state.allEvents];
        updatedAllEvents[indexOfEvent] = {
          ...updatedAllEvents[indexOfEvent],
          name: parameters.updatedName,
        };
        return {
          ...state,
          allEvents: updatedAllEvents,
          displayedEvents: updatedAllEvents,
          success: 'Event Updated Successfully',
        };
      }
      return {
        ...state,
        error: new Error('Missing data required to update state'),
      };
    }
    case ManageEventsStateActions.ValidationError: {
      if (parameters?.error) {
        return {
          ...state,
          error: parameters.error,
        };
      }
      return state;
    }
    case ManageEventsStateActions.Save: {
      return {
        ...state,
        isSaving: true,
      };
    }
    case ManageEventsStateActions.NewEventSaved: {
      if (parameters?.newEvent) {
        const updatedEventList = [...state.allEvents, parameters.newEvent];
        return {
          ...state,
          allEvents: updatedEventList,
          displayedEvents: updatedEventList,
          success: 'Event Saved Successfully',
        };
      }
      return {
        ...state,
        error: new Error('Missing newEvent'),
      };
    }
    case ManageEventsStateActions.SaveError: {
      if (parameters?.error) {
        console.error(JSON.stringify(parameters.error, null, 2));
        return {
          ...state,
          error: parameters.error,
        };
      }
      return state;
    }
    case ManageEventsStateActions.FinishedSaving: {
      return {
        ...state,
        isSaving: false,
      };
    }
    case ManageEventsStateActions.Delete: {
      return {
        ...state,
        isDeleting: true,
      };
    }
    case ManageEventsStateActions.DeleteSuccess: {
      if (parameters?.deletedId) {
        const listWithoutDeletedEvent = [...state.allEvents].filter(
          (event) => event.eventId !== state.id
        );
        return {
          ...state,
          allEvents: listWithoutDeletedEvent,
          displayedEvents: listWithoutDeletedEvent,
          success: 'Event Deleted Successfully',
        };
      }
      return {
        ...state,
        error: new Error('No deleted ID'),
      };
    }
    case ManageEventsStateActions.DeleteError: {
      console.error(parameters?.error, null, 2);
      return {
        ...state,
        error: parameters?.error,
      };
    }
    case ManageEventsStateActions.FinishedDeleting: {
      return {
        ...manageEventsDefaultState,
        allStaff: state.allStaff,
        allVenues: state.allVenues,
        allEvents: state.allEvents,
        displayedEvents: state.displayedEvents,
        selectableStaff: state.allStaff,
        selectablePositions: [],
        isLoadingEvents: false,
        error: null,
        isDeleting: false,
      };
    }
    case ManageEventsStateActions.AssignSupervisor: {
      if (parameters?.supervisor && parameters?.areaOfSupervision) {
        const newState = {
          ...state,
          supervisors: [
            ...state.supervisors,
            {
              staffMember: parameters.supervisor,
              areaOfSupervision: parameters.areaOfSupervision,
            },
          ],
        };
        const indexToRemove = state.selectableStaff.findIndex(
          (staffInArray) =>
            staffInArray.username === parameters.supervisor.username
        );
        const selectableStaff = [...state.selectableStaff];
        selectableStaff.splice(indexToRemove, 1);
        return {
          ...newState,
          selectableStaff,
          error: null,
        };
      }
      return {
        ...state,
        error: new Error('Missing supervisor or areaOfSupervision'),
      };
    }
    case ManageEventsStateActions.UnassignSupervisor: {
      if (parameters?.supervisor) {
        const newAssignedList = [...state.supervisors];
        newAssignedList.splice(
          state.supervisors.findIndex(
            (assignedStaffMember) =>
              assignedStaffMember.staffMember.username ===
              parameters.supervisor.username
          ),
          1
        );
        return {
          ...state,
          supervisors: newAssignedList,
          selectableStaff: [...state.selectableStaff, parameters.supervisor],
        };
      }
      return {
        ...state,
        error: new Error('Missing supervisor'),
      };
    }
    case ManageEventsStateActions.AssignStaff: {
      if (parameters?.staffMember && parameters?.position) {
        const indexToRemove = state.selectableStaff.findIndex(
          (staffInArray) =>
            staffInArray.username === parameters.staffMember.username
        );
        const newList = [...state.selectableStaff];
        newList.splice(indexToRemove, 1);
        return {
          ...state,
          selectableStaff: newList,
          error: null,
          staff: [
            ...state.staff,
            {
              staffMember: parameters.staffMember,
              position: parameters.position,
            },
          ],
        };
      }
      return {
        ...state,
        error: new Error('Missing staffMember or position'),
      };
    }
    case ManageEventsStateActions.UnassignStaff: {
      if (parameters?.staffMember) {
        const newAssignedList = [...state.staff];
        newAssignedList.splice(
          state.staff.findIndex(
            (assignedStaffMember) =>
              assignedStaffMember.staffMember.username ===
              parameters.staffMember.username
          ),
          1
        );
        return {
          ...state,
          staff: newAssignedList,
          selectableStaff: [...state.selectableStaff, parameters.staffMember],
        };
      }
      return {
        ...state,
        error: new Error('Missing staffMember'),
      };
    }
    case ManageEventsStateActions.SelectVenue: {
      if (parameters?.venueId) {
        if (parameters.venueId !== state.venue?.venueId) {
          const selectedVenue = state.allVenues.find(
            (venue) => venue.venueId === parameters.venueId
          );
          if (selectedVenue) {
            return {
              ...state,
              venue: selectedVenue,
              supervisors: [],
              staff: [],
              selectablePositions: selectedVenue.positions,
              error: null,
            };
          }
        }
      }
      return {
        ...state,
        error: new Error('Missing venueId'),
      };
    }
    case ManageEventsStateActions.FieldChange: {
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
