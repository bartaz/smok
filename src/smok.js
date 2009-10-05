/*!
 * Smok - simle mocking library for JavaScript
 * http://jquery.com/
 *
 * Copyright (c) 2009 Bartek Szopka
 * Licensed under the MIT license.
 */
Smok = {}

Smok.Expectation = function(object, name){
    return { 
        name: name || 'John Doe',
        object: object,
        original_function: undefined,
        function_name: undefined,

        call_count: 0,

        should_receive: function(function_name){
            var expectation = this;
            expectation.function_name = function_name;
            expectation.original_function = expectation.object[function_name];
            
            expectation.object[function_name] = function(){
                expectation.call_count++;
            };
            
            this.expected_count = 1;
            return this;
        },

        check: function(){
            return this.call_count == this.expected_count;
        }
    };
}

