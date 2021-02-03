package com.marcdonald.ems.network

import com.google.gson.annotations.SerializedName
import com.marcdonald.ems.model.Event

data class UpcomingEventsNetworkResponse(
	@SerializedName("data")
	var events: List<Event>
)