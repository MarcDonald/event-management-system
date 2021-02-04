package com.marcdonald.ems.ui.assistancerequest

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.activity.OnBackPressedCallback
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Settings
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import com.marcdonald.ems.MainActivity
import com.marcdonald.ems.R
import com.marcdonald.ems.ui.assistancerequest.components.AssistanceRequestActions
import com.marcdonald.ems.ui.assistancerequest.components.StatusHeader
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
								StatusHeader(viewModel.venueStatus.value)
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
									AssistanceRequestActions(viewModel::requestAssistance)
									BottomBar()
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
			viewModel.passArguments(args.getString("positionName", ""), args.getString("positionId"), args.getString("eventId", ""))
		}
		viewModel.signedOut.observe(viewLifecycleOwner, { isSignedOut ->
			if(isSignedOut) {
				findNavController().navigate(R.id.signoutFromAssistanceRequest)
			}
		})
	}

	@Composable
	fun InfoBar() =
		Column {
			Text(
				text = "You are assigned to ${viewModel.positionName.value}",
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
	fun BottomBar() =
		Row(
			horizontalArrangement = Arrangement.SpaceBetween,
			modifier = Modifier
				.fillMaxWidth()
				.padding(8.dp)
		) {
			IconButton(onClick = {
				viewModel.logout()
			}) {
				Icon(Icons.Default.Settings, contentDescription = "Settings")
			}
			IconButton(onClick = { /*TODO*/ }) {
				Icon(Icons.Default.Menu, contentDescription = "Menu")
			}
		}
}