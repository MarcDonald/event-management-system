package com.marcdonald.ems.ui.assistancerequest.components.supervisorsdialog

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material.Card
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.fragment.app.viewModels
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.marcdonald.ems.model.Supervisor
import com.marcdonald.ems.ui.theme.EMSTheme

class SupervisorsDialogSheet : BottomSheetDialogFragment() {

	private val viewModel: SupervisorsDialogViewModel by viewModels()

	override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
		return ComposeView(requireContext()).apply {
			setContent {
				EMSTheme(darkTheme = isSystemInDarkTheme()) {
					Column(modifier = Modifier
						.padding(8.dp)
						.fillMaxWidth()) {
						Text("Supervisors", modifier = Modifier
							.fillMaxWidth()
							.padding(8.dp), textAlign = TextAlign.Center, style = MaterialTheme.typography.h6, color = MaterialTheme.colors.onSurface)
						LazyColumn {
							itemsIndexed(viewModel.supervisors.value) { index, supervisor ->
								SupervisorCard(supervisor)
								if(index != viewModel.supervisors.value.size - 1) {
									Spacer(modifier = Modifier.padding(8.dp))
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
		arguments?.let { args ->
			viewModel.passArguments(
				args.getParcelableArray("supervisors") as Array<Supervisor>
			)
		}
	}

	@Composable
	private fun SupervisorCard(supervisor: Supervisor) {
		return Card {
			Column {
				Text("${supervisor.staffMember.givenName} ${supervisor.staffMember.familyName}", modifier = Modifier
					.fillMaxWidth()
					.padding(horizontal = 8.dp)
					.padding(top = 8.dp), textAlign = TextAlign.Center, style = MaterialTheme.typography.body1, color = MaterialTheme.colors.onSurface, fontWeight = FontWeight.Bold
				)
				Text(supervisor.areaOfSupervision, modifier = Modifier
					.fillMaxWidth()
					.padding(8.dp), textAlign = TextAlign.Center, style = MaterialTheme.typography.body2, color = MaterialTheme.colors.onSurface)
			}
		}
	}
}