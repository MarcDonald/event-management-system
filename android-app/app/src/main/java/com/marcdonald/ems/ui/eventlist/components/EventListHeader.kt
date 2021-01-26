package com.marcdonald.ems.ui.eventlist.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp

@Composable
fun EventListHeader(
	name: String,
	role: String,
) =
	Column(
		modifier = Modifier
			.fillMaxWidth()
			.padding(vertical = 16.dp),
		verticalArrangement = Arrangement.SpaceBetween
	) {
		Text(
			text = "Logged In As",
			modifier = Modifier.fillMaxWidth(),
			style = MaterialTheme.typography.h5,
			textAlign = TextAlign.Center,
			color = Color.White,
			fontWeight = FontWeight.Light
		)
		Text(
			text = name,
			modifier = Modifier.fillMaxWidth(),
			style = MaterialTheme.typography.h4,
			textAlign = TextAlign.Center,
			color = Color.White,
			fontWeight = FontWeight.Bold
		)
		Text(
			text = role,
			modifier = Modifier.fillMaxWidth(),
			style = MaterialTheme.typography.h5,
			textAlign = TextAlign.Center,
			color = Color.White,
		)
	}
