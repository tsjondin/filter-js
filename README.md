#Recursive Filter Parser

What I think it is, since I have not dived into compiler theory or anything like that,
is a Recursive Descent Parser with no lookahead and a lack of backtracking, the result
is an "absolute" one-pass parser that has some quirks regarding associativity and the
produced expression tree. An expression tree that I would have liked to be binary but
is not.

In truth, I don't even know if it is possible to handle associativity when
lexing and visiting recursively in the way that I have done. But fear not! For your,
or my, interpreter of the non-binary expression tree can handle the associativity
when filtering through a set of objects, or when build an SQL, or whatever have you!
(jump down to the [explanation for interpreting](#interpreting-the-expression-tree))

For something to refer too here's a cut-n-paste from wikipedia:

To correctly parse without lookahead, there are three solutions:

* The user has to enclose expressions within parentheses. This often is not a viable solution.
  * this is handled properly in the parser but not viable as I don't expect users to "know" this
* The parser needs to have more logic to backtrack and retry whenever a rule is violated or not complete. The similar method is followed in LL parsers.
  * I cannot backtrack in my parser, I can only go forward, but new tokens can look back at already parsed expressions though situations are few and far between in which this is useful.
* Alternatively, the parser or grammar needs to have extra logic to delay reduction and reduce only when it is absolutely sure which rule to reduce first. This method is used in LR parsers. This correctly parses the expression but with many more states and increased stack depth.
  * Sounds interesting, I wonder if it is possible within my context. Though my stack is already pretty deep when parsing anything more than "name = John"

##Roadmap

 - [ ] The first goal is to find out it is possible to make the parses associative while still
retaining its implemented one-pass lexing and visiting
 - [X] ~~Rewrite the example "Aggregator" into a "language standard" interface instead.~~ This is now the FilterInterpreter, which consists of a bunch of visitors.
 - [ ] The third goal is, I don't know, possibly make something like functions or macros work
so that one can do things like "time < (time(now) - 3600)"
 - [ ] Oh, and handle basic arithmetics could be nice, just looking at above!

##Interpreting the expression tree

See the example FilterIntrepreter
