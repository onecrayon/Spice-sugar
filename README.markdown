JSCocoaLoader.sugar for Espresso
================================

The JSCocoaLoader.sugar allows the [Espresso text editor][esp] to be
extended using [JSCocoa][jsc]. Benefits of using JSCocoaLoader include:

1. Full access to Espresso's powerful Cocoa API using only Javascript
2. No need to restart Espresso to test changes to your actions!
3. Compatible with [TEA for Espresso][tea]'s [custom user actions][custom]
   (no need for a sugar to extend your copy of Espresso!)

   [esp]: http://macrabbit.com/espresso/
   [jsc]: http://inexdo.com/JSCocoa
   [tea]: http://github.com/onecrayon/tea-for-espresso/
   [custom]: http://wiki.github.com/onecrayon/tea-for-espresso/adding-your-own-actions

Installation
============

To install, visit the [downloads tab][dl] and grab the latest version.
If you have never installed the JSCocoaLoader, double click the file in
the zip and relaunch Espresso to install.

If you have previously installed JSCocoaLoader.sugar, visit
`~/Library/Application Support/Espresso/Sugars/` and delete the existing
JSCocoaLoader.sugar file before double clicking the new one to install.

   [dl]: http://github.com/onecrayon/JSCocoaLoader-sugar/downloads

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

Errata
======

For feature requests and bug reports, please use the JSCocoaLoader.sugar
[Issues tracker][issues] (requires a free GitHub account) or email
<ian@onecrayon.com>.

Documentation on using the sugar is coming to the wiki soon!

   [issues]: http://github.com/onecrayon/JSCocoaLoader-sugar/issues