package com.marcdonald.ems.di

import android.app.Activity
import android.content.Context
import android.renderscript.ScriptGroup
import android.view.inputmethod.InputMethodManager
import com.marcdonald.ems.EMS
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.components.ApplicationComponent
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Singleton

@InstallIn(ApplicationComponent::class)
@Module
object AppModule {

	@Singleton
	@Provides
	fun provideApplication(@ApplicationContext app: Context): EMS = app as EMS

	@Singleton
	@Provides
	fun provideInputMethodManager(app: EMS): InputMethodManager = app.getSystemService(Activity.INPUT_METHOD_SERVICE) as InputMethodManager
}
