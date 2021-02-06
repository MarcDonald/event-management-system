package com.marcdonald.ems.network

import com.marcdonald.ems.model.Position

data class AssistanceRequestResponse(
	val assistanceRequestId: String,
	val position: Position,
	val message: String,
	val time: Long,
)