package com.marcdonald.ems.ui.startup

import androidx.hilt.lifecycle.ViewModelInject
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.amplifyframework.core.Amplify
import timber.log.Timber

class StartupViewModel @ViewModelInject constructor() : ViewModel() {

	private val _isLoggedIn = MutableLiveData<Boolean?>(null)
	val isLoggedIn = _isLoggedIn as LiveData<Boolean?>

	fun checkLoginStatus() {
		Amplify.Auth.fetchAuthSession(
			{ result ->
				Timber.i("Log: checkLoginStatus: ${result.isSignedIn}")
				_isLoggedIn.postValue(result.isSignedIn)
			},
			{ error -> Timber.e("Log: onViewCreated: $error") }
		)
	}
}