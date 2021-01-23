package com.marcdonald.ems.ui.login.components

import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp

@Composable
fun LoginForm(
	username: String,
	onUsernameChanged: (String) -> Unit,
	password: String,
	onPasswordChanged: (String) -> Unit,
	login: () -> Unit,
	isLoading: Boolean
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
						Icon(Icons.Default.Person)
					}
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
						Icon(Icons.Default.Lock)
					},
					onImeActionPerformed = { action, imeKeyboard ->
						if(action == ImeAction.Done) {
							login()
							imeKeyboard?.hideSoftwareKeyboard()
						}
					},
					visualTransformation = PasswordVisualTransformation()
				)
				Button(
					onClick = {
						login()
					},
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
		}
	}
