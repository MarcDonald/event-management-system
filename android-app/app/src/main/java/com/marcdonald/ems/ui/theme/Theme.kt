package com.marcdonald.ems.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material.MaterialTheme
import androidx.compose.material.darkColors
import androidx.compose.material.lightColors
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorPalette = darkColors(
	primary = orange700,
	primaryVariant = orange800,
	secondary = blue800,
	background = darkGray900,
	surface = darkGray800,
	error = red700,
	onPrimary = Color.White,
)

private val LightColorPalette = lightColors(
	primary = orange500,
	primaryVariant = orange600,
	secondary = blue700,
	secondaryVariant = blue800,
	error = red500,
	onPrimary = Color.White
)

@Composable
fun EMSTheme(darkTheme: Boolean = isSystemInDarkTheme(), content: @Composable() () -> Unit) {
	val colors = if(darkTheme) {
		DarkColorPalette
	} else {
		LightColorPalette
	}

	MaterialTheme(
		colors = colors,
		typography = typography,
		shapes = shapes,
		content = content
	)
}