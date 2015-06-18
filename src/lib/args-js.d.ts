
declare var Args: Args.ArgsStatic;

declare module Args {

	interface ArgsStatic {
		(argDeclaration: Param[], arguments: any[]): any;
		(argDeclaration: Param[], arguments: IArguments): any;
		ANY: number;
		STRING: number;
		FUNCTION: number;
		INT: number;
		FLOAT: number;
		ARRAY_BUFFER: number;
		OBJECT: number;
		DATE: number;
		BOOL: number;
		DOM_EL: number;
		ARRAY: number;
		Optional: number;
		Required: number;

	}

	export interface Param {
		_default?: any;
	}
}

declare module 'args-js' {
	export = Args;
}