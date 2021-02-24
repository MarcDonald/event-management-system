package com.marcdonald.ems.ui.assistancerequest.components.supervisorsdialog

import androidx.compose.runtime.MutableState
import androidx.compose.runtime.mutableStateOf
import androidx.hilt.lifecycle.ViewModelInject
import androidx.lifecycle.ViewModel
import com.marcdonald.ems.model.Supervisor

class SupervisorsDialogViewModel @ViewModelInject constructor() : ViewModel() {

	val supervisors: MutableState<List<Supervisor>> = mutableStateOf(emptyList())

	fun passArguments(supervisors: Array<Supervisor>) {
		this.supervisors.value = supervisors.toList()
	}
}