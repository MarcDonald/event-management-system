package com.marcdonald.ems.ui.eventlist.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.Card
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.marcdonald.ems.model.Event
import java.text.SimpleDateFormat
import java.time.Instant
import java.util.*

@Composable
fun EventCard(
	event: Event,
	onClick: (String) -> Unit,
) {
	val sdf = SimpleDateFormat.getDateInstance()
	val start = sdf.format(Date.from(Instant.ofEpochSecond(event.start)))
	val end = sdf.format(Date.from(Instant.ofEpochSecond(event.end)))
	val dateRange = "$start - $end"

	return Card(
		shape = MaterialTheme.shapes.small,
		elevation = 8.dp,
		modifier = Modifier
			.fillMaxWidth()
			.padding(horizontal = 8.dp)
			.clickable(onClick = { onClick(event.eventId) }),
	) {
		Column(modifier = Modifier.padding(horizontal = 16.dp)) {
			Text(
				text = event.name,
				modifier = Modifier.padding(top = 8.dp).fillMaxWidth(),
				textAlign = TextAlign.Center,
				style = MaterialTheme.typography.h5,
				fontWeight = FontWeight.Bold
			)
			Text(
				text = event.venue.name,
				modifier = Modifier.padding(horizontal = 16.dp).fillMaxWidth(),
				textAlign = TextAlign.Center,
				style = MaterialTheme.typography.body1,
			)
			Text(
				text = dateRange,
				modifier = Modifier.padding(bottom = 8.dp).fillMaxWidth(),
				textAlign = TextAlign.Center,
				style = MaterialTheme.typography.body1,
			)
		}
	}
}