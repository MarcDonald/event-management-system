package com.marcdonald.ems.ui.assistancerequest

import androidx.compose.runtime.MutableState
import androidx.compose.runtime.mutableStateOf
import androidx.hilt.lifecycle.ViewModelInject
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.amplifyframework.core.Amplify
import com.marcdonald.ems.model.AssistanceRequestType
import com.marcdonald.ems.model.Position
import com.marcdonald.ems.utils.VenueStatus
import timber.log.Timber

class AssistanceRequestViewModel @ViewModelInject constructor() : ViewModel() {

	val isLoading = mutableStateOf(true)
	val venueStatus: MutableState<VenueStatus> = mutableStateOf(VenueStatus.Low())
	val position: MutableState<Position> = mutableStateOf(Position("", ""))
	private val _signedOut: MutableLiveData<Boolean> = MutableLiveData(false)
	val signedOut = _signedOut as LiveData<Boolean>

	fun retrieveEventData(eventId: String?) {
		// TODO
		eventId?.let {
			if(eventId == "abc-123") {
				venueStatus.value = VenueStatus.Low()
			} else {
				venueStatus.value = VenueStatus.High()
			}
			position.value = Position("abc-123", "Door 18")
			isLoading.value = false
		}
	}

	fun requestAssistance(type: AssistanceRequestType) {
		// TODO
		Timber.i("Log: requestAssistance: ${type.name}")
	}

	fun logout() {
		Amplify.Auth.signOut(
			{ _signedOut.postValue(true) },
			{ error -> Timber.e("Log: logout: $error") }
		)
	}
}