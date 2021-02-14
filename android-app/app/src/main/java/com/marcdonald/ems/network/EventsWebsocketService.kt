package com.marcdonald.ems.network

import com.squareup.moshi.JsonAdapter
import com.squareup.moshi.Moshi
import okhttp3.*
import timber.log.Timber
import javax.inject.Inject

class EventsWebsocketService @Inject constructor(
	private val client: OkHttpClient,
	private val venueStatusWebsocketAdapter: JsonAdapter<VenueStatusWebsocketMessage>,
	private val venueStatusWebsocketUrl: String
	) {
	fun connectToVenueStatusWebsocket(idToken: String, eventId: String, onMessage: (VenueStatusWebsocketMessage) -> Unit): WebSocket {
		val request = Request.Builder().url("${venueStatusWebsocketUrl}?eventId=${eventId}&Authorization=${idToken}").build()
		return client.newWebSocket(request, object : WebSocketListener() {
			override fun onOpen(webSocket: WebSocket, response: Response) {
				Timber.i("Log: onOpen: Open")
			}

			override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
				Timber.i("Log: onClosed: Closed")
			}

			override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
				Timber.i("Log: onClosing: Closing")
			}

			override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
				Timber.i("Log: onFailure: Failure $t")
			}

			override fun onMessage(webSocket: WebSocket, text: String) {
				venueStatusWebsocketAdapter.fromJson(text)?.let { onMessage(it) }
			}
		})
	}
}