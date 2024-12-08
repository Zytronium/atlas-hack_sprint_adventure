package com.zytronium.djkspaceadventures

import android.media.MediaPlayer

// This object allows music to be played globally without being interrupted or no longer controllable when the user switches views.
object MusicPlayers {
    var music: MediaPlayer? = null
    var clickSound: MediaPlayer? = null
    var universeEntrance: MediaPlayer? = null
}
