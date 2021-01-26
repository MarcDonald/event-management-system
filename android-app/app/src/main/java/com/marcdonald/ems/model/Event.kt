package com.marcdonald.ems.model

data class Event(
	val eventId: String,
	val name: String,
	val positions: List<Position>,
	val venue: Venue,
	val start: Long,
	val end: Long,
)