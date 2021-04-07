package com.marcdonald.ems.ui.login.components

import android.view.inputmethod.InputMethodManager
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.marcdonald.ems.ui.login.state.LoginFormValidationState

@Composable
fun LoginForm(
	username: String,
	onUsernameChanged: (String) -> Unit,
	password: String,
	onPasswordChanged: (String) -> Unit,
	login: () -> Unit,
	isLoading: Boolean,
	validationState: LoginFormValidationState
) =
	Surface(
		color = MaterialTheme.colors.background,
		shape = RoundedCornerShape(topLeft = 16.dp, topRight = 16.dp),
		modifier = Modifier.fillMaxSize()
	) {
		Column(modifier = Modifier.padding(horizontal = 64.dp, vertical = 32.dp)) {
			Column {
				OutlinedTextField(
					value = username,
					onValueChange = { newValue ->
						onUsernameChanged(newValue)
					},
					modifier = Modifier.fillMaxWidth(),
					label = {
						Text(text = "Username")
					},
					leadingIcon = {
						Icon(Icons.Default.Person, contentDescription = "Username")
					},
					isErrorValue = validationState.usernameTouched.value && !validationState.usernameValid.value,
				)
				Text("${username.length}/1+",
					modifier = Modifier.fillMaxWidth(),
					color = if(!validationState.usernameValid.value) MaterialTheme.colors.error else MaterialTheme.colors.primary,
					textAlign = TextAlign.End
				)
				OutlinedTextField(
					value = password,
					onValueChange = { newValue ->
						onPasswordChanged(newValue)
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
						Icon(Icons.Default.Lock, contentDescription = "Password")
					},
					onImeActionPerformed = { action, imeKeyboard ->
						if(action == ImeAction.Done) {
							login()
							imeKeyboard?.hideSoftwareKeyboard()
						}
					},
					visualTransformation = PasswordVisualTransformation(),
					isErrorValue = validationState.passwordTouched.value && !validationState.passwordValid.value,
				)
				Text("${password.length}/8+",
					modifier = Modifier.fillMaxWidth(),
					color = if(!validationState.passwordValid.value) MaterialTheme.colors.error else MaterialTheme.colors.primary,
					textAlign = TextAlign.End
				)
				Button(
					onClick = {
						login()
					},
					enabled = validationState.passwordValid.value && validationState.usernameValid.value,
					modifier = Modifier
						.padding(vertical = 16.dp)
						.fillMaxWidth(),
				) {
					Text("Login")
				}
			}
			if(isLoading) {
				Column(modifier = Modifier
					.padding(vertical = 16.dp)
					.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
					CircularProgressIndicator()
				}
			}
			validationState.rejectedReason.value?.let { errorReason ->
				Column(modifier = Modifier
					.padding(vertical = 16.dp)
					.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
					Text(text = errorReason, color = MaterialTheme.colors.error, textAlign = TextAlign.Center)
				}
			}
		}
	}

