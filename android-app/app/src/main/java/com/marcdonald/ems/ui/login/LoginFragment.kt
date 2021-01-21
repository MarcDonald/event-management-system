package com.marcdonald.ems.ui.login

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import com.marcdonald.ems.R
import com.marcdonald.ems.ui.theme.EMSTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class LoginFragment : Fragment() {

	private val viewModel: LoginViewModel by viewModels()

	override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
		return ComposeView(requireContext()).apply {
			setContent {
				EMSTheme(darkTheme = isSystemInDarkTheme()) {
					Surface(color = MaterialTheme.colors.background) {
						Column(modifier = Modifier.padding(16.dp)) {
							Text(modifier = Modifier.fillMaxWidth(), text = "Login", textAlign = TextAlign.Center, color = MaterialTheme.colors.onBackground)
							Column(modifier = Modifier.padding(vertical = 16.dp)) {
								OutlinedTextField(
									value = viewModel.username.value,
									onValueChange = { newValue ->
										viewModel.onUsernameChanged(newValue)
									},
									modifier = Modifier.fillMaxWidth(),
									label = {
										Text(text = "Username")
									},
									leadingIcon = {
										Icon(Icons.Default.Person)
									}
								)
								OutlinedTextField(
									value = viewModel.password.value,
									onValueChange = { newValue ->
										viewModel.onPasswordChanged(newValue)
									},
									modifier = Modifier.fillMaxWidth(),
									label = {
										Text(text = "Password")
									},
									keyboardOptions = KeyboardOptions(
										autoCorrect = false,
										keyboardType = KeyboardType.Password,
										imeAction = ImeAction.Done
									),
									leadingIcon = {
										Icon(Icons.Default.Lock)
									},
									onImeActionPerformed = { action, _ ->
										if(action == ImeAction.Done) {
											viewModel.login()
										}
									},
									visualTransformation = PasswordVisualTransformation()
								)
							}
							Column() {
								Button(
									onClick = {
										viewModel.login()
									},
									modifier = Modifier.fillMaxWidth(),
								) {
									Text("Login")
								}
							}
							if(viewModel.isLoading.value) {
								Column(modifier = Modifier.padding(vertical = 16.dp)) {
									CircularProgressIndicator()
								}
							}
						}
					}
				}
			}
		}
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
