//
//  JSCocoaLoader.m
//  JSCocoaLoader.sugar
//
//  Created by Ian Beck
//  http://onecrayon.com
//
//  MIT License

#import "JSCocoaLoader.h"
#import <JSCocoa/JSCocoa.h>

#import <EspressoTextActions.h>
#import <EspressoTextCore.h>
#import <MRRangeSet.h>
#import <EspressoSyntaxCore.h>

// This allows us to set private setters for these variables
@interface JSCocoaLoader ()
@property (readwrite,copy) NSString* script;
@property (readwrite,retain) NSArray* arguments;
@property (readwrite,copy) NSString* syntaxContext;
@property (readwrite,copy) NSString* bundlePath;
@property (readwrite,copy) NSString* undoName;
@property (readwrite) BOOL noFrills;
@end

// The actual implementation of the class
@implementation JSCocoaLoader

@synthesize script;
@synthesize supportPaths;
@synthesize arguments;
@synthesize undoName;
@synthesize syntaxContext;
@synthesize bundlePath;
@synthesize target;
@synthesize noFrills;

- (id)initWithDictionary:(NSDictionary *)dictionary bundlePath:(NSString *)myBundlePath {
	self = [super init];
	if (self == nil)
		return nil;
	
	// Grab the basic instance variables
	[self setScript:[dictionary objectForKey:@"script"]];
	[self setUndoName:[dictionary objectForKey:@"undo_name"]];
	[self setArguments:[dictionary objectForKey:@"arguments"]];
	
	if ([self arguments] == nil) {
		[self setArguments:[NSArray arrayWithObjects:nil]];
	}
	
	// Check to see if they specified a target function
	[self setTarget:[dictionary objectForKey:@"function"]];
	
	// Set up the syntax context variable for later checking
	[self setSyntaxContext:[dictionary objectForKey:@"syntax-context"]];
	// We need to remember the bundle path so we can check for scripts various places
	[self setBundlePath:myBundlePath];
	
	// Check for no-frills parsing
	[self setNoFrills:[[dictionary valueForKey:@"no-frills"] boolValue]];
	
	// Setup the support paths; we'll use these locations to find files
	// These paths should always be searched
	NSArray *default_paths = [NSArray arrayWithObjects:
		[@"~/Library/Application Support/Espresso/Support" stringByExpandingTildeInPath],
		[[self bundlePath] stringByAppendingPathComponent:@"Support"],
		nil
	];
	// This path might need to be searched if we aren't in the JSCocoaLoader bundle
	NSString *jclPath = [[NSBundle bundleWithIdentifier:@"com.onecrayon.jscocoaloader"] bundlePath];
	if ([[self bundlePath] compare:jclPath] != NSOrderedSame) {
		[self setSupportPaths:[default_paths arrayByAddingObject:[jclPath stringByAppendingPathComponent:@"Support"]]];
	} else {
		[self setSupportPaths:[NSArray arrayWithArray:default_paths]];
	}
	
	return self;
}

- (BOOL)canPerformActionWithContext:(id)context {
	if ([self syntaxContext] != nil) {
		NSRange range = [[[context selectedRanges] objectAtIndex:0] rangeValue];
		SXSelectorGroup *selectors = [SXSelectorGroup selectorGroupWithString:[self syntaxContext]];
		SXZone *zone = [[context syntaxTree] zoneAtCharacterIndex:range.location];
		if (![selectors matches:zone]) {
			return NO;
		}
	}
	// Defaults to allowing the action to be used
	return YES;
}

