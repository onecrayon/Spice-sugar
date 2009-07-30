JSCocoaLoader.sugar for Espresso
================================

The JSCocoaLoader.sugar allows the [Espresso text editor][esp] to be
extended using [JSCocoa][jsc]. Benefits of using JSCocoaLoader include:

1. Full access to Espresso's powerful Cocoa API using only Javascript
2. Javascript utility classes to jumpstart your actions (no knowledge of
   Objective-C or Espresso APIs for most actions!)
3. All the deliciousness of Mootools classes and utilities
4. No need to restart Espresso to test changes to your actions!
5. Compatible with [TEA for Espresso][tea]'s [custom user actions][custom]
   (no need for a sugar to extend your copy of Espresso!)

   [esp]: http://macrabbit.com/espresso/
   [jsc]: http://inexdo.com/JSCocoa
   [tea]: http://github.com/onecrayon/tea-for-espresso/
   [custom]: http://wiki.github.com/onecrayon/tea-for-espresso/adding-your-own-actions

JSCocoaLoader.sugar is brought to you by [Ian Beck][crayon] and
[Thomas Aylott][subtle]. All portions (including JSCocoa and
Mootools) are released under an MIT license.

   [crayon]: http://onecrayon.com/
   [subtle]: http://subtlegradient.com/

Installation
============

To install, visit the [downloads tab][dl] and grab the latest version.
If you have never installed the JSCocoaLoader, double click the file in
the zip and relaunch Espresso to install.

If you have previously installed JSCocoaLoader.sugar, visit
`~/Library/Application Support/Espresso/Sugars/` and delete the existing
JSCocoaLoader.sugar file before double clicking the new one to install.

   [dl]: http://github.com/onecrayon/JSCocoaLoader-sugar/downloads

Getting started
===============

JSCocoaLoader.sugar on its own adds nothing visible to Espresso as
it doesn't include any action definitions. To see what it can do,
install the included JSCocoaExample.sugar and relaunch Espresso.

Once the JSCocoaExample.sugar is installed, you can experiment with
JSCocoaLoader simply by editing the JSCocoaExample.sugar action:

1. Right click JSCocoaExample.sugar in the Finder
2. Choose "Show Package Contents"
3. Navigate to `Support/Scripts`
4. Open up hello\_world.js in your favorite editor

After making changes to hello\_world.js, just save it and run the
action again in Espresso. No need to restart the program!

If you make changes to `JSCocoaExample.sugar/TextActions/Actions.xml`
a program restart will be necessary for Espresso to notice them.

Both files within JSCocoaExample.sugar are heavily documented; for
now examining them is the best way to get up to speed on what's
necessary to create your own custom actions.

For more information about JSCocoaLoader's API, please see the 
[documentation wiki][wiki].

   [wiki]: http://wiki.github.com/onecrayon/JSCocoaLoader-sugar

Building the development version
================================

If you would like to try the latest version of the source, first clone
the project somewhere with this command:

    git clone http://github.com/onecrayon/JSCocoaLoader-sugar.git

Double click the `JSCocoaLoader-sugar.xcodeproj` file inside, and click
the Build button in the XCode toolbar.  The sugar file will be in the
`build/Debug` folder.  Follow the steps above to install it just like you
would the download version.

**Please note:** the build process will fail if you have installed Espresso
somewhere other than your root Applications folder.  If you have Espresso
installed somewhere else:

1. Choose Project -> Edit Project Settings in Xcode
2. Switch to the Build tab
3. Choose "All configurations" in the Configuration dropdown
4. Scroll to the very bottom of the window and double click APPLICATION\_PATH
   under User Defined variables
5. Update the APPLICATION\_PATH to point to your local Espresso installation

If you don't wish to modify the XCode project, you may also run this command
in Terminal to create a symbolic link to Espresso for Xcode to follow:

    ln -s /path/to/Espresso.app /Applications/Espresso.app

Errata
======

For feature requests and bug reports, please use the JSCocoaLoader.sugar
[Issues tracker][issues] (requires a free GitHub account) or email
<ian@onecrayon.com>.

   [issues]: http://github.com/onecrayon/JSCocoaLoader-sugar/issues