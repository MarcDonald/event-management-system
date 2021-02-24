package com.marcdonald.ems.ui.assistancerequest.components.requestsdialog

import androidx.compose.runtime.MutableState
import androidx.compose.runtime.mutableStateOf
import androidx.hilt.lifecycle.ViewModelInject
import androidx.lifecycle.ViewModel
import com.marcdonald.ems.model.AssistanceRequest
import com.marcdonald.ems.utils.VenueStatus

class RequestsDialogViewModel @ViewModelInject constructor() : ViewModel() {

	val requests: MutableState<List<AssistanceRequest>> = mutableStateOf(emptyList())
}