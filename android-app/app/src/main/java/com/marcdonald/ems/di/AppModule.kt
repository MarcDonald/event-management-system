package com.marcdonald.ems.di

import android.content.Context
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
}
