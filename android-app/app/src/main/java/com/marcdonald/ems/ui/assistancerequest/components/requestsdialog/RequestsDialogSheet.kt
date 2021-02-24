package com.marcdonald.ems.ui.assistancerequest.components.requestsdialog

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Text
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.fragment.app.viewModels
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.marcdonald.ems.ui.assistancerequest.AssistanceRequestViewModel
import com.marcdonald.ems.ui.theme.EMSTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class RequestsDialogSheet : BottomSheetDialogFragment() {

	private val viewModel: RequestsDialogViewModel by viewModels()

	override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
		return ComposeView(requireContext()).apply {
			setContent {
				EMSTheme(darkTheme = isSystemInDarkTheme()) {
					Column(modifier = Modifier
						.padding(8.dp)
						.fillMaxWidth()) {
						Text("Requests", modifier = Modifier
							.fillMaxWidth()
							.padding(8.dp), textAlign = TextAlign.Center, style = MaterialTheme.typography.h6, color = MaterialTheme.colors.onSurface)
						if(viewModel.requests.value.isEmpty()) {
							Text("You haven't made any requests", modifier = Modifier
								.fillMaxWidth()
								.padding(8.dp), textAlign = TextAlign.Center, style = MaterialTheme.typography.body1, color = MaterialTheme.colors.onSurface)
						} else {
							Text(viewModel.requests.value.size.toString(), modifier = Modifier
								.fillMaxWidth()
								.padding(8.dp), textAlign = TextAlign.Center, style = MaterialTheme.typography.body1, color = MaterialTheme.colors.onSurface)
						}
					}
				}
			}
		}
	}
}