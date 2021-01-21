package com.marcdonald.ems.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material.MaterialTheme
import androidx.compose.material.darkColors
import androidx.compose.material.lightColors
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorPalette = darkColors(
	primary = brandDark,
	primaryVariant = brandDarkVariant,
	secondary = teal200,
	background = backgroundDark,
	surface = surfaceDark,
	error = errorDark,
	onPrimary = Color.White,
)

private val LightColorPalette = lightColors(
	primary = brandLight,
	primaryVariant = brandLightVariant,
	secondary = teal200,
	error = errorLight,
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