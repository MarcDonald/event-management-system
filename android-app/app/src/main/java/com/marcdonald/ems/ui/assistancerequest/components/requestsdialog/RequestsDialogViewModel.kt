package com.marcdonald.ems.ui.assistancerequest.components.requestsdialog

import androidx.compose.runtime.MutableState
import androidx.compose.runtime.mutableStateOf
import androidx.hilt.lifecycle.ViewModelInject
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.marcdonald.ems.model.AssistanceRequest
import com.marcdonald.ems.repository.EventsRepository
import kotlinx.coroutines.launch

class RequestsDialogViewModel @ViewModelInject constructor(private val eventsRepository: EventsRepository) : ViewModel() {

	val requests: MutableState<List<AssistanceRequest>> = mutableStateOf(emptyList())
	val isLoading: MutableState<Boolean> = mutableStateOf(true)

	fun passArguments(eventId: String, positionId: String) {
		viewModelScope.launch {
			isLoading.value = true
			val result = eventsRepository.getAssistanceRequestsForPosition(eventId, positionId).sortedByDescending { it.time }
			requests.value = result
			isLoading.value = false
		}
	}
}