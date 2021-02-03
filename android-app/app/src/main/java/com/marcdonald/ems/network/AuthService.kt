package com.marcdonald.ems.network

import com.amplifyframework.auth.cognito.AWSCognitoAuthSession
import com.amplifyframework.core.Amplify
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthService @Inject constructor() {

	var idToken: String? = null
		private set
	var username: String? = null
		private set

	fun setDetails(authSession: AWSCognitoAuthSession) {
		idToken = authSession.userPoolTokens.value?.idToken
		username = Amplify.Auth.currentUser?.username
	}

	fun clearDetails() {
		idToken = null
		username = null
	}
}