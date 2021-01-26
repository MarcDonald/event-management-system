package com.marcdonald.ems.ui.assistancerequest.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import com.marcdonald.ems.utils.VenueStatus

@Composable
fun StatusHeader(venueStatus: VenueStatus) =
	Column(
		modifier = Modifier
			.fillMaxSize()
	) {
		Text(
			text = "Venue Alert Status Is",
			modifier = Modifier.fillMaxWidth(),
			style = MaterialTheme.typography.h5,
			textAlign = TextAlign.Center,
			color = Color.White,
			fontWeight = FontWeight.Light
		)
		Text(
			text = venueStatus.name,
			modifier = Modifier.fillMaxWidth(),
			style = MaterialTheme.typography.h2,
			textAlign = TextAlign.Center,
			color = Color.White,
			fontWeight = FontWeight.Bold
		)
	}