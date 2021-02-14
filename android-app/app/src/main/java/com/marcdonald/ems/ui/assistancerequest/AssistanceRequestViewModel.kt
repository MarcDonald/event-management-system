package com.marcdonald.ems.ui.assistancerequest

import androidx.compose.runtime.MutableState
import androidx.compose.runtime.mutableStateOf
import androidx.hilt.lifecycle.ViewModelInject
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.amplifyframework.core.Amplify
import com.marcdonald.ems.model.AssistanceRequestType
import com.marcdonald.ems.model.Position
import com.marcdonald.ems.network.AuthService
import com.marcdonald.ems.repository.EventsRepository
import com.marcdonald.ems.utils.VenueStatus
import kotlinx.coroutines.launch
import okhttp3.*
import timber.log.Timber

class AssistanceRequestViewModel @ViewModelInject constructor(private val authService: AuthService, private val eventsRepository: EventsRepository) :
		ViewModel() {

	val isLoading = mutableStateOf(true)
	val venueStatus: MutableState<VenueStatus> = mutableStateOf(VenueStatus.Low())
	val position: MutableState<Position?> = mutableStateOf(null)
	private val _signedOut: MutableLiveData<Boolean> = MutableLiveData(false)
	val signedOut = _signedOut as LiveData<Boolean>
	var venueStatusWebsocket: WebSocket? = null

	private var eventId: String? = null

	fun passArguments(positionName: String, positionId: String, eventId: String) {
		viewModelScope.launch { ->
			isLoading.value = true
			try {
				this@AssistanceRequestViewModel.position.value = Position(positionId, positionName)
				this@AssistanceRequestViewModel.eventId = eventId
				refresh()
				connectToVenueStatusWebsocket()
			} catch(e: Exception) {
				Timber.e("Log: passArguments: $e")
			}
			isLoading.value = false
		}
	}

	fun refresh() {
		viewModelScope.launch {
			isLoading.value = true
			try {
				eventId?.let { venueStatus.value = eventsRepository.getStatus(it) }
			} catch(e: Exception) {
				Timber.e("Log: refresh: $e")
			}
		}
	}

	fun requestAssistance(type: AssistanceRequestType) {
		viewModelScope.launch {
			try {
				eventId?.let { eventId ->
					position.value?.let { pos ->
						eventsRepository.sendAssistanceRequest(eventId, pos, type)
					}
				}
			} catch(e: Exception) {
				Timber.e("Log: requestAssistance: $e")
			}
		}
		Timber.i("Log: requestAssistance: ${type.name}")
	}

	fun logout() {
		authService.clearDetails()
		Amplify.Auth.signOut(
			{ _signedOut.postValue(true) },
			{ error -> Timber.e("Log: logout: $error") }
		)
	}

	fun connectToVenueStatusWebsocket() {
		Timber.i("Log: connectToVenueStatusWebsocket: Start")
		if(eventId != null && venueStatusWebsocket == null) {
			Timber.i("Log: connectToVenueStatusWebsocket: Has eventId")
			venueStatusWebsocket = eventsRepository.connectToVenueStatusWebsocket(eventId!!) { newVenueStatus ->
				venueStatus.value = newVenueStatus
			}
		}
	}

	fun closeVenueStatusWebsocketConnection() {
		Timber.i("Log: closeVenueStatusWebsocketConnection: Start")
		venueStatusWebsocket?.let {
			Timber.i("Log: closeVenueStatusWebsocketConnection: Exists, closing")
			it.close(1001, "Closing")
			venueStatusWebsocket = null
		}
	}
}