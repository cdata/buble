import Node from '../Node.js';
import isReference from '../../utils/isReference.js';

export default class Identifier extends Node {
	findScope ( functionScope ) {
		if ( this.parent.params && ~this.parent.params.indexOf( this ) ) {
			return this.parent.body.scope;
		}

		if ( this.parent.type === 'FunctionExpression' && this === this.parent.id ) {
			return this.parent.body.scope;
		}

		return this.parent.findScope( functionScope	);
	}

	initialise () {
		if ( isReference( this, this.parent ) ) {
			if ( this.name === 'arguments' && !this.findScope( false ).contains( this.name ) ) {
				const lexicalBoundary = this.findLexicalBoundary();
				const arrowFunction = this.findNearest( 'ArrowFunctionExpression' );

				if ( arrowFunction && arrowFunction.depth > lexicalBoundary.depth ) {
					const argumentsAlias = lexicalBoundary.getArgumentsAlias();
					if ( argumentsAlias ) this.alias = argumentsAlias;
				}
			}

			this.findScope( false ).addReference( this );
		}
	}

	transpile () {
		if ( this.alias ) {
			this.program.magicString.overwrite( this.start, this.end, this.alias );
		}
	}
}
