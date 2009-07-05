//
//  JSCocoaLoader.h
//  JSCocoaLoader.sugar
//
//  Created by Ian Beck on 7/4/09.
//  Copyright 2009 One Crayon. All rights reserved.
//

#import <Cocoa/Cocoa.h>


@interface JSCocoaLoader : NSObject {
	// Name of the script to run
	NSString *script;
	NSArray *paths;
	// Arguments to pass to the script (array)
	NSArray *arguments;
	// This is the function we'll try to call from the Javascript
	NSString *target;
	// Standard undo_name option
	NSString *undoName;
	// Syntax context the action can be performed in
	NSString *syntaxContext;
	// Bundle path is useful for finding scripts in multiple locations
	NSString *bundlePath;
}

@property (readonly) NSString* script;
@property (readonly) NSArray* arguments;
@property (readonly) NSString* syntaxContext;
@property (readonly) NSString* bundlePath;
@property (readonly) NSString* undoName;

@property (copy) NSString* target;
@property (retain) NSArray* paths;

- (NSString *)findScript:(NSString *)file;
- (void)throwAlert:(NSString *)title withMessage:(NSString *)message inContext:(id)context;

@end
