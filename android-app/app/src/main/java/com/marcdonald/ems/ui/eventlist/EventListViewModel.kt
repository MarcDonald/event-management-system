package com.marcdonald.ems.ui.eventlist

import androidx.compose.runtime.MutableState
import androidx.compose.runtime.mutableStateOf
import androidx.hilt.lifecycle.ViewModelInject
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.amplifyframework.core.Amplify
import com.marcdonald.ems.model.Event
import com.marcdonald.ems.model.Position
import com.marcdonald.ems.network.AuthService
import com.marcdonald.ems.repository.EventsRepository
import kotlinx.coroutines.launch
import timber.log.Timber

class EventListViewModel @ViewModelInject constructor(private val repository: EventsRepository, private val authService: AuthService) :
		ViewModel() {

	val loggedInUserName: MutableState<String> = mutableStateOf("...")
	val loggedInRole: MutableState<String> = mutableStateOf("...")
	val events: MutableState<List<Event>> = mutableStateOf(listOf())
	val showLoading: MutableState<Boolean> = mutableStateOf(true)
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
		viewModelScope.launch {
			showLoading.value = true
			val response = repository.getUpcoming()
			events.value = response
			showLoading.value = false
		}
	}

	fun logout() {
		authService.clearDetails()
		Amplify.Auth.signOut(
			{ _signedOut.postValue(true) },
			{ error -> Timber.e("Log: logout: $error") }
		)
	}

	fun determinePositionAtEvent(eventId: String): Position {
		if(authService.username == null) throw Exception("Username in authService is null")
		events.value.find { event ->
			event.eventId == eventId
		}?.let { event ->
			event.staff.find { staff -> staff.staffMember.username == authService.username }?.let { staff ->
				return staff.position
			}
		}
		throw Exception("Could not find user as a steward on this event")
	}
}