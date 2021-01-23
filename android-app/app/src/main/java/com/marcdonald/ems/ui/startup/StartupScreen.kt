package com.marcdonald.ems.ui.startup

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.activity.OnBackPressedCallback
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.padding
import androidx.compose.material.CircularProgressIndicator
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Surface
import androidx.compose.material.Text
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.unit.dp
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import com.marcdonald.ems.MainActivity
import com.marcdonald.ems.R
import com.marcdonald.ems.ui.theme.EMSTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class StartupScreen : Fragment() {

	private val viewModel: StartupViewModel by viewModels()

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
						Column(modifier = Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
							Text("Checking Login Status")
							Spacer(modifier = Modifier.padding(vertical = 16.dp))
							CircularProgressIndicator()
						}
					}
				}
			}
		}
	}

	override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
		viewModel.isLoggedIn.observe(viewLifecycleOwner, { value ->
			value?.let { isLoggedIn ->
				if(isLoggedIn) {
					findNavController().navigate(R.id.isLoggedIn)
				} else {
					findNavController().navigate(R.id.promptLogin)
				}
			}
		})

		viewModel.checkLoginStatus()
	}
}