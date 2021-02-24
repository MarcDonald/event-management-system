package com.marcdonald.ems.model

data class AssistanceRequest(
	val assistanceRequestId: String,
	val position: Position,
	val message: String,
	val time: Long,
	val handled: Boolean
)