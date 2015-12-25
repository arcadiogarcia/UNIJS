# UNIJS
(JS must be pronounced similarly to X for maximum pun effect)

### UNIJS is a web-based windowed console environment.
What does that mean? UNIJS is what a non-technical user would probably call an operating system. Thankfully, it is not! It is a web app that recreates a windowed desktop environment inside a browser window (or even better, a HTML5 app), and allows console programs to be executed. It provides an API and  a way to install new programs, and the programs can be combined using pipes as in UNIX.

### What is this useful for?
This is useful for creating extensible but controlled sandboxed environments that can run on any computer, for example for programming contests.

### Are we there yet?
Nope, sorry. The journey has just started this is what is done:

  - Basic windows environment
    - Window creation, deletion, resizing, movement, snip, keyboard shortcuts
  - Basic program loader
  - Basic stream implementation
  
And this is still missing:
  - Basic utilites (cat, grep...)
  - Complete stream implementation
  - File system API
  - Interchangeable OS modules (file system, notificatiosn, whatever...)
  - Everything else
  
Of course, you are welcome to report issues and submit pull requests!

The terminal is implemented using the [JQuery Terminal Emulator](https://github.com/jcubic/jquery.terminal)