- (BOOL)performActionWithContext:(id)context error:(NSError **)outError
{
	if ([self script] == nil) {
		NSLog(@"JSCocoaLoader Error: Missing script tag in XML");
		return NO;
	}
	
	// Time to initialize JSCocoa
	JSCocoaController *jsc = [JSCocoa new];
	[jsc setObject:self	withName:@"JSCocoaLoaderController"];
	[jsc setObject:context withName:@"context"];
	[jsc setObject:[MRRangeSet class] withName:@"MRRangeSet"];
	[jsc setObject:[CETextRecipe class] withName:@"CETextRecipe"];
	[jsc setObject:[CETextSnippet class] withName:@"CETextSnippet"];
	[jsc setObject:[SXSelectorGroup class] withName:@"SXSelectorGroup"];
	
	BOOL result = YES;
	
	// No frills mode just executes the file
	if ([self noFrills]) {
		NSString *path = [self findScript:[self script] inFolders:[NSArray arrayWithObject:@"Scripts"]];
		if (path == nil) {
			[self throwAlert:@"Error: could not find script" withMessage:@"JSCocoaLoader could not find the script associated with this action. Please contact the action's Sugar developer, or make sure your custom user script is defined here:\n\n~/Library/Application Support/Espresso/Support/lib/" inContext:context];
			return NO;
		}
		
		// Load up the file
		[jsc evalJSFile:path];
		
		if ([self target] == nil) {
			if ([jsc hasJSFunctionNamed:@"main"]) {
				[self setTarget:@"main"];
			} else if ([jsc hasJSFunctionNamed:@"act"]) {
				[self setTarget:@"act"];
			}
		} else if (![jsc hasJSFunctionNamed:[self target]]) {
			[self setTarget:nil];
		}
		
		// Run the function, if it exists
		if ([self target] != nil) {
			JSValueRef returnValue = [jsc callJSFunctionNamed:[self target] withArgumentsArray:[self arguments]];
			if (![jsc unboxJSValueRef:returnValue]) {
				result = NO;
			}
		}
	} else {
		// Pass off handling to the Javascript system
		[jsc evalJSFile:[self findScript:@"bootstrap_JSCocoaLoader.js" inFolders:[NSArray arrayWithObject:@"Library"]]];
		
		// Run the bootstrapping function, which handles all further execution of scripts
		JSValueRef returnValue = [jsc callJSFunctionNamed:@"bootstrap_JSCocoaLoader" withArguments:[self script], [self arguments], nil];
		if (![jsc unboxJSValueRef:returnValue]) {
			result = NO;
		}
	}
	
	// TODO: verify that no explicit garbage collection of jsc is necessary
	
	// Return control to Espresso
	return result;
}

- (NSString *)findScript:(NSString *)fileName inFolders:(NSArray *)folders {
	// Make sure the script has .js on the end
	if ([[fileName pathExtension] compare:@"js"] != NSOrderedSame) {
		// Is there a memory leak here? Might need to do [[fileName autorelease] stringByAppendingString:@".js"] instead
		fileName = [fileName stringByAppendingString:@".js"];
	}
	// Iterate over the array and check if the paths exist
	NSString *path = nil;
	
	for (NSString* supportPath in [self supportPaths]) {
		for (NSString* testPath in folders) {
			NSString *targetPath = [[supportPath stringByAppendingPathComponent:testPath] stringByAppendingPathComponent:fileName];
			if ([[NSFileManager defaultManager] fileExistsAtPath:targetPath]) {
				path = targetPath;
				break;
			}
		}
		if (path != nil) {
			break;
		}
	}
	
	return path;
}

- (void)throwAlert:(NSString *)title withMessage:(NSString *)message inContext:(id)context
{
	NSAlert *alert = [NSAlert
						  alertWithMessageText:title
						  defaultButton:@"OK"
						  alternateButton:nil
						  otherButton:nil
						  informativeTextWithFormat:message
					  ];
	if ([context windowForSheet] != nil) {
		[alert
			beginSheetModalForWindow:[context windowForSheet]
			modalDelegate:nil
			didEndSelector:nil
			contextInfo:nil
		];
	} else {
		[alert runModal];
	}
}

- (BOOL)isFile:(NSString *)path {
	return [[NSFileManager defaultManager] fileExistsAtPath:path];
}

- (NSString *)read:(NSString *)path {
	return [NSString stringWithContentsOfFile:path];
}

@end
