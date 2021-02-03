package com.marcdonald.ems.repository

import com.marcdonald.ems.model.Event
import com.marcdonald.ems.network.AuthService
import com.marcdonald.ems.network.EventsService
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
}