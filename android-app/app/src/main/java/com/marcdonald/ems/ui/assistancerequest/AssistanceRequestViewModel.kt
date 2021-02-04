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
import com.marcdonald.ems.network.EventsService
import com.marcdonald.ems.repository.EventsRepository
import com.marcdonald.ems.utils.VenueStatus
import kotlinx.coroutines.launch
import timber.log.Timber

class AssistanceRequestViewModel @ViewModelInject constructor(private val authService: AuthService, private val eventsRepository: EventsRepository) :
		ViewModel() {

	val isLoading = mutableStateOf(true)
	val venueStatus: MutableState<VenueStatus> = mutableStateOf(VenueStatus.Low())
	val positionName: MutableState<String> = mutableStateOf("")
	private val _signedOut: MutableLiveData<Boolean> = MutableLiveData(false)
	val signedOut = _signedOut as LiveData<Boolean>

	private var positionId: String? = null
	private var eventId: String? = null

	fun passArguments(positionName: String, positionId: String?, eventId: String) {
		viewModelScope.launch { ->
			isLoading.value = true
			try {
				authService.idToken?.let { idToken ->
					val status = eventsRepository.getStatus(eventId)
					venueStatus.value = status
					this@AssistanceRequestViewModel.positionName.value = positionName
					this@AssistanceRequestViewModel.positionId = positionId
					this@AssistanceRequestViewModel.eventId = eventId
				}
			} catch (e: Exception) {
				Timber.e("Log: passArguments: $e")
			}
			isLoading.value = false
		}
	}

	fun requestAssistance(type: AssistanceRequestType) {
		// TODO
		Timber.i("Log: requestAssistance: ${type.name}")
	}

	fun logout() {
		authService.clearDetails()
		Amplify.Auth.signOut(
			{ _signedOut.postValue(true) },
			{ error -> Timber.e("Log: logout: $error") }
		)
	}
}