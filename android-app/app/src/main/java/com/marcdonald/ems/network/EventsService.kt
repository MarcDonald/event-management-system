package com.marcdonald.ems.network

import com.marcdonald.ems.model.Event
import retrofit2.http.*

interface EventsService {

	@GET("/production/events/upcoming/{username}")
	suspend fun getUpcoming(@Header("Authorization") idToken: String, @Path("username") username: String): List<Event>

	@GET("/production/events/{eventId}/status")
	suspend fun getStatus(@Header("Authorization") idToken: String, @Path("eventId") eventId: String): EventStatusResponse

	@POST("/production/events/{eventId}/assistance")
	suspend fun sendAssistanceRequest(
		@Header("Authorization") idToken: String,
		@Path("eventId") eventId: String,
		@Body assistanceRequestBody: AssistanceRequestBody
	): AssistanceRequestResponse
}