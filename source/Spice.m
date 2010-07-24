//
//  Spice.m
//  Spice.sugar
//
//  Created by Ian Beck
//  http://onecrayon.com/spice/
//
//  MIT License

#import "Spice.h"
#import <JSCocoa/JSCocoa.h>
#import "JSON.h"

#import <EspressoTextActions.h>
#import <EspressoTextCore.h>
#import <MRRangeSet.h>
#import <EspressoSyntaxCore.h>

// This allows us to set private setters for these variables
@interface Spice ()
@property (readwrite,copy) NSString* script;
@property (readwrite,retain) NSArray* arguments;
@property (readwrite,copy) NSString* syntaxContext;
@property (readwrite,copy) NSString* bundlePath;
@property (readwrite,copy) NSString* undoName;
@property (readwrite) BOOL noFrills;
@end

// The actual implementation of the class
@implementation Spice

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
	// Backwards compatibility for undo_name vs. undo-name
	if ([dictionary objectForKey:@"undo-name"]) {
		[self setUndoName:[dictionary objectForKey:@"undo-name"]];
	} else {
		[self setUndoName:[dictionary objectForKey:@"undo_name"]];
	}
	// If arguments isn't an array, save it as an array with a single item
	if ([dictionary objectForKey:@"arguments"] != nil && ![[dictionary objectForKey:@"arguments"] isKindOfClass:[NSArray class]]) {
		[self setArguments:[NSArray arrayWithObject:[dictionary objectForKey:@"arguments"]]];
	} else {
		// It's an array, so just toss it in there
		[self setArguments:[dictionary objectForKey:@"arguments"]];
	}
	// Make sure that our arguments array isn't nil
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
	// This path might need to be searched if we aren't in the Spice bundle
	NSString *spicePath = [[NSBundle bundleWithIdentifier:@"com.onecrayon.spice"] bundlePath];
	if (![[self bundlePath] isEqualToString:spicePath]) {
		[self setSupportPaths:[default_paths arrayByAddingObject:[spicePath stringByAppendingPathComponent:@"Support"]]];
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
		NSLog(@"Spice Error: Missing script tag in XML");
		return NO;
	}
	
	// Time to initialize JSCocoa
	JSCocoaController *jsc = [JSCocoa new];
	[jsc setUseJSLint:NO];
	[jsc setObject:self	withName:@"SpiceController"];
	[jsc setObject:context withName:@"context"];
	[jsc setObject:[MRRangeSet class] withName:@"MRRangeSet"];
	[jsc setObject:[CETextRecipe class] withName:@"CETextRecipe"];
	[jsc setObject:[CETextSnippet class] withName:@"CETextSnippet"];
	[jsc setObject:[SXSelectorGroup class] withName:@"SXSelectorGroup"];
	[jsc setObject:[SXTypeIdentifier class] withName:@"SXTypeIdentifier"];
	
	BOOL result = YES;
	
	// No frills mode just executes the file
	if ([self noFrills]) {
		NSString *path = [self findModule:[self script] inFolders:[NSArray arrayWithObject:@"Scripts"]];
		if (path == nil) {
			[self throwAlert:@"Error: could not find script" withMessage:@"Spice could not find the script associated with this action. Please contact the action's Sugar developer, or make sure your custom user script is defined here:\n\n~/Library/Application Support/Espresso/Support/Scripts/" inContext:context];
			return NO;
		}
		
		// Load up the module
		if ([self isFile:path]) {
			[jsc evalJSFile:path];
		} else if ([self isDirectory:path]) {
			[jsc evalJSString:[self readModule:path appendExports:NO]];
		}
		
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
		[jsc evalJSFile:[self findModule:@"bootstrap_Spice.js" inFolders:[NSArray arrayWithObject:@"Library"]]];
		
		// Run the bootstrapping function, which handles all further execution of scripts
		JSValueRef returnValue = [jsc callJSFunctionNamed:@"bootstrap_Spice" withArguments:[self script], [self arguments], nil];
		if (![jsc unboxJSValueRef:returnValue]) {
			result = NO;
		}
	}
	
	// Return control to Espresso
	return result;
}

// Currently just a shortcut to NSLog
- (void)log:(NSString *)message {
	NSLog(@"%@", message);
}

- (NSString *)findModule:(NSString *)moduleName inFolders:(NSArray *)folders {
	// Make sure the script name we are searching for has .js on the end
	NSString *fileName = nil;
	if ([[moduleName pathExtension] compare:@"js"] != NSOrderedSame) {
		fileName = [moduleName stringByAppendingString:@".js"];
	} else {
		fileName = moduleName;
	}
	// Iterate over the array and check if the paths exist
	NSString *path = nil;
	NSFileManager *fm = [NSFileManager defaultManager];
	
	for (NSString* supportPath in [self supportPaths]) {
		for (NSString* testPath in folders) {
			NSString *filePath = [[supportPath stringByAppendingPathComponent:testPath] stringByAppendingPathComponent:fileName];
			NSString *initPath = [[[supportPath stringByAppendingPathComponent:testPath] stringByAppendingPathComponent:moduleName] stringByAppendingPathComponent:@"__init__.json"];
			// Always check for a file-based module first
			if ([fm fileExistsAtPath:filePath]) {
				path = filePath;
				break;
			}
			// Otherwise we can check for a folder-based module
			if ([fm fileExistsAtPath:initPath]) {
				path = [[supportPath stringByAppendingPathComponent:testPath] stringByAppendingPathComponent:moduleName];
				break;
			}
		}
		if (path != nil) {
			break;
		}
	}
	
	return path;
}

