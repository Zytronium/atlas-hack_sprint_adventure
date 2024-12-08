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
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.google.firebase.firestore.FirebaseFirestore
import com.zytronium.djkspaceadventures.MusicPlayers.clickSound
import com.zytronium.djkspaceadventures.MusicPlayers.music

class MainActivity : AppCompatActivity(), Application.ActivityLifecycleCallbacks {
    // UI elements
    private lateinit var typeSpeedIncrementer: View
    private lateinit var storyTextView: TextView
    private lateinit var option1Btn: TextView
    private lateinit var option2Btn: TextView
    private lateinit var option3Btn: TextView
    private lateinit var option4Btn: TextView
    private lateinit var option5Btn: TextView
    private lateinit var option6Btn: TextView
    private lateinit var background: ConstraintLayout
    private lateinit var backgroundAnimation: ScaledVideoView

    // Misc variables
    private lateinit var firestore: FirebaseFirestore
    private var currentPath: String = "power:0"
    private var stories: MutableMap<String, Story> = emptyMap<String, Story>().toMutableMap()
    private var switchingActivities = false
    private var typeSpeed: Int = 1 // 1 = Normal, 2 = Fast, 3 = Instant

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }
        fullscreenWithNoCutout(window) // Fullscreen mode

        // Initialize UI element references
        typeSpeedIncrementer = findViewById(R.id.typeSpeedIncrementer)
        storyTextView = findViewById(R.id.story_text)
        option1Btn = findViewById(R.id.button1)
        option2Btn = findViewById(R.id.button2)
        option3Btn = findViewById(R.id.button3)
        option4Btn = findViewById(R.id.button4)
        option5Btn = findViewById(R.id.button5)
        option6Btn = findViewById(R.id.button6)
        backgroundAnimation = findViewById(R.id.backgroundAnimation)
        background = findViewById(R.id.main)

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

        // Load data from our online Firestore database and load it into the UI elements.
        firestore = FirebaseFirestore.getInstance()
        fetchStoryData()
    }

    private fun type(
        msg: String,
        textElement: TextView = storyTextView,
        charIntervalNormal: Int = 40,
        charIntervalFast: Int = 8,
        pauseTimeNormal: Int = 250,
        pauseTimeFast: Int = 50,
        pauseChar: String? = "║",
        autoPauseOnPunctuation: Boolean = true,
        punctuationPauseMap: Map<String, Int> = mapOf(
            "," to 50,
            "." to 100,
            ";" to 75,
            ":" to 100,
            "?" to 115,
            "!" to 115,
            "—" to 100
        ),
        typeProgress: Int = 0
    ) {
        // Stop if the message has been fully typed
        if (typeProgress >= msg.length) {
            typeSpeedIncrementer.visibility = View.GONE
            typeSpeed = 1
            return
        }

        typeSpeedIncrementer.visibility = View.VISIBLE

        if (typeProgress == 0)
            textElement.text = ""

        // If typing effect is off in settings or type speed is instant (3+), instantly type the entire message
        if(/*!settings.doTypeEffect ||*/ typeSpeed >= 3) {
            textElement.text = pauseChar?.let { msg.replace(it, "") }
            typeSpeedIncrementer.visibility = View.GONE
            typeSpeed = 1
        } else { // If the typing effect is turned on and the type speed is not instant, ...
            val char = msg.toCharArray()[typeProgress]

            // If the current char is the pause char, then pause briefly and skip this char
            if(pauseChar != null && char.toString() == pauseChar) {
                // Get the proper delay length based on typeSpeed (pause char delay)
                val delay = when (typeSpeed) {
                    1 -> pauseTimeNormal
                    2 -> pauseTimeFast
                    else -> 0 // TypeSpeed should never be anything but 1 or 2 here, but added this else branch just in case.
                }

                // If type speed isn't instant (ideally, this should always be true here. But its better to be safe than sorry), ...
                if(delay > 0) {
                    // Pause for the proper amount of time, skip this character, and continue the recursive loop
                    Handler(Looper.getMainLooper()).postDelayed({
                        type(
                            msg,
                            textElement,
                            charIntervalNormal,
                            charIntervalFast,
                            pauseTimeNormal,
                            pauseTimeFast,
                            pauseChar,
                            autoPauseOnPunctuation,
                            punctuationPauseMap,
                            typeProgress + 1
                        )
                    }, delay.toLong())
                } else { // If delay is somehow instant (should never be true), ...
                    // Instantly skip this character and continue the recursive loop
                    type(
                        msg,
                        textElement,
                        charIntervalNormal,
                        charIntervalFast,
                        pauseTimeNormal,
                        pauseTimeFast,
                        pauseChar,
                        autoPauseOnPunctuation,
                        punctuationPauseMap,
                        typeProgress + 1
                    )
                }
            } else { // If the current char is not the pause char, ...
                // Get the proper delay length based on typeSpeed (non-pause char delay)
                var delay = when (typeSpeed) {
                    1 -> charIntervalNormal
                    2 -> charIntervalFast
                    else -> 0 // TypeSpeed should never be anything but 1 or 2 here, but added this else branch just in case.
                }

                // If auto pausing on punctuation characters is enabled and this is one of the given punctuation chars, ...
                if (autoPauseOnPunctuation && char.toString() in punctuationPauseMap.keys) {
                    // Add the proper delay based on this character
                    delay += when (typeSpeed) {
                        1 -> punctuationPauseMap[char.toString()]!! // normal pause time
                        2 -> punctuationPauseMap[char.toString()]!! / 5 // 5 times shorter pause time (consistent with default fast delay times being 5 times shorter than normal delay times in function prototype)
                        else -> 0 // TypeSpeed should never be anything but 1 or 2 here, but added this else branch just in case.
                    }
                }

                // If type speed isn't instant (ideally, this should always be true here. But its better to be safe than sorry), ...
                if(delay > 0) {
                    // Add this character to the given text view
                    textElement.text = "${textElement.text}${char}"

                    // Pause for the proper amount of time before continuing the recursive loop
                    Handler(Looper.getMainLooper()).postDelayed({

                        // Continue the recursive loop
                        type(
                            msg,
                            textElement,
                            charIntervalNormal,
                            charIntervalFast,
                            pauseTimeNormal,
                            pauseTimeFast,
                            pauseChar,
                            autoPauseOnPunctuation,
                            punctuationPauseMap,
                            typeProgress + 1
                        )
                    }, delay.toLong())
                } else { // If delay is somehow instant (should never be true), ...
                    // Instantly type this character and continue the recursive loop

                    // Add this character to the given text view
                    textElement.text = "${textElement.text}${char}"

                    // Continue the recursive loop
                    type(
                        msg,
                        textElement,
                        charIntervalNormal,
                        charIntervalFast,
                        pauseTimeNormal,
                        pauseTimeFast,
                        pauseChar,
                        autoPauseOnPunctuation,
                        punctuationPauseMap,
                        typeProgress + 1
                    )
                }
            }
        }
    }

    private fun fetchStoryData() {
        var storyLoaded = false
        firestore.collection("stories").document("Sci fi").get()
            .addOnSuccessListener { snapshot ->
                // Check if the document exists
                if (snapshot.exists()) {
                    // Use the snapshot data to convert into a StoryEvent object
                    val story = snapshot.toObject(Story::class.java)

                    // Check if the event was successfully mapped
                    if (story != null) {
                        // Add this story to the stories map and start the story
                        stories[story.title] = story
                        if(!storyLoaded && story.title == currentPath.replace(":0", "")) {
                            storyLoaded = true
                            updateStory()
                        } else {
                            storyTextView.text = "Error: There was a problem trying to load story data. Please try again later."
                            printStoryMaps() // debug print
                        }
                    } else {
                        println("Error: Failed to map document to StoryEvent")
                    }
                } else {
                    println("Error: Document does not exist")
                }
            }
            .addOnFailureListener { exception ->
                // Handle the failure
                println("Error fetching data: ${exception.message}")
            }
    }

    private fun printStoryMaps() {
        println("--------------------\nStory Map:\n")
        stories.forEach {
            val story = it.value
            val options = emptyMap<String?, String?>().toMutableMap()
            println("\nStory title: ${it.key}")
            story.events.forEach {
                val event = it.value
                if(event.options.isNotEmpty()) {
                    for (i in 0 until event.options.size) {
                        try {
                            options[event.options[i]] = event.optionPaths[i]
                        } catch (e: IndexOutOfBoundsException) {
                            options[event.options[i]] = event.path + (i + 1).toString()
                        }
                    }

                    println(
                        "path: ${event.path}\n" +
                                "type: ${event.type}\n" +
                                "text: \"${event.storyText}\"\n" +
                                "options: \"$options\""
                    )
                } else {
                    println(
                        "path: ${event.path}\n" +
                                "type: ${event.type}\n" +
                                "text: \"${event.storyText}\""
                    )
                }
                println('\n')
            }
        }
        println("\n--------------------\n")
    }

    private fun updateStory() {
        val event = getCurrentEvent()

        // Load the data for the current story event into the UI elements (story text & buttons)
        type(event.storyText, storyTextView)
        updateBackground()
        updateOptions(event)
    }

    private fun updateBackground() {
        backgroundAnimation.setBackgroundColor(when(getCurrentEvent().type) {
            StoryEventType.Bad -> getColor(R.color.background_bad)
            StoryEventType.Good -> getColor(R.color.background_good)
            StoryEventType.BadEnding, StoryEventType.Error -> getColor(R.color.background_loose)
            StoryEventType.GoodEnding -> getColor(R.color.background_win)
            StoryEventType.NeutralEnding -> getColor(R.color.background_neutral_ending)
            else -> getColor(R.color.background_normal)
        })
    }

    private fun getCurrentEvent(): StoryEvent {
        val currentStoryPrefix = currentPath.split(":")[0]
        val pathNumber = currentPath.split(":")[1]

        return stories[currentStoryPrefix]?.events?.get(pathNumber) ?: notFoundPage()
    }

    private fun getEvent(path: String): StoryEvent? {
        val story = path.split(":")[0]

        return stories[story]?.events?.get(path.split(":")[1])
    }

    private fun notFoundPage(): StoryEvent {
        println("Error 404") // TODO: debug code; remove later
        println("path: $currentPath") // TODO: debug code; remove later
        return StoryEvent(
            currentStoryRoot().replace("0", "NotFound"),
            StoryEventType.Error,
            "Error 404: Story event not found."
        )
    }

    private fun updateOptions(event: StoryEvent) {
        val options = getOptions(event)
        val optionalBtns = arrayOf(option1Btn, option2Btn, option3Btn, option4Btn, option5Btn, option6Btn)

        // Create buttons for every option for this event, or create the standard default buttons for story endings if no options are present.
        for (i in options.indices) {
            val btn = optionalBtns[i]
            btn.text = options[i]?.first
            btn.visibility = if (options[i]?.first == null) View.GONE else View.VISIBLE
            btn.setOnClickListener {
                val path = options[i]?.second ?: currentPath // "Menu:0"
                val button_text = options[i]?.first ?: ""
                val handler = Handler(Looper.getMainLooper())

                // (Attempt to) prevent clicking the button twice (which can be done on accident if when spamming the button)
                btn.setOnClickListener(null)

                // Update the path and progress to the next story event.
                currentPath = path
                println("button pressed. New path: $currentPath") // TODO: debug code; remove later

                // Play a click sound, briefly animate button, and start the text adventure game

                // Play the click sound effect (What did you think this does? Download more RAM?)
                playSound()

                // Vibrate
                vibrate(30L)

                // Create animators for scale X and scale Y for the button being pressed
                val animatorX = ObjectAnimator.ofFloat(btn, View.SCALE_X, 1f, 1.125f)
                val animatorY = ObjectAnimator.ofFloat(btn, View.SCALE_Y, 1f, 1.125f)

                // Set the animation duration
                animatorX.duration = 100
                animatorY.duration = 100

                // Play the animation
                animatorX.start()
                animatorY.start()

                // Second half of animation: retuning scale to 1
                handler.postDelayed({
                    val animator2X = ObjectAnimator.ofFloat(btn, View.SCALE_X, 1.125f, 1f)
                    val animator2Y = ObjectAnimator.ofFloat(btn, View.SCALE_Y, 1.125f, 1f)

                    // Intentionally slightly shorter duration than first half
                    animator2X.duration = 75
                    animator2Y.duration = 75

                    animator2X.start()
                    animator2Y.start()

                    if (path == "Main Menu" && button_text == "Main Menu") {
                        // Navigate to the Main Menu screen and end this one if the option text and path are "Main Menu"
                        switchingActivities = true
                        startActivity(Intent(this@MainActivity, MainMenuActivity::class.java))
                        finish()
                    } else {
                        // Progress to the next story event
                        updateStory()
                    }

                }, 70L)

                // Delays are intentionally shorter than the animation durations because there seems to be a weird additional delay
            }
        }

        // Remove all buttons that are not needed (i.e. the 4th through 5th if there are 3 options and the last story event had 5)
        for (i in options.size until optionalBtns.size) {
            val btn = optionalBtns[i]
            btn.visibility = View.GONE // Remove button visually
            btn.setOnClickListener(null) // Remove on click listener (probably not necessary, but may prevent issues)
        }

    }

    private fun getOptions(event: StoryEvent): Array<Pair<String?, String?>?> {
        if (event.options.isEmpty()) {
            return getDefaultOptions(event.type)
        } else {
            var options: Array<Pair<String?, String?>?> = emptyArray()

            for (i in 0 until event.options.size) {
                options = try {
                    options.plusElement(Pair(event.options[i], event.optionPaths[i]))
                } catch (e: IndexOutOfBoundsException) {
                    options.plusElement(Pair(event.options[i], event.path + (i + 1).toString()))
                }
            }
            return options
        }

    }

    private fun getDefaultOptions(type: StoryEventType): Array<Pair<String?, String?>?> {
        return when (type) {
            StoryEventType.GoodEnding, StoryEventType.BadEnding, StoryEventType.NeutralEnding, StoryEventType.Error -> arrayOf(
                "Main Menu" to "Main Menu",
                "Restart" to currentStoryRoot(),
                if (type != StoryEventType.Error) "Go Back" to currentPath.dropLast(1) else null to null
            )
            else -> arrayOfNulls(6) // Normal flow
        }
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

    private fun playMusic() {
        music!!.start()
    }

    private fun pauseMusic() {
        music!!.pause()
    }

    private fun playSound() {
        clickSound!!.start()
    }

    private fun currentStoryRoot(): String = currentPath.split(":")[0] + ":0"

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

    fun incrementTypingSpeed(view: View) {
        typeSpeed++
    }
}

class Story(
    var title: String = "Unnamed Story",
    var events: Map<String, StoryEvent> = emptyMap()// or Map<String, Any?>
)

class StoryEvent(
    var path: String = "",
    var type: StoryEventType = StoryEventType.Normal,
    var storyText: String = "",
    var options: List<String?> = emptyList(),
    var optionPaths: List<String?> = emptyList()
)

enum class StoryEventType {
    Normal, Good, Bad, NeutralEnding, GoodEnding, BadEnding, Error
}
