package com.marcdonald.ems.repository

import com.marcdonald.ems.model.Event
import com.marcdonald.ems.model.Venue
import com.marcdonald.ems.network.AuthService
import com.marcdonald.ems.network.EventsService
import com.marcdonald.ems.utils.VenueStatus
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class EventsRepository @Inject constructor(private val authService: AuthService, private val eventsService: EventsService) {

	suspend fun getUpcoming(): List<Event> {
		try {
			if(authService.idToken == null) throw Exception("No ID Token")
			if(authService.username == null) throw Exception("No username")
			return eventsService.getUpcoming(authService.idToken!!, authService.username!!)
		} catch(e: Exception) {
			Timber.e("Log: getUpcomingEvents: $e")
		}
		return emptyList()
	}

	suspend fun getStatus(eventId: String): VenueStatus {
		try {
			if(authService.idToken == null) throw Exception("No ID Token")
			val response = eventsService.getStatus(authService.idToken!!, eventId)
			return when(response.venueStatus) {
				"Low" -> VenueStatus.Low()
				"High" -> VenueStatus.High()
				"Evacuate" -> VenueStatus.Evacuate()
				else -> VenueStatus.Low()
			}
		} catch (e: Exception) {
			Timber.e("Log: getStatus: $e")
		}
		return VenueStatus.Low()
	}
}