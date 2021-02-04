package com.marcdonald.ems.network

import com.marcdonald.ems.model.Event
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.Path

interface EventsService {

	@GET("/production/events/upcoming/{username}")
	suspend fun getUpcoming(@Header("Authorization") idToken: String, @Path("username") username: String): List<Event>

	@GET("/production/events/{eventId}/status")
	suspend fun getStatus(@Header("Authorization") idToken: String, @Path("eventId") eventId: String): EventStatusResponse
}