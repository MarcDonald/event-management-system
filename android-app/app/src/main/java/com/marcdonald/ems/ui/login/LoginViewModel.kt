package com.marcdonald.ems.ui.login

import androidx.compose.runtime.mutableStateOf
import androidx.hilt.lifecycle.ViewModelInject
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.amazonaws.services.cognitoidentityprovider.model.NotAuthorizedException
import com.amplifyframework.auth.AuthChannelEventName
import com.amplifyframework.core.Amplify
import com.amplifyframework.core.InitializationStatus
import com.amplifyframework.hub.HubChannel
import com.amplifyframework.hub.HubEvent
import timber.log.Timber

class LoginViewModel @ViewModelInject constructor() : ViewModel() {

	private val _signedIn = MutableLiveData(false)
	val signedIn = _signedIn as LiveData<Boolean>

	val username = mutableStateOf("")
	val password = mutableStateOf("")
	val isLoading = mutableStateOf(false)

	init {
		Amplify.Hub.subscribe(HubChannel.AUTH) { hubEvent: HubEvent<*> ->
			when(hubEvent.name) {
				InitializationStatus.SUCCEEDED.toString() -> Timber.i("Log: onViewCreated: Auth initialized")
				InitializationStatus.FAILED.toString() -> Timber.e("Log: onViewCreated: Auth failed")
				else                                      -> {
					when(AuthChannelEventName.valueOf(hubEvent.name)) {
						AuthChannelEventName.SIGNED_IN -> _signedIn.postValue(true)
						AuthChannelEventName.SIGNED_OUT -> _signedIn.postValue(false)
						AuthChannelEventName.SESSION_EXPIRED -> _signedIn.postValue(false)
					}
				}
			}
		}
	}

	fun onUsernameChanged(newValue: String) {
		username.value = newValue
	}

	fun onPasswordChanged(newValue: String) {
		password.value = newValue
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
					// TODO show error
					password.value = ""
				}
				isLoading.value = false
			}
		)
	}
}