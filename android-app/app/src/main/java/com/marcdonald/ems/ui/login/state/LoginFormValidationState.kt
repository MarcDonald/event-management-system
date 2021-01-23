package com.marcdonald.ems.ui.login.state

import androidx.compose.runtime.MutableState
import androidx.compose.runtime.mutableStateOf

class LoginFormValidationState(
	val usernameTouched: MutableState<Boolean> = mutableStateOf(false),
	val usernameValid: MutableState<Boolean> = mutableStateOf(false),
	val passwordTouched: MutableState<Boolean> = mutableStateOf(false),
	val passwordValid: MutableState<Boolean> = mutableStateOf(false),
	val rejectedReason: MutableState<String?> = mutableStateOf(null)
)
