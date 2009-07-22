//
//  JSCocoaLoader.h
//  JSCocoaLoader.sugar
//
//  Created by Ian Beck
//  http://onecrayon.com
//
//  MIT License

#import <Cocoa/Cocoa.h>


@interface JSCocoaLoader : NSObject {
	// Name of the script to run
	NSString *script;
	NSArray *supportPaths;
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

@property (readonly,copy) NSString* script;
@property (readonly,retain) NSArray* arguments;
@property (readonly,copy) NSString* syntaxContext;
@property (readonly,copy) NSString* bundlePath;
@property (readonly,copy) NSString* undoName;

@property (copy) NSString* target;
@property (retain) NSArray* supportPaths;

- (NSString *)findScript:(NSString *)fileName inFolders:(NSArray *)folders;
- (void)throwAlert:(NSString *)title withMessage:(NSString *)message inContext:(id)context;
- (BOOL)isFile:(NSString *)path;
- (NSString *)read:(NSString *)path;

@end
