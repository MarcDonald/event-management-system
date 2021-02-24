package com.marcdonald.ems.ui.assistancerequest

import androidx.compose.runtime.MutableState
import androidx.compose.runtime.mutableStateOf
import androidx.hilt.lifecycle.ViewModelInject
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.amplifyframework.auth.AuthChannelEventName
import com.amplifyframework.core.Amplify
import com.amplifyframework.core.InitializationStatus
import com.amplifyframework.hub.HubChannel
import com.amplifyframework.hub.HubEvent
import com.marcdonald.ems.model.AssistanceRequestType
import com.marcdonald.ems.model.Position
import com.marcdonald.ems.model.Supervisor
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
	var supervisors: Array<Supervisor> = emptyArray()
		private set;
	private val _signedOut: MutableLiveData<Boolean> = MutableLiveData(false)
	val signedOut = _signedOut as LiveData<Boolean>
	private var venueStatusWebsocket: WebSocket? = null
	var eventId: String? = null
		private set;

	init {
		Amplify.Hub.subscribe(HubChannel.AUTH) { hubEvent: HubEvent<*> ->
			when(hubEvent.name) {
				InitializationStatus.SUCCEEDED.toString() -> Timber.i("Log: assistanceRequestViewModel: Auth Hub initialized")
				InitializationStatus.FAILED.toString() -> Timber.e("Log: assistanceRequestViewModel: Auth Hub failed")
				else                                      -> {
					when(AuthChannelEventName.valueOf(hubEvent.name)) {
						AuthChannelEventName.SIGNED_OUT -> {
							authService.clearDetails()
							_signedOut.postValue(true)
						}
						AuthChannelEventName.SESSION_EXPIRED -> {
							authService.clearDetails()
							_signedOut.postValue(true)
						}
						else                                 -> {
							_signedOut.postValue(false)
						}
					}
				}
			}
		}
	}

	fun passArguments(positionName: String, positionId: String, eventId: String, supervisors: Array<Supervisor>) {
		viewModelScope.launch { ->
			isLoading.value = true
			try {
				this@AssistanceRequestViewModel.position.value = Position(positionId, positionName)
				this@AssistanceRequestViewModel.eventId = eventId
				this@AssistanceRequestViewModel.supervisors = supervisors
				eventId.let { venueStatus.value = eventsRepository.getStatus(it) }
				connectToVenueStatusWebsocket()
			} catch(e: Exception) {
				Timber.e("Log: passArguments: $e")
			}
			isLoading.value = false
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

	fun connectToVenueStatusWebsocket() {
		if(eventId != null && venueStatusWebsocket == null) {
			venueStatusWebsocket = eventsRepository.connectToVenueStatusWebsocket(eventId!!) { newVenueStatus ->
				venueStatus.value = newVenueStatus
			}
		}
	}

	fun closeVenueStatusWebsocketConnection() {
		venueStatusWebsocket?.let {
			it.close(1001, "Closing")
			venueStatusWebsocket = null
		}
	}
}