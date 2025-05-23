package com.zytronium.djkspaceadventures

import android.animation.ObjectAnimator
import android.app.Activity
import android.app.Application
import android.content.Context
import android.content.Intent
import android.net.Uri.parse
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.VibrationEffect
import android.os.Vibrator
import android.view.View
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.zytronium.djkspaceadventures.MusicPlayers.clickSound
import com.zytronium.djkspaceadventures.MusicPlayers.music

class AboutActivity : AppCompatActivity(), Application.ActivityLifecycleCallbacks {

	private lateinit var backgroundAnimation: ScaledVideoView
	private var switchingActivities = false

	override fun onCreate(savedInstanceState: Bundle?) {
		super.onCreate(savedInstanceState)
		enableEdgeToEdge()
		setContentView(R.layout.activity_about)
		ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
			val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
			v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
			insets
		}
		fullscreenWithNoCutout(window)

		backgroundAnimation = findViewById(R.id.backgroundAnimation)

		// Register this as a callback to monitor the application's activity lifecycle events, allowing to, for example, pause music when the app looses focus
		application.registerActivityLifecycleCallbacks(this)

		// Setup the background video player
		backgroundAnimation.setOnPreparedListener { mediaPlayer ->
			backgroundAnimation.setVideoDimensions(mediaPlayer.videoWidth, mediaPlayer.videoHeight)
			mediaPlayer.isLooping = true
			backgroundAnimation.requestLayout()
		}

		// Provide the background video source video and start the video
		backgroundAnimation.setVideoURI(parse("android.resource://" + packageName + "/" + R.raw.background))
		backgroundAnimation.start()

	}

	private fun playMusic() {
		music!!.start()
	}

	private fun pauseMusic() {
		music!!.pause()
	}

	private fun playSound() {
		clickSound!!.start()
	}

	private fun vibrate(time: Long) {
		val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
		if (vibrator.hasVibrator()) {
			if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
				vibrator.vibrate(
					VibrationEffect.createOneShot(
						time,
						VibrationEffect.DEFAULT_AMPLITUDE
					)
				)
			} else vibrator.vibrate(time)
		}
	}

	fun back(view: View) {
		// Play a click sound, briefly animate the button, and start the text adventure game

		// Play the click sound effect (What did you think this does? Download more RAM?)
		playSound()

		// Vibrate
		vibrate(40L)

		// Create animators for scale X and scale Y for the button being pressed
		val animatorX = ObjectAnimator.ofFloat(view, View.SCALE_X, 1f, 1.125f)
		val animatorY = ObjectAnimator.ofFloat(view, View.SCALE_Y, 1f, 1.125f)

		// Set the animation duration
		animatorX.duration = 100
		animatorY.duration = 100

		// Play the animation
		animatorX.start()
		animatorY.start()

		val handler = Handler(Looper.getMainLooper())
		// Second half of animation: retuning scale to 1
		handler.postDelayed({
			val animator2X = ObjectAnimator.ofFloat(view, View.SCALE_X, 1.125f, 1f)
			val animator2Y = ObjectAnimator.ofFloat(view, View.SCALE_Y, 1.125f, 1f)

			// Intentionally slightly shorter duration than first half
			animator2X.duration = 75
			animator2Y.duration = 75

			animator2X.start()
			animator2Y.start()

			val handler2 = Handler(Looper.getMainLooper())
			handler2.postDelayed({
				// Go to the main game activity and close the main menu
				switchingActivities = true
				finish()
			}, 45L)
		}, 70L)

		// Delays are intentionally shorter than the animation durations because there seems to be a weird additional delay
	}

	override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) {
//        TODO("Not yet implemented")
	}

	override fun onActivityStarted(activity: Activity) {
//        TODO("Not yet implemented")
	}

	override fun onActivityResumed(activity: Activity) {
		backgroundAnimation.start()
		playMusic()
	}

	override fun onActivityPaused(activity: Activity) {
		if (!switchingActivities)
			pauseMusic()
	}

	override fun onActivityStopped(activity: Activity) {
//        TODO("Not yet implemented")
	}

	override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) {
//        TODO("Not yet implemented")
	}

	override fun onActivityDestroyed(activity: Activity) {
//        TODO("Not yet implemented")
	}

}