# Recursive Filter Parser

## One-pass

The filter parser only takes one pass over the filter string you give the parser,
when the last character has been read and its related lexeme tokenized the parsing
is done and you are given what I would like to say is a binary expression tree, but
sadly, due to the one-pass no-lookahead I could not handle associativity.

In truth, I don't even know if it is possible to handle associativity when
lexing->visiting recursively in the way that I have done. But fear not! For your,
or my, interpreter of the non-binary expression tree can handle the associativity
when filtering through a set of objects, or when build an SQL, or whatever have you!
(jump down to the explanation for interpreting)

For something to refere too here's a cut-n-paste from wikipedia:

To correctly parse without lookahead, there are three solutions:

* The user has to enclose expressions within parentheses. This often is not a viable solution.
  * Yes, and this is done correctly in this parser
* The parser needs to have more logic to backtrack and retry whenever a rule is violated or not complete. The similar method is followed in LL parsers.
  * I cannot backtrack in my parser, I can only go forward, but new tokens can look back at already parsed expressions
* Alternatively, the parser or grammar needs to have extra logic to delay reduction and reduce only when it is absolutely sure which rule to reduce first. This method is used in LR parsers. This correctly parses the expression but with many more states and increased stack depth.
  * Sounds interesting, I wonder if it is possible within my context.

## Goals?

The first goal is to find out it is possible to make the parses associative while still
retaining its implemented one-pass lexing and visiting,

The second goal is, I don't know, possibly make something like functions or macros work
so that one can do things like "time < (time(now) - 3600)"

## Interpreting the resulting tree

As said before I wish this was a binary expression tree, but it's not, unless the one inputing the
filter is so kind as to add parenthesis at all the right locations, but let's assume not.

Then the query:

	name = "John" or name = "Dave" or name = "Jane" or name = "Dana"

Will result in a tree looking like:

	[
		["name", "=", "John"],
		"or,
		["name", "=", "Dave"],
		"or,
		["name", "=", "Jane"],
		"or,
		["name", "=", "Dana"]
	]

Which as you can see is bad to treat as a binary expression tree, but we can however perform
a second-pass, which is all we need to either consume the tree to apply as a filter associatively
on a set of data or produce an associativity specific SQL query.

We can do this because even though we cannot assume each node to have two expressions and an operator
we can assume that the pattern of expr, operator, expr, operator, etc. will hold. So when consuming
the tree we can decide if we want global left or right associativity (or operator specific, though I
feel that is confusing for a simple filter language).

*Note*: I will explain this as if we are filtering a set of objects, this is seen implemented in the
FilterAggregator

If we want a right-associative language then we:
* Reduce the set items by calling a matcher with the object and a copy of the expression
  * If the expression is boolean return true
    * Set result to nothing
    * As long as the expression has elements
      * Then we pop three items from the expression (the right-hand first, then operator, lastly left-hand)
      * ... handle operators as you wish by fetching values from the object and compare them appropriately .. apply and/or recursively ...
      * If expression is empty them return the result
      * Else push the result back onto the expression
