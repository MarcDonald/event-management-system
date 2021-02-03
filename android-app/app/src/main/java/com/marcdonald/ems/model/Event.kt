package com.marcdonald.ems.model

data class Event(
	val eventId: String,
	val name: String,
	val venue: Venue,
	val start: Long,
	val end: Long,
	val supervisors: List<Supervisor>,
	val staff: List<Staff>
)