package com.marcdonald.ems.ui.startup

import androidx.hilt.lifecycle.ViewModelInject
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.amplifyframework.auth.cognito.AWSCognitoAuthSession
import com.amplifyframework.core.Amplify
import com.marcdonald.ems.network.AuthService
import timber.log.Timber

class StartupViewModel @ViewModelInject constructor(private val authService: AuthService) :
		ViewModel() {

	private val _isLoggedIn = MutableLiveData<Boolean?>(null)
	val isLoggedIn = _isLoggedIn as LiveData<Boolean?>

	fun checkLoginStatus() {
		Amplify.Auth.fetchAuthSession(
			{ result ->
				val cognitoAuthSession = result as AWSCognitoAuthSession
				Timber.i("Log: checkLoginStatus: ${cognitoAuthSession.isSignedIn}")
				authService.setDetails(cognitoAuthSession)
				_isLoggedIn.postValue(cognitoAuthSession.isSignedIn)
			},
			{ error -> Timber.e("Log: onViewCreated: $error") }
		)
	}
}