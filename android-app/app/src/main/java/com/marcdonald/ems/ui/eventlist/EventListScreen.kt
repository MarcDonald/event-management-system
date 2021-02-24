package com.marcdonald.ems.ui.eventlist

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.activity.OnBackPressedCallback
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Settings
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
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
import com.marcdonald.ems.ui.eventlist.components.EventCard
import com.marcdonald.ems.ui.eventlist.components.EventListHeader
import com.marcdonald.ems.ui.theme.EMSTheme
import dagger.hilt.android.AndroidEntryPoint
import timber.log.Timber

@AndroidEntryPoint
class EventListScreen : Fragment() {

	private val viewModel: EventListViewModel by viewModels()

	private val backPressedHandler = object : OnBackPressedCallback(true) {
		override fun handleOnBackPressed() {
			requireActivity().finish()
		}
	}

	override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
		requireActivity().onBackPressedDispatcher.addCallback(backPressedHandler)

		return ComposeView(requireContext()).apply {
			setContent {
				EMSTheme(darkTheme = isSystemInDarkTheme()) {
					(requireActivity() as MainActivity).systemUi.setSystemBarsColor(MaterialTheme.colors.primary)

					Surface(color = MaterialTheme.colors.primary) {
						// Container Column
						Column(
							modifier = Modifier
								.fillMaxWidth()
						) {
							// Header Column
							Column(modifier = Modifier.weight(1f)) {
								EventListHeader(
									name = viewModel.loggedInUserName.value,
									role = viewModel.loggedInRole.value
								)
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
										.fillMaxSize(),
									verticalArrangement = Arrangement.SpaceBetween
								) {
									Column(
										modifier = Modifier.fillMaxWidth()
									) {
										Text(
											text = "Upcoming Events",
											modifier = Modifier
												.fillMaxWidth()
												.padding(vertical = 16.dp),
											textAlign = TextAlign.Center,
											style = MaterialTheme.typography.h4,
											fontWeight = FontWeight.Bold
										)
										if(viewModel.showLoading.value) {
											Column(modifier = Modifier.fillMaxWidth()) {
												CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally))
											}
										} else {
											LazyColumn {
												items(viewModel.events.value) { event ->
													EventCard(event) { eventId ->
														onCardClick(eventId)
													}
													Spacer(modifier = Modifier.padding(8.dp))
												}
											}
										}
									}
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
		viewModel.loadEvents()
		viewModel.signedOut.observe(viewLifecycleOwner, { isSignedOut ->
			if(isSignedOut) {
				findNavController().navigate(R.id.signoutFromEventList)
			}
		})
	}

	@Composable
	private fun BottomBar() =
		Row(
			modifier = Modifier
				.fillMaxWidth()
				.padding(8.dp)
		) {
			IconButton(onClick = {
				viewModel.logout()
			}) {
				Icon(Icons.Default.Settings, contentDescription = "Settings")
			}
		}

	private fun onCardClick(eventId: String) {
		try {
			val position = viewModel.determinePositionAtEvent(eventId)
			val supervisors = viewModel.getSupervisorsOfEvent(eventId)
			Timber.i("Log: onCardClick: $position")
			val args = Bundle().apply {
				putString("positionName", position.name)
				putString("positionId", position.positionId)
				putString("eventId", eventId)
				putParcelableArray("supervisors", supervisors)
			}
			findNavController().navigate(R.id.eventSelected, args)
		} catch(e: Exception) {
			Timber.e("Log: onCardClick: $e")
		}
	}
}