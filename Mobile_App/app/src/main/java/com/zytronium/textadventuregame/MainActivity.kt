package com.zytronium.textadventuregame

import android.os.Bundle
import android.view.View
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.constraintlayout.widget.ConstraintLayout
import com.google.firebase.firestore.FirebaseFirestore

class MainActivity : AppCompatActivity() {

    private lateinit var storyTextView: TextView
    private lateinit var option1Btn: TextView
    private lateinit var option2Btn: TextView
    private lateinit var option3Btn: TextView
    private lateinit var option4Btn: TextView
    private lateinit var option5Btn: TextView
    private lateinit var option6Btn: TextView
    private lateinit var background: ConstraintLayout

    private lateinit var firestore: FirebaseFirestore
    private var currentPath: String = "power:0"
    private var stories: MutableMap<String, Story> = emptyMap<String, Story>().toMutableMap()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        storyTextView = findViewById(R.id.story_text)
        option1Btn = findViewById(R.id.button1)
        option2Btn = findViewById(R.id.button2)
        option3Btn = findViewById(R.id.button3)
        option4Btn = findViewById(R.id.button4)
        option5Btn = findViewById(R.id.button5)
        option6Btn = findViewById(R.id.button6)
        background = findViewById(R.id.main)

        firestore = FirebaseFirestore.getInstance()

        fetchStoryData()
    }

    private fun fetchStoryData() {
        firestore.collection("stories").document("Sci fi").get()
            .addOnSuccessListener { snapshot ->
                // Check if the document exists
                if (snapshot.exists()) {
                    // Use the snapshot data to convert into a StoryEvent object
                    val story = snapshot.toObject(Story::class.java)

                    // Check if the event was successfully mapped
                    if (story != null) {
                        // Assuming the `path` field in StoryEvent is unique and will be used as a key
                        stories[story.title] = story
                        updateStory()
                    } else {
                        println("Error: Failed to map document to StoryEvent")
                    }
                } else {
                    println("Error: Document does not exist")
                }
//                printStoryMaps() // debug print
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
            println("\n${it.key}:")
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
        val event = getCurrentEvent() ?: notFoundPage()

        storyTextView.text = event.storyText
        updateBackground()
        updateOptions(event)
    }

    private fun updateBackground() {
        background.setBackgroundColor(when(getCurrentEvent()?.type) {
            StoryEventType.Bad, StoryEventType.Error -> getColor(R.color.background_bad)
            StoryEventType.Good -> getColor(R.color.background_good)
            StoryEventType.BadEnding -> getColor(R.color.background_loose)
            StoryEventType.GoodEnding -> getColor(R.color.background_win)
            else -> getColor(R.color.background_normal)
        })
    }

    private fun getCurrentEvent(): StoryEvent? {
        val currentStory = currentPath.split(":")[0]

        return stories[currentStory]?.events?.get(currentPath.split(":")[1])
    }

    private fun getEvent(path: String): StoryEvent? {
        val story = path.split(":")[0]

        return stories[story]?.events?.get(path.split(":")[1])
    }

    private fun notFoundPage(): StoryEvent {
        println("Error 404")
        println(currentPath)
        return StoryEvent(
            currentStoryRoot().replace("0", "NotFound"),
            StoryEventType.Error,
            "Error 404: Story event not found."
        )
    }

    private fun updateOptions(event: StoryEvent) {
        val options = getOptions(event)
        val optionalBtns = arrayOf(option1Btn, option2Btn, option3Btn, option4Btn, option5Btn, option6Btn)
        for (i in options.indices) {
            val btn = optionalBtns[i]
            btn.text = options[i]?.first
            btn.visibility = if (options[i]?.first == null) View.GONE else View.VISIBLE
            btn.setOnClickListener {
                currentPath = options[i]?.second ?: currentPath // "Menu:0"
                println("button pressed. New path: $currentPath") // TODO: debug code; remove later
                updateStory()
            }
        }

        for (i in options.size until optionalBtns.size) {
            val btn = optionalBtns[i]
            btn.visibility = View.GONE // remove button
            btn.setOnClickListener(null) // remove on click listener (probably not necessary, but may prevent issues)
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
                "Main Menu" to "power:0",
                "Restart" to currentStoryRoot(),
                if (type != StoryEventType.Error) "Go Back" to currentPath.dropLast(1) else null to null
            )
            else -> arrayOfNulls(6) // Normal flow
        }
    }

    private fun currentStoryRoot(): String = currentPath.split(":")[0] + ":0"
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
