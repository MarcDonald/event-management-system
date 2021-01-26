package com.marcdonald.ems.utils

import androidx.compose.ui.graphics.Color
import com.marcdonald.ems.ui.theme.evacuateStatus
import com.marcdonald.ems.ui.theme.highStatus
import com.marcdonald.ems.ui.theme.lowStatus

sealed class VenueStatus(val color: Color, val name: String) {
	class Low : VenueStatus(color = lowStatus, name = "Low")
	class High : VenueStatus(color = highStatus, name = "High")
	class Evacuate : VenueStatus(color = evacuateStatus, name = "Evacuate")
}