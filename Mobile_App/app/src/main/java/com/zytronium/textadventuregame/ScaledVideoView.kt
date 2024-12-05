package com.zytronium.textadventuregame

import android.content.Context
import android.util.AttributeSet
import android.widget.VideoView

class ScaledVideoView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : VideoView(context, attrs, defStyleAttr) {

    private var videoWidth: Int = 0
    private var videoHeight: Int = 0

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        val parentWidth = MeasureSpec.getSize(widthMeasureSpec)
        val parentHeight = MeasureSpec.getSize(heightMeasureSpec)

        if (videoWidth == 0 || videoHeight == 0) {
            super.onMeasure(widthMeasureSpec, heightMeasureSpec)
            return
        }

        val videoAspectRatio = videoWidth.toFloat() / videoHeight
        val viewAspectRatio = parentWidth.toFloat() / parentHeight

        if (videoAspectRatio > viewAspectRatio) {
            // If video is wider, crop horizontally
            val scaledHeight = parentHeight
            val scaledWidth = (scaledHeight * videoAspectRatio).toInt()
            val offsetX = (scaledWidth - parentWidth) / 2

            setMeasuredDimension(scaledWidth, scaledHeight)
            scrollTo(offsetX, 0)
        } else {
            // If video is taller, crop vertically
            val scaledWidth = parentWidth
            val scaledHeight = (scaledWidth / videoAspectRatio).toInt()
            val offsetY = (scaledHeight - parentHeight) / 2

            setMeasuredDimension(scaledWidth, scaledHeight)
            scrollTo(0, offsetY)
        }
    }

    fun setVideoDimensions(width: Int, height: Int) {
        videoWidth = width
        videoHeight = height
    }

}