// Shortcut to load a module, including any exports
- (NSString *)readModule:(NSString *)modulePath {
	return [self readModule:modulePath appendExports:YES];
}

// Reads the file/files for the module and returns them as a string, possibly with exports definitions appended
- (NSString *)readModule:(NSString *)modulePath appendExports:(BOOL)appendExports {
	if ([self isFile:modulePath]) {
		// Just a standard module file; pass it along
		return [self read:modulePath];
	} else if ([self isDirectory:modulePath] && [self isFile:[modulePath stringByAppendingPathComponent:@"__init__.json"]]) {
		// Module directory, so we need to concatenate the files and append any export statements necessary
		// TODO: revise this to save final string into a cache, and only load in each file if there's a file newer than the cache file
		// First, parse the init file
		NSDictionary *options = [[self read:[modulePath stringByAppendingPathComponent:@"__init__.json"]] JSONValue];
		// Make sure we actually got a JSON object
		if (options == nil) {
			NSLog(@"Spice error: parse error in __init__.json for `%@`", modulePath);
			return nil;
		}
		// Prep the string that we'll be returning
		NSMutableString *finalString = [NSMutableString string];
		if ([options objectForKey:@"files"] != nil) {
			// We have a list of files, so read them into the string
			for (NSString *path in [options objectForKey:@"files"]) {
				NSString *filePath = [modulePath stringByAppendingPathComponent:path];
				if ([self isFile:filePath]) {
					[finalString appendString:[self read:filePath]];
				} else {
					NSLog(@"Spice error: unable to load file `%@` into module", filePath);
				}
			}
		} else {
			// We don't have a files array, so that means we need to read in all files in the directory
			NSFileManager *fm = [NSFileManager defaultManager];
			NSDirectoryEnumerator *dirEnum = [fm enumeratorAtPath:modulePath];
			
			// Parse over the enumerator and check if it's a JS file
			NSString *file;
			while (file = [dirEnum nextObject]) {
				if ([[file pathExtension] isEqualToString: @"js"]) {
					// Add the file to our string
					[finalString appendString:[self read:file]];
				}
			}
		}
		// Check if we need to think about export statements at all
		NSArray *exports = [options objectForKey:@"exports"];
		if (appendExports && exports != nil) {
			[finalString appendString:@"\n/* Module exports */\n"];
			for (NSString *funcName in exports) {
				[finalString appendFormat:@"exports.%@ = %@;\n", funcName, funcName];
			}
		}
		[finalString writeToFile:[modulePath stringByAppendingPathComponent:@"TEMP.js"] atomically:NO encoding:NSUnicodeStringEncoding error:nil];
		// Send 'er on!
		return finalString;
	} else {
		// Something has gone awry, because it's neither a file nor a module directory
		NSLog(@"Spice error: path `%@` does not appear to represent a Javascript module", modulePath);
		return nil;
	}
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
	BOOL exists;
	BOOL isDirectory;
	exists = [[NSFileManager defaultManager] fileExistsAtPath:path isDirectory:&isDirectory];
	return exists && !isDirectory;
}

- (BOOL)isDirectory:(NSString *)path {
	BOOL exists;
	BOOL isDirectory;
	exists = [[NSFileManager defaultManager] fileExistsAtPath:path isDirectory:&isDirectory];
	return exists && isDirectory;
}

- (NSString *)read:(NSString *)path {
	return [NSString stringWithContentsOfFile:path encoding:NSUTF8StringEncoding error:nil];
}

- (NSString *)runProcess:(NSArray *)args withEnv:(NSDictionary *)env {
	// Run the script
	NSTask *task = [[NSTask alloc] init];
	NSPipe *inPipe = [NSPipe pipe], *outPipe = [NSPipe pipe];
	
	// Set up the STDIN; temporarily disabled but we might want it later
//	NSFileHandle *fh = [inPipe fileHandleForWriting];  
//	[fh writeData:[inputStr dataUsingEncoding:NSUTF8StringEncoding]];  
//	[fh closeFile];
	
	[task setLaunchPath:[args objectAtIndex:0]];
	if ([args count] > 1) {
		[task setArguments:[args subarrayWithRange:NSMakeRange(1, [args count] - 1)]];
	}
	[task setStandardOutput:outPipe];
	[task setStandardError:outPipe];
	[task setStandardInput:inPipe];
	if (env != nil) {
		[task setEnvironment:env];
	}
	
	[task launch];
	
	NSData *data;
	NSString *outString = nil;
	data = [[outPipe fileHandleForReading] readDataToEndOfFile];
	outString = [[[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding] autorelease];
	
	[task waitUntilExit];
	[task release];
	
	return outString;
}

- (void)dealloc {
	[self setScript:nil];
	[self setSupportPaths:nil];
	[self setArguments:nil];
	[self setUndoName:nil];
	[self setSyntaxContext:nil];
	[self setBundlePath:nil];
	[self setTarget:nil];
	[super dealloc];
}

@end
