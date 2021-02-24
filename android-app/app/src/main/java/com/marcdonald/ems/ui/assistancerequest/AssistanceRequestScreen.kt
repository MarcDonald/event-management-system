package com.marcdonald.ems.ui.assistancerequest

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Person
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import com.marcdonald.ems.MainActivity
import com.marcdonald.ems.R
import com.marcdonald.ems.model.Supervisor
import com.marcdonald.ems.ui.assistancerequest.components.AssistanceRequestActions
import com.marcdonald.ems.ui.assistancerequest.components.MenuDialogSheet
import com.marcdonald.ems.ui.assistancerequest.components.supervisorsdialog.SupervisorsDialogSheet
import com.marcdonald.ems.ui.assistancerequest.components.requestsdialog.RequestsDialogSheet
import com.marcdonald.ems.ui.theme.EMSTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class AssistanceRequestScreen : Fragment() {

	private val viewModel: AssistanceRequestViewModel by viewModels()

	private val backPressedHandler = object : OnBackPressedCallback(true) {
		override fun handleOnBackPressed() {
			findNavController().popBackStack()
		}
	}

	override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
		requireActivity().onBackPressedDispatcher.addCallback(backPressedHandler)

		return ComposeView(requireContext()).apply {
			setContent {
				EMSTheme(darkTheme = isSystemInDarkTheme()) {
					if(viewModel.isLoading.value) {
						(requireActivity() as MainActivity).systemUi.setSystemBarsColor(MaterialTheme.colors.background)
						CircularProgressIndicator(modifier = Modifier
							.fillMaxSize()
							.size(64.dp))
					} else {
						(requireActivity() as MainActivity).systemUi.setSystemBarsColor(viewModel.venueStatus.value.color)
						Surface(color = viewModel.venueStatus.value.color) {
							// Container Column
							Column(
								modifier = Modifier
									.fillMaxWidth()
							) {
								// Header Column
								Column(
									modifier = Modifier
										.fillMaxWidth()
										.weight(1f),
								) {
									StatusHeader()
								}
								// Body
								Surface(
									modifier = Modifier
										.fillMaxSize()
										.weight(4f),
									shape = RoundedCornerShape(topLeft = 16.dp, topRight = 16.dp),
									color = MaterialTheme.colors.background,
								) {
									Column(
										modifier = Modifier
											.fillMaxSize()
											.padding(top = 64.dp),
										verticalArrangement = Arrangement.SpaceBetween
									) {
										InfoBar()
										AssistanceRequestActions { type ->
											viewModel.requestAssistance(type)
											Toast.makeText(requireContext(), "Requesting $type", Toast.LENGTH_LONG).show()
										}
										BottomNav()
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
		arguments?.let { args ->
			viewModel.passArguments(
				args.getString("positionName", ""),
				args.getString("positionId", ""),
				args.getString("eventId", ""),
				args.getParcelableArray("supervisors") as Array<Supervisor>
			)
		}
		viewModel.signedOut.observe(viewLifecycleOwner, { isSignedOut ->
			if(isSignedOut) {
				findNavController().navigate(R.id.signoutFromAssistanceRequest)
			}
		})
	}

	override fun onPause() {
		viewModel.closeVenueStatusWebsocketConnection()
		super.onPause()
	}

	override fun onResume() {
		viewModel.connectToVenueStatusWebsocket()
		super.onResume()
	}

	@Composable
	fun StatusHeader() =
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
				text = viewModel.venueStatus.value.name,
				modifier = Modifier.fillMaxWidth(),
				style = MaterialTheme.typography.h2,
				textAlign = TextAlign.Center,
				color = Color.White,
				fontWeight = FontWeight.Bold
			)
		}

	@Composable
	fun InfoBar() =
		Column {
			var assignmentText = "Loading Assignment..."
			if(viewModel.position.value != null) {
				assignmentText = "You are assigned to ${viewModel.position.value?.name}"
			}
			Text(
				text = assignmentText,
				modifier = Modifier.fillMaxWidth(),
				textAlign = TextAlign.Center,
				style = MaterialTheme.typography.body1,
			)
			Text(
				text = "Request Assistance",
				modifier = Modifier
					.fillMaxWidth()
					.padding(vertical = 16.dp),
				textAlign = TextAlign.Center,
				style = MaterialTheme.typography.h4,
				fontWeight = FontWeight.Bold
			)
		}

	@Composable
	fun BottomNav() =
		Row(
			horizontalArrangement = Arrangement.SpaceBetween,
			modifier = Modifier
				.fillMaxWidth()
		) {
			// TODO the dialogs should probably be injected in via Dagger
			BottomNavigation(backgroundColor = MaterialTheme.colors.surface) {
				BottomNavigationItem(
					label = { Text("Supervisors") },
					alwaysShowLabels = true,
					icon = { Icon(Icons.Default.Person, contentDescription = "Supervisors") }, selected = false, onClick = {
						val args = Bundle().apply {
							putParcelableArray("supervisors", viewModel.supervisors)
						}
						SupervisorsDialogSheet().apply {
							arguments = args
						}.show(parentFragmentManager, "SupervisorsSheet")
					})
				BottomNavigationItem(
					label = { Text("Requests") },
					alwaysShowLabels = true, icon = { Icon(Icons.Default.Email, contentDescription = "Requests") }, selected = false, onClick = {
						viewModel.position.value?.let { position ->
							val args = Bundle().apply {
								putString("eventId", viewModel.eventId)
								putString("positionId", position.positionId)
							}
							RequestsDialogSheet().apply {
								arguments = args
							}.show(parentFragmentManager, "RequestsSheet")
						}
					})
				BottomNavigationItem(
					label = { Text("Menu") },
					alwaysShowLabels = true, icon = { Icon(Icons.Default.Menu, contentDescription = "Menu") }, selected = false, onClick = {
						MenuDialogSheet().show(parentFragmentManager, "MenuSheet")
					})
			}
		}
}