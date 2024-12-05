package com.zytronium.textadventuregame

import android.view.WindowManager
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

fun fullscreenWithNoCutout(window: android.view.Window) {
    val windowInsetsController =
        ViewCompat.getWindowInsetsController(window.decorView) ?: return
    windowInsetsController.systemBarsBehavior =
        WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    windowInsetsController.hide(WindowInsetsCompat.Type.systemBars())
    windowInsetsController.hide(WindowInsetsCompat.Type.displayCutout())
    window.setFlags( // needed because else it will show the cutout as white
        WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
        WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
    )
}
