package com.marcdonald.ems.ui.theme

import androidx.compose.material.Typography
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.font.font
import androidx.compose.ui.text.font.fontFamily
import com.marcdonald.ems.R

private val Montserrat = fontFamily(
	font(R.font.montserrat_thin, FontWeight.W100),
	font(R.font.montserrat_extralight, FontWeight.W200),
	font(R.font.montserrat_light, FontWeight.W300),
	font(R.font.montserrat_regular, FontWeight.W400),
	font(R.font.montserrat_medium, FontWeight.W500),
	font(R.font.montserrat_semibold, FontWeight.W600),
	font(R.font.montserrat_bold, FontWeight.W700),
	font(R.font.montserrat_extrabold, FontWeight.W800),
	font(R.font.montserrat_black, FontWeight.W900),
)

val typography = Typography(
	defaultFontFamily = Montserrat
)
