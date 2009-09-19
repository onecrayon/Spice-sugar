Spice.sugar for Espresso
========================

Spice allows [Espresso][esp] to be extended using [JSCocoa][jsc]. For more
information about the plugin (including documentation) see the Spice site:

<http://onecrayon.com/spice/>

   [esp]: http://macrabbit.com/espresso/
   [jsc]: http://inexdo.com/JSCocoa

Spice is brought to you by [Ian Beck][crayon] and
[Thomas Aylott][subtle]. All portions (including JSCocoa and
Mootools) are released under an MIT license.

   [crayon]: http://onecrayon.com/
   [subtle]: http://subtlegradient.com/

For feature requests and bug reports, please use the Spice.sugar
[Issues tracker][issues] (requires a free GitHub account) or [email me](http://onecrayon.com/about/contact/).

   [issues]: http://github.com/onecrayon/Spice-sugar/issues

Building the development version
================================

If you would like to try the latest version of the source, first clone
the project somewhere with this command:

    git clone http://github.com/onecrayon/Spice-sugar.git

Double click the `Spice-sugar.xcodeproj` file inside, and click
the Build button in the XCode toolbar.  The sugar file will be in the
`build/Debug` folder.  Follow the steps above to install it just like you
would the download version.

**Please note:** the build process will fail if you have installed Espresso
somewhere other than your root Applications folder.  If you have Espresso
installed somewhere else:

1. Choose Project &rarr; Edit Project Settings in Xcode
2. Switch to the Build tab
3. Choose "All configurations" in the Configuration dropdown
4. Scroll to the very bottom of the window and double click APPLICATION\_PATH
   under User Defined variables
5. Update the APPLICATION\_PATH to point to your local Espresso installation

If you don't wish to modify the XCode project, you may also run this command
in Terminal to create a symbolic link to Espresso for Xcode to follow:

    ln -s /path/to/Espresso.app /Applications/Espresso.app
