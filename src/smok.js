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
            expectation.expected_count = 1;
            return expectation;
        },

        check: function(){
            return this.call_count == this.expected_count;
        },

        reset: function(){
            this.object[this.function_name] = this.original_function;
        }
    };
};

Smok.expectations = [];

Smok.Mock = function(object, name){
    var expectation = Smok.Expectation(object, name);
    this.expectations.push(expectation);
    return expectation;
};

Smok.check = function(){
    for(var i = 0; i < Smok.expectations.length; i++){
        if(!Smok.expectations[i].check()){
            return false;
        }
    }
    return true;
};

Smok.reset = function(){
    for(var i = 0; i < Smok.expectations.length; i++){
        Smok.expectations[i].reset();
    }
    this.expectations = [];
}
