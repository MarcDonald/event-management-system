package com.marcdonald.ems.ui.startup

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material.CircularProgressIndicator
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Surface
import androidx.compose.material.Text
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.unit.dp
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import com.marcdonald.ems.R
import com.marcdonald.ems.ui.theme.EMSTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class StartupFragment : Fragment() {

	private val viewModel: StartupViewModel by viewModels()

	override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
		return ComposeView(requireContext()).apply {
			setContent {
				EMSTheme(darkTheme = isSystemInDarkTheme()) {
					Surface(color = MaterialTheme.colors.background) {
						Column(modifier = Modifier.padding(16.dp)) {
							Text("Checking Login Status")
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