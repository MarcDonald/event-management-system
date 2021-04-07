package com.marcdonald.ems.ui.login

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.InputMethodManager
import androidx.activity.OnBackPressedCallback
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Surface
import androidx.compose.material.Text
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.viewinterop.viewModel
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import com.marcdonald.ems.MainActivity
import com.marcdonald.ems.R
import com.marcdonald.ems.ui.login.components.LoginForm
import com.marcdonald.ems.ui.login.components.LoginHeader
import com.marcdonald.ems.ui.theme.EMSTheme
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class LoginScreen : Fragment() {

	private val viewModel: LoginViewModel by viewModels()
	@Inject lateinit var imm: InputMethodManager

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
					(requireActivity() as MainActivity).systemUi.setStatusBarColor(MaterialTheme.colors.primary)
					(requireActivity() as MainActivity).systemUi.setNavigationBarColor(MaterialTheme.colors.background)

					Surface(color = MaterialTheme.colors.primary) {
						Column(
							modifier = Modifier
								.fillMaxSize()
						) {
							Column(
								modifier = Modifier
									.fillMaxWidth()
									.weight(1f),
							) {
								LoginHeader()
							}
							Column(
								modifier = Modifier
									.fillMaxWidth()
									.weight(4f)
							) {
								LoginForm(
									viewModel.username.value,
									viewModel::onUsernameChanged,
									viewModel.password.value,
									viewModel::onPasswordChanged,
									::login,
									viewModel.isLoading.value,
									viewModel.validationState
								)
							}
						}
					}
				}
			}
		}
	}

	private fun login() {
		val view = requireActivity().currentFocus ?: View(requireActivity())
		imm.hideSoftInputFromWindow(view.windowToken, 0)
		viewModel.login()
	}

	override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
		viewModel.signedIn.observe(viewLifecycleOwner, { value ->
			value?.let { isSignedIn ->
				if(isSignedIn) {
					findNavController().navigate(R.id.loginSuccess)
				}
			}
		})
	}
}
