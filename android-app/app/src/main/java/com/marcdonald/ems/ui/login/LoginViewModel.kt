package com.marcdonald.ems.ui.login

import androidx.compose.runtime.mutableStateOf
import androidx.hilt.lifecycle.ViewModelInject
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.amazonaws.services.cognitoidentityprovider.model.NotAuthorizedException
import com.amplifyframework.auth.AuthChannelEventName
import com.amplifyframework.auth.cognito.AWSCognitoAuthSession
import com.amplifyframework.core.Amplify
import com.amplifyframework.core.InitializationStatus
import com.amplifyframework.hub.HubChannel
import com.amplifyframework.hub.HubEvent
import com.marcdonald.ems.network.AuthService
import com.marcdonald.ems.ui.login.state.LoginFormValidationState
import timber.log.Timber

class LoginViewModel @ViewModelInject constructor(private val authService: AuthService) :
		ViewModel() {

	private val _signedIn = MutableLiveData(false)
	val signedIn = _signedIn as LiveData<Boolean>

	val username = mutableStateOf("")
	val password = mutableStateOf("")
	val validationState = LoginFormValidationState()
	val isLoading = mutableStateOf(false)

	init {
		Amplify.Hub.subscribe(HubChannel.AUTH) { hubEvent: HubEvent<*> ->
			when(hubEvent.name) {
				InitializationStatus.SUCCEEDED.toString() -> Timber.i("Log: onViewCreated: Auth initialized")
				InitializationStatus.FAILED.toString()    -> Timber.e("Log: onViewCreated: Auth failed")
				else                                      -> {
					when(AuthChannelEventName.valueOf(hubEvent.name)) {
						AuthChannelEventName.SIGNED_IN       -> initAuthService()
						AuthChannelEventName.SIGNED_OUT      -> _signedIn.postValue(false)
						AuthChannelEventName.SESSION_EXPIRED -> _signedIn.postValue(false)
					}
				}
			}
		}
	}

	fun onUsernameChanged(newValue: String) {
		username.value = newValue
		validationState.usernameValid.value = newValue.isNotEmpty()
		if(!validationState.usernameTouched.value) validationState.usernameTouched.value = true
		if(validationState.rejectedReason.value != null) validationState.rejectedReason.value = null
	}

	fun onPasswordChanged(newValue: String) {
		password.value = newValue
		validationState.passwordValid.value = newValue.length > 7
		if(!validationState.passwordTouched.value) validationState.passwordTouched.value = true
		if(validationState.rejectedReason.value != null) validationState.rejectedReason.value = null
	}

	fun login() {
		isLoading.value = true

		Amplify.Auth.signIn(username.value, password.value,
			{ result ->
				Timber.i("Log: login: isSignInComplete ${result.isSignInComplete}")
				isLoading.value = false
			},
			{ error ->
				Timber.e("Log: login: $error")
				if(error.cause is NotAuthorizedException) {
					validationState.rejectedReason.value = "Invalid username or password"
				} else {
					validationState.rejectedReason.value = "Unknown Error"
				}
				password.value = ""
				validationState.passwordValid.value = false
				isLoading.value = false
			}
		)
	}

	private fun initAuthService() {
		Amplify.Auth.fetchAuthSession(
			{ result ->
				val cognitoAuthSession = result as AWSCognitoAuthSession
				authService.setDetails(cognitoAuthSession)
				_signedIn.postValue(true)
			},
			{ error -> Timber.e("Log: onViewCreated: $error") }
		)
	}
}