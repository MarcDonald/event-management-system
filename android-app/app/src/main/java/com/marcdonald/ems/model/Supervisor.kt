package com.marcdonald.ems.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
data class Supervisor(
	val staffMember: StaffMember,
	val areaOfSupervision: String,
) : Parcelable