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
	// Standard undo_name option
	NSString *undo_name;
	// Syntax context the action can be performed in
	NSString *syntax_context;
	// Bundle path is useful for finding scripts in multiple locations
	NSString *bundle_path;
}

- (NSString *)findScript:(NSString *)file;
- (void)throwAlert:(NSString *)title withMessage:(NSString *)message inContext:(id)context;

@end
