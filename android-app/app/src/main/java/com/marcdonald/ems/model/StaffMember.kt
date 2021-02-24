package com.marcdonald.ems.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
data class StaffMember(
	val sub: String,
	val role: UserRole,
	val username: String,
	val givenName: String,
	val familyName: String,
) : Parcelable