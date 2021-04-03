package com.marcdonald.ems.ui.assistancerequest.components

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.material.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.navigation.fragment.findNavController
import com.amplifyframework.core.Amplify
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.marcdonald.ems.network.AuthService
import com.marcdonald.ems.ui.theme.EMSTheme
import dagger.hilt.android.AndroidEntryPoint
import timber.log.Timber
import javax.inject.Inject

@AndroidEntryPoint
class MenuDialogSheet : BottomSheetDialogFragment() {

	@Inject lateinit var authService: AuthService

	override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
		return ComposeView(requireContext()).apply {
			setContent {
				EMSTheme(darkTheme = isSystemInDarkTheme()) {
					Column(modifier = Modifier
						.padding(8.dp)
						.fillMaxWidth()) {
						Text("Menu", modifier = Modifier
							.fillMaxWidth()
							.padding(8.dp), textAlign = TextAlign.Center, style = MaterialTheme.typography.h6, color = MaterialTheme.colors.onSurface)
						OutlinedButton(
							modifier = Modifier.fillMaxWidth(),
							shape = MaterialTheme.shapes.small,
							onClick = { this@MenuDialogSheet.goToEventSelection() }
						) {
							Text("Event Selection")
						}
						Spacer(modifier = Modifier.padding(8.dp))
						TextButton(
							modifier = Modifier.fillMaxWidth(),
							shape = MaterialTheme.shapes.small,
							onClick = { this@MenuDialogSheet.logout() }
						) {
							Text("Logout")
						}
						Spacer(modifier = Modifier.padding(8.dp))
					}
				}
			}
		}
	}

	private fun logout() {
		Amplify.Auth.signOut(
			{
				dismiss()
			},
			{ error -> Timber.e("Log: MenuDialogSheet: Logout $error") }
		)
	}

	private fun goToEventSelection() {
		findNavController().popBackStack()
		dismiss()
	}
}