const anime = window.anime
const CustomEvent = window.CustomEvent

function MouseTracker (options = {
  interval: 16.666
}) {
  this.interval = options.interval
  this.mouseX = 0
  this.mouseY = 0
  this.scrollX = 0
  this.scrollY = 0
  this.recording = null
  this.state = 'initial'
  this.recordedPositions = anime.timeline({
    targets: '.mouse-vuer',
    duration: this.interval,
    autoplay: false,
    complete (anim) {
      // document.querySelector('.mouse-vuer').style.visibility = 'hidden'
    },
    update: (anim) => {
      if (this.state === 'playing') {
        const detail = {
          currentTime: anim.currentTime,
          progress: anim.progress,
          state: this.state
        }
        this.emit('currentTimeChanged', detail)
      }
    }
  })

  this.startTracking = () => {
    window.addEventListener('mousemove', this.trackMouse)
    window.addEventListener('scroll', this.trackScroll)
  }

  this.trackMouse = (pointer) => {
    this.mouseX = pointer.x
    this.mouseY = pointer.y
  }

  this.trackScroll = (event) => {
    this.scrollX = window.pageXOffset
    this.scrollY = window.pageYOffset
  }

  this.stopTracking = () => {
    window.removeEventListener('mousemove', this.trackMouse)
    window.removeEventListener('onscroll', this.trackScroll)
  }

  this.startRecording = () => {
    this.state = 'recording'
    this.createCursor()
    this.startTracking()
    this.recording = setInterval(this.recordPosition, this.interval)
    window.addEventListener('mousedown', this.recordMouseDown)
    window.addEventListener('mouseup', this.recordMouseUp)
  }

  this.recordPosition = () => {
    this.recordedPositions.add({
      translateX: this.mouseX,
      translateY: this.mouseY
    })
  }

  this.recordMouseDown = (target) => {

    this.recordedPositions.add({
      backgroundColor: 'rgba(241, 250, 140, 0.7)',
      translateX: target.clientX,
      translateY: target.clientY
    })
  }

  this.recordMouseUp = (target) => {
    this.recordedPositions.add({
      backgroundColor: 'rgba(0,0,0,0)',
      translateX: target.clientX,
      translateY: target.clientY
    })
  }

  this.stopRecording = () => {
    this.state = 'paused'
    this.stopTracking()
    clearInterval(this.recording)
    window.removeEventListener('mousedown', this.recordMouseDown)
    window.removeEventListener('mouseup', this.recordMouseUp)
  }

  this.recordDuration = () => {
    return this.recordedPositions.duration
  }

  this.currentTime = () => {
    return this.recordedPositions.currentTime
  }

  this.recordSeekTo = (miliseconds) => {
    if (miliseconds < this.recordDuration() && miliseconds >= 0) {
      this.recordedPositions.seek(this.recordedPositions.duration * (miliseconds / 100))
    } else {
      throw new RangeError(`Invalid input o miliseconds, the number ${miliseconds} is out of allowed range`)
    }
  }

  this.createCursor = () => {
    const cursor = document.createElement('div')
    cursor.className = 'mouse-vuer'
    document.body.appendChild(cursor)
  }

  this.play = () => {
    console.log(this.recordedPositions)
    if (this.currentTime() < this.recordDuration()) {
      console.log('passou')
      this.state = 'playing'
      document.querySelector('.mouse-vuer').style.visibility = 'visible'
      this.recordedPositions.play()
    }
  }

  this.pause = () => {
    this.state = 'paused'
    this.recordedPositions.pause()
  }

  this.resetRecordedPositions = () => {
    this.recordedPositions = anime.timeline({
      target: '.mouse-vuer',
      duration: this.interval
    })
  }
}

Emitter(MouseTracker.prototype)