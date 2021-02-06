package com.marcdonald.ems.network

import com.marcdonald.ems.model.Position

data class AssistanceRequestBody(
	val position: Position,
	val message: String,
)