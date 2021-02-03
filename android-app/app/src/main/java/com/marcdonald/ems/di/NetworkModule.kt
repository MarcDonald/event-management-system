package com.marcdonald.ems.di

import com.marcdonald.ems.EMS
import com.marcdonald.ems.R
import com.marcdonald.ems.network.EventsService
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.components.ApplicationComponent
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import javax.inject.Singleton

@Module
@InstallIn(ApplicationComponent::class)
object NetworkModule {

	@Singleton
	@Provides
	fun provideMoshi(): Moshi {
		return Moshi.Builder().add(KotlinJsonAdapterFactory()).build()
	}

	@Singleton
	@Provides
	fun provideLoggingInterceptor(): HttpLoggingInterceptor {
		return HttpLoggingInterceptor().apply {
			this.level = HttpLoggingInterceptor.Level.BODY
		}
	}

	@Singleton
	@Provides
	fun provideOkHttpClient(interceptor: HttpLoggingInterceptor): OkHttpClient {
		return OkHttpClient.Builder().apply {
			this.addInterceptor(interceptor)
		}.build()
	}


	@Singleton
	@Provides
	fun provideUpcomingEventsService(application: EMS, moshi: Moshi, client: OkHttpClient): EventsService {
		val baseUrl = application.resources.getString(R.string.baseApiRoute)
		return Retrofit.Builder()
			.baseUrl(baseUrl)
			.addConverterFactory(MoshiConverterFactory.create(moshi))
			.client(client)
			.build()
			.create(EventsService::class.java)
	}
}