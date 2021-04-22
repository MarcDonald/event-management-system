package com.marcdonald.ems.ui.assistancerequest.components.requestsdialog

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material.Card
import androidx.compose.material.CircularProgressIndicator
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.fragment.app.viewModels
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.marcdonald.ems.MainActivity
import com.marcdonald.ems.model.AssistanceRequest
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
						.fillMaxWidth()
					) {
						Text("Requests", modifier = Modifier
							.fillMaxWidth()
							.padding(8.dp), textAlign = TextAlign.Center, style = MaterialTheme.typography.h6, color = MaterialTheme.colors.onSurface)

						if(viewModel.isLoading.value) {
							CircularProgressIndicator(modifier = Modifier
								.size(64.dp)
								.padding(8.dp)
								.align(Alignment.CenterHorizontally)
							)
						} else {
							when {
								viewModel.error.value != null      -> {
									Text(viewModel.error.value.toString(), modifier = Modifier
										.fillMaxWidth()
										.padding(8.dp), textAlign = TextAlign.Center, style = MaterialTheme.typography.body1, color = MaterialTheme.colors.error)

								}
								viewModel.requests.value.isEmpty() -> {
									Text("You haven't made any requests", modifier = Modifier
										.fillMaxWidth()
										.padding(8.dp), textAlign = TextAlign.Center, style = MaterialTheme.typography.body1, color = MaterialTheme.colors.onSurface)
								}
								else                               -> {
									LazyColumn {
										itemsIndexed(viewModel.requests.value) { index, request ->
											RequestCard(request)
											if(index != viewModel.requests.value.size - 1) {
												Spacer(modifier = Modifier.padding(8.dp))
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}

	override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
		super.onViewCreated(view, savedInstanceState)
		requireArguments().let { args ->
			viewModel.passArguments(args.getString("eventId", ""), args.getString("positionId", ""))
		}
	}

	@Composable
	private fun RequestCard(request: AssistanceRequest) {
		return Card {
			Column {
				Text(request.message, modifier = Modifier
					.fillMaxWidth()
					.padding(horizontal = 8.dp)
					.padding(top = 8.dp), textAlign = TextAlign.Center, style = MaterialTheme.typography.body1, color = MaterialTheme.colors.onSurface, fontWeight = FontWeight.Bold
				)
				val handledText = if(request.handled) "Request has been handled" else "Request has not been handled yet"
				Text(handledText, modifier = Modifier
					.fillMaxWidth()
					.padding(8.dp), textAlign = TextAlign.Center, style = MaterialTheme.typography.body2, color = MaterialTheme.colors.onSurface)
			}
		}
	}
}