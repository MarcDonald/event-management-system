package com.marcdonald.ems.ui.assistancerequest.components.requestsdialog

import androidx.compose.runtime.MutableState
import androidx.compose.runtime.mutableStateOf
import androidx.hilt.lifecycle.ViewModelInject
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.marcdonald.ems.utils.exceptions.AuthException
import com.marcdonald.ems.model.AssistanceRequest
import com.marcdonald.ems.repository.EventsRepository
import kotlinx.coroutines.launch
import timber.log.Timber

class RequestsDialogViewModel @ViewModelInject constructor(private val eventsRepository: EventsRepository) :
		ViewModel() {

	val requests: MutableState<List<AssistanceRequest>> = mutableStateOf(emptyList())
	val isLoading: MutableState<Boolean> = mutableStateOf(true)
	val error: MutableState<String?> = mutableStateOf(null)

	fun passArguments(eventId: String, positionId: String) {
		viewModelScope.launch {
			isLoading.value = true
			try {
				val result = eventsRepository.getAssistanceRequestsForPosition(eventId, positionId).sortedByDescending { it.time }
				requests.value = result
			} catch(e: AuthException) {
				error.value = "Error Authenticating User"
			} catch(e: Exception) {
				error.value = e.message
				Timber.e("Log: passArguments: $e")
			} finally {
				isLoading.value = false
			}
		}
	}
}