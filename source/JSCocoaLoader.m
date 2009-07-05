//
//  JSCocoaLoader.m
//  JSCocoaLoader.sugar
//
//  Created by Ian Beck on 7/4/09.
//  Copyright 2009 One Crayon. All rights reserved.
//

#import "JSCocoaLoader.h"
#import <JSCocoa/JSCocoa.h>

#import <EspressoTextActions.h>
#import <EspressoTextCore.h>
#import <MRRangeSet.h>
#import <EspressoSyntaxCore.h>


@implementation JSCocoaLoader

- (id)initWithDictionary:(NSDictionary *)dictionary bundlePath:(NSString *)bundlePath {
	self = [super init];
	if (self == nil)
		return nil;
	
	// Grab the basic instance variables
	script = [dictionary objectForKey:@"script"];
	undo_name = [dictionary objectForKey:@"undo_name"];
	arguments = [dictionary objectForKey:@"arguments"];
	
	if (arguments == nil) {
		arguments = [NSArray arrayWithObjects:nil];
	}
	
	// Set up the syntax context variable for later checking
	syntax_context = [dictionary objectForKey:@"syntax-context"];
	// We need to remember the bundle path so we can check for scripts various places
	bundle_path = bundlePath;
	
	// Setup the search paths and full script name
	if ([script pathExtension] != @"js") {
		script = [script stringByAppendingString:@".js"];
	}
	// These paths should always be searched
	NSArray *default_paths = [NSArray arrayWithObjects:
		[@"~/Library/Application Support/Espresso/TEA/Scripts/" stringByExpandingTildeInPath],
		[bundle_path stringByAppendingPathComponent:@"Javascripts/"],
		[bundle_path stringByAppendingPathComponent:@"TEA/"],
		nil
	];
	// This path might need to be searched if we aren't in the JSCocoaLoader bundle
	NSString *jclPath = [[NSBundle bundleWithIdentifier:@"com.onecrayon.jscocoaloader"] bundlePath];
	if (jclPath != bundle_path) {
		paths = [default_paths arrayByAddingObject:[jclPath stringByAppendingPathComponent:@"Javascripts/"]];
	} else {
		paths = [NSArray arrayWithArray:default_paths];
	}
	
	return self;
}

- (BOOL)canPerformActionWithContext:(id)context {
	if (syntax_context != nil) {
		NSRange range = [[[context selectedRanges] objectAtIndex:0] rangeValue];
		SXSelectorGroup *selectors = [SXSelectorGroup selectorGroupWithString:syntax_context];
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
	if (script == nil) {
		NSLog(@"JSCocoaLoader Error: Missing script tag in XML");
		return NO;
	}
	
	NSString *path = [self findScript:script];
	if (path == nil) {
		[self throwAlert:@"Error: could not find script" withMessage:@"JSCocoaLoader could not find the script associated with this action. Please contact the action's Sugar developer, or make sure your custom user script is defined here:\n\n~/Library/Application Support/Espresso/TEA/Scripts/" inContext:context];
		return NO;
	}
	
	// Time to initialize JSCocoa
	JSCocoaController *jsc = [JSCocoa new];
	[jsc setObject:context withName:@"context"];
	[jsc setObject:[MRRangeSet class] withName:@"MRRangeSet"];
	[jsc setObject:[CETextRecipe class] withName:@"CETextRecipe"];
	[jsc setObject:[CETextSnippet class] withName:@"CETextSnippet"];
	[jsc setObject:[SXSelectorGroup class] withName:@"SXSelectorGroup"];
	
	// Load up the file
	[jsc evalJSFile:path];
	
	NSString *target = @"";
	if ([jsc hasJSFunctionNamed:@"act"]) {
		target = @"act";
	} else if ([jsc hasJSFunctionNamed:@"main"]) {
		target = @"main";
	}
	
	// Run the function, if it exists
	BOOL result;
	if (target != @"") {
		JSValueRef returnValue = [jsc callJSFunctionNamed:target withArgumentsArray:arguments];
		if (![jsc unboxJSValueRef:returnValue])
		{
			result = NO;
		} else {
			result = YES;
		}
	} else {
		result = YES;
	}
	
	// Clean up the JSCocoaController
	[jsc unlinkAllReferences];
	[jsc garbageCollect];
	[jsc release];
	
	// Return control to Espresso
	return result;
}

- (NSString *)findScript:(NSString *)fileName {
	// Iterate over the array and check if the paths exist
	NSFileManager *manager = [NSFileManager defaultManager];
	NSString *path = nil;
	int arrayCount = [paths count];
	for (int i = 0; i < arrayCount; i++) {
		if ([manager fileExistsAtPath:[paths objectAtIndex:i]]) {
			path = [[paths objectAtIndex:i] stringByAppendingPathComponent:fileName];
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
