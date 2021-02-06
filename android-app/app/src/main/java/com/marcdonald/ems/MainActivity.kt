package com.marcdonald.ems

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.marcdonald.ems.utils.SystemUiController
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : AppCompatActivity() {

	lateinit var systemUi: SystemUiController

	override fun onCreate(savedInstanceState: Bundle?) {
		super.onCreate(savedInstanceState)
		systemUi = SystemUiController(window)
		setContentView(R.layout.activity_main)
	}
}
