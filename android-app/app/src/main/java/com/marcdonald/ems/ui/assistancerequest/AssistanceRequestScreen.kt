package com.marcdonald.ems.ui.assistancerequest

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.activity.OnBackPressedCallback
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.padding
import androidx.compose.material.Button
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Surface
import androidx.compose.material.Text
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.unit.dp
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.findNavController
import androidx.navigation.fragment.findNavController
import com.amazonaws.mobile.client.AWSMobileClient
import com.marcdonald.ems.MainActivity
import com.marcdonald.ems.R
import com.marcdonald.ems.ui.theme.EMSTheme
import dagger.hilt.android.AndroidEntryPoint
import timber.log.Timber

@AndroidEntryPoint
class AssistanceRequestScreen : Fragment() {

	private val viewModel: AssistanceRequestViewModel by viewModels()

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
					(requireActivity() as MainActivity).systemUi.setSystemBarsColor(MaterialTheme.colors.background)

					Surface(color = MaterialTheme.colors.background) {
						Column(modifier = Modifier.padding(16.dp)) {
							Text("Assistance Request")
							Spacer(modifier = Modifier.padding(16.dp))
							Button(onClick = {
								AWSMobileClient.getInstance().signOut()
								findNavController().navigate(R.id.signout)
							}) {
								Text(text = "Logout")
							}
						}
					}
				}
			}
		}
	}
}