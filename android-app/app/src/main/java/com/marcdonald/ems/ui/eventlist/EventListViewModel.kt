package com.marcdonald.ems.ui.eventlist

import androidx.compose.runtime.MutableState
import androidx.compose.runtime.mutableStateOf
import androidx.hilt.lifecycle.ViewModelInject
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.amplifyframework.core.Amplify
import com.marcdonald.ems.model.Event
import com.marcdonald.ems.model.Venue
import com.marcdonald.ems.ui.eventlist.components.EventCard
import timber.log.Timber

class EventListViewModel @ViewModelInject constructor() : ViewModel() {

	val loggedInUserName: MutableState<String> = mutableStateOf("...")
	val loggedInRole: MutableState<String> = mutableStateOf("...")
	val events: MutableState<List<Event>> = mutableStateOf(listOf())
	private val _signedOut: MutableLiveData<Boolean> = MutableLiveData(false)
	val signedOut = _signedOut as LiveData<Boolean>

	init {
		Amplify.Auth.fetchUserAttributes(
			{ result ->
				loggedInUserName.value =
					result.find { authUserAttribute -> authUserAttribute.key.keyString == "given_name" }?.value
						.plus(" ")
						.plus(result.find { authUserAttribute -> authUserAttribute.key.keyString == "family_name" }?.value)
				loggedInRole.value = result.find { authUserAttribute -> authUserAttribute.key.keyString == "custom:jobRole" }?.value.toString()
			},
			{ error -> Timber.e("Log: $error") }
		)
	}

	fun loadEvents() {
		events.value = listOf(
			Event(
				"abc-123",
				"A cool event",
				listOf(),
				Venue("def-456", "A cool venue"),
				1611685797,
				1611885797
			),
			Event(
				"abc-124",
				"A cool event 2",
				listOf(),
				Venue("def-456", "A cool venue"),
				1611685797,
				1611885797
			),
			Event(
				"abc-125",
				"Another cool event",
				listOf(),
				Venue("def-456", "A cool venue"),
				1611685797,
				1611885797
			),
		)
	}

	fun logout() {
		Amplify.Auth.signOut(
			{ _signedOut.postValue(true) },
			{ error -> Timber.e("Log: logout: $error") }
		)
	}
}