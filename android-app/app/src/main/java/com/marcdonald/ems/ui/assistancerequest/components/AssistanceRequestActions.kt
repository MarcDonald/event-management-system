package com.marcdonald.ems.ui.assistancerequest.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.Button
import androidx.compose.material.ButtonDefaults
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.marcdonald.ems.model.AssistanceRequestType
import com.marcdonald.ems.ui.theme.cleanerColor
import com.marcdonald.ems.ui.theme.securityColor
import com.marcdonald.ems.ui.theme.supervisorColor

@Composable
fun AssistanceRequestActions(
	onAssistanceRequestClick: (AssistanceRequestType) -> Unit,
) =
	Column(modifier = Modifier
		.padding(horizontal = 42.dp)
		.fillMaxWidth()
	) {
		AssistanceRequestActionButton(
			text = "Supervisor",
			color = supervisorColor,
			onClick = { onAssistanceRequestClick(AssistanceRequestType.Supervisor) }
		)
		AssistanceRequestActionButton(
			text = "Cleaner",
			color = cleanerColor,
			onClick = { onAssistanceRequestClick(AssistanceRequestType.Cleaner) }
		)
		AssistanceRequestActionButton(
			text = "Security",
			color = securityColor,
			onClick = { onAssistanceRequestClick(AssistanceRequestType.Security) }
		)
	}

@Composable
fun AssistanceRequestActionButton(
	text: String,
	color: Color,
	onClick: () -> Unit
) =
	Button(
		modifier = Modifier
			.fillMaxWidth()
			.padding(vertical = 24.dp),
		onClick = { onClick() },
		colors = ButtonDefaults.buttonColors(
			backgroundColor = color,
		),
		contentPadding = PaddingValues(16.dp)
	) {
		Text(
			text = text,
			color = Color.White,
			fontWeight = FontWeight.SemiBold
		)
	}
