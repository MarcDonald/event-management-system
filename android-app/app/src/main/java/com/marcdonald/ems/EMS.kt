package com.marcdonald.ems

import android.app.Application
import com.amplifyframework.AmplifyException
import com.amplifyframework.auth.cognito.AWSCognitoAuthPlugin
import com.amplifyframework.core.Amplify
import dagger.hilt.android.HiltAndroidApp
import timber.log.Timber

@HiltAndroidApp
class EMS : Application() {

	override fun onCreate() {
		super.onCreate()
		if(BuildConfig.DEBUG) {
			Timber.plant(Timber.DebugTree())
			Timber.i("Log: Timber Debug Tree Planted")
		}

		try {
			Amplify.addPlugin(AWSCognitoAuthPlugin())
			Amplify.configure(applicationContext)
			Timber.i("Log: onCreate: Initialized Amplify")
		} catch(error: AmplifyException) {
			Timber.e("Log: onCreate: Could not initialize Amplify $error")
		}
	}
}