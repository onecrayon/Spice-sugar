//
//  JSCocoaLoader.m
//  JSCocoaLoader.sugar
//
//  Created by Ian Beck on 7/4/09.
//
// MIT License

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
@end

// The actual implementation of the class
@implementation JSCocoaLoader

@synthesize script;
@synthesize paths;
@synthesize arguments;
@synthesize undoName;
@synthesize syntaxContext;
@synthesize bundlePath;
@synthesize target;

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
	
	// Setup the search paths
	// These paths should always be searched
	NSArray *default_paths = [NSArray arrayWithObjects:
		[@"~/Library/Application Support/Espresso/Support/lib/" stringByExpandingTildeInPath],
		[@"~/Library/Application Support/Espresso/TEA/Scripts/" stringByExpandingTildeInPath],
		[[self bundlePath] stringByAppendingPathComponent:@"Support/lib/"],
		[[self bundlePath] stringByAppendingPathComponent:@"Javascripts/"],
		[[self bundlePath] stringByAppendingPathComponent:@"TEA/"],
		nil
	];
	// This path might need to be searched if we aren't in the JSCocoaLoader bundle
	NSString *jclPath = [[NSBundle bundleWithIdentifier:@"com.onecrayon.jscocoaloader"] bundlePath];
	if ([[self bundlePath] compare:jclPath] != NSOrderedSame) {
		[self setPaths:[default_paths arrayByAddingObject:[jclPath stringByAppendingPathComponent:@"Javascripts/"]]];
	} else {
		[self setPaths:[NSArray arrayWithArray:default_paths]];
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
	
	NSString *path = [self findScript:[self script]];
	if (path == nil) {
		[self throwAlert:@"Error: could not find script" withMessage:@"JSCocoaLoader could not find the script associated with this action. Please contact the action's Sugar developer, or make sure your custom user script is defined here:\n\n~/Library/Application Support/Espresso/Support/lib/" inContext:context];
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
	
	// Load up the standard import library (for easy asset importing within Javascript)
	[jsc evalJSFile:[self findScript:@"import.js"]];
	
	// Load up the file
	[jsc evalJSFile:path];
	
	if ([self target] == nil) {
		if ([jsc hasJSFunctionNamed:@"act"]) {
			[self setTarget:@"act"];
		} else if ([jsc hasJSFunctionNamed:@"main"]) {
			[self setTarget:@"main"];
		}
	} else if (![jsc hasJSFunctionNamed:[self target]]) {
		[self setTarget:nil];
	}
	
	// Run the function, if it exists
	BOOL result = YES;
	if ([self target] != nil) {
		JSValueRef returnValue = [jsc callJSFunctionNamed:[self target] withArgumentsArray:[self arguments]];
		if (![jsc unboxJSValueRef:returnValue]) {
			result = NO;
		}
	}
	
	// TODO: verify that no explicit garbage collection of jsc is necessary
	
	// Return control to Espresso
	return result;
}

- (NSString *)findScript:(NSString *)fileName {
	// Make sure the script has .js on the end
	if ([[fileName pathExtension] compare:@"js"] != NSOrderedSame) {
		// Is there a memory leak here? Might need to do [[fileName autorelease] stringByAppendingString:@".js"] instead
		fileName = [fileName stringByAppendingString:@".js"];
	}
	// Iterate over the array and check if the paths exist
	NSFileManager *manager = [NSFileManager defaultManager];
	NSString *path = nil;
	
	for (NSString* testPath in [self paths]) {
		if ([manager fileExistsAtPath:[testPath stringByAppendingPathComponent:fileName]]) {
			path = [testPath stringByAppendingPathComponent:fileName];
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

@end
