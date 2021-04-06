import ManageEventsStateActions from './ManageEventsStateActions';
import StateAction from '../../../../shared/utils/StateAction';
import Venue from '../../../../shared/models/Venue';
import AssignedSupervisor from '../../../../shared/models/AssignedSupervisor';
import AssignedStaffMember from '../../../../shared/models/AssignedStaffMember';
import { DropdownItem } from '../../../../shared/components/Dropdown';
import StaffMember from '../../../../shared/models/StaffMember';
import Position from '../../../../shared/models/Position';
import Event from '../../../../shared/models/Event';

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
  disableButtons: boolean;
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
  isLoadingEvents: true,
  disableButtons: false,
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
      return { ...state };
    }
    case ManageEventsStateActions.Save: {
      return {
        ...state,
        disableButtons: true,
      };
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
          disableButtons: false,
        };
      }
      return {
        ...state,
      };
    }
    case ManageEventsStateActions.NewEventSaved: {
      if (parameters?.newEvent) {
        const updatedEventList = [...state.allEvents, parameters.newEvent];
        return {
          ...state,
          allEvents: updatedEventList,
          displayedEvents: updatedEventList,
          disableButtons: false,
        };
      }
      return {
        ...state,
      };
    }
    case ManageEventsStateActions.SaveError: {
      return {
        ...state,
        disableButtons: false,
      };
    }
    case ManageEventsStateActions.Delete: {
      return {
        ...state,
        disableButtons: true,
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
        };
      }
      return {
        ...state,
      };
    }
    case ManageEventsStateActions.DeleteError: {
      return {
        ...state,
        disableButtons: false,
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
        };
      }
      return {
        ...state,
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
            };
          }
        }
      }
      return {
        ...state,
      };
    }
    case ManageEventsStateActions.FieldChange: {
      return {
        ...state,
        [parameters?.fieldName]: parameters?.fieldValue,
      };
    }
    default:
      break;
  }
  return state;
}
