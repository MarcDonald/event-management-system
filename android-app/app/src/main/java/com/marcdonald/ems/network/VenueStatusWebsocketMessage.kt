package com.marcdonald.ems.network

data class VenueStatusWebsocketMessage(
	val venueStatus: String,
	val time: Long
)