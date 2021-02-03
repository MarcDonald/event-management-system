package com.marcdonald.ems.model

data class StaffMember(
	val sub: String,
	val role: UserRole,
	val username: String,
	val givenName: String,
	val familyName: String,
)