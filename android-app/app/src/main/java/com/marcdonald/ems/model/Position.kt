package com.marcdonald.ems.model

import java.io.Serializable

data class Position(
	val positionId: String,
	val name: String,
) : Serializable