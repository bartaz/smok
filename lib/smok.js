/*!
 * Smok - simle mocking library for JavaScript
 * http://jquery.com/
 *
 * Copyright (c) 2009 Bartek Szopka
 * Licensed under the MIT license.
 */

Smok = function(object, name){
    var expectation = new Smok.Expectation(object, name);
    Smok.expectations.push(expectation);
    return expectation;
};

Smok.expectations = [];

Smok.compare = function(expected, actual){
    if(expected === actual) return true;
    if((typeof expected == 'undefined') && (typeof actual != 'undefined')) return false;
    if((typeof actual == 'undefined') && (typeof expected != 'undefined')) return false;
    if( ((expected instanceof Array) && (actual instanceof Array)) ||
        ((typeof expected.jquery != 'undefined') && (typeof actual.jquery != 'undefined')) ){
      if(expected.length != actual.length){
          return false;
      };
      for(var i = 0; i < actual.length; i++){
          if(!this.compare(expected[i], actual[i])){
              return false;
          }
      }
      return true;
    }
    if((typeof expected == 'object') && (typeof actual == 'object')){
        for (var key in expected)
          if (!this.compare(expected[key], actual[key])) return false;
        for (var key in actual)
          if (!this.compare(actual[key], expected[key])) return false;
        return true;
    }
    return false;
}

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

Smok.Expectation = function(object, name){
    this.name = name || 'John Doe';
    this.object = object;
    this.call_count = this.expected_count = 0;
    this.expected_this = object;
};

Smok.Expectation.prototype = {
    expects: function(function_name){
        var expectation = this;
        expectation.function_name = function_name;
        expectation.original_function = expectation.object[function_name];
        expectation.object[function_name] = function(){
            return Smok.Expectation.callback.call(expectation, this, Array.prototype.slice.call(arguments));
        };
        expectation.expected_count = 1;
        return expectation;
    },

    exactly: function(expected_count){
        this.expected_count = expected_count;
        return this;
    },

    on: function(expected_this){
        this.expected_this = expected_this;
        return this;
    },

    with_args: function(){
        this.expected_args = Array.prototype.slice.call(arguments);
        return this;
    },

    returns: function(value){
        this.return_value = value;
        return this;
    },

    check: function(){
        return this.call_count == this.expected_count;
    },

    reset: function(){
        this.object[this.function_name] = this.original_function;
    }
}

Smok.Expectation.callback = function(object, args){
    if(Smok.compare(this.expected_this, object) &&
        (this.expected_args === undefined || Smok.compare(this.expected_args, args))){
      this.call_count++;
    }
    return this.return_value;
}

// Add-ons
// =========

Smok.addons = {

    // Extending jQuery to easily mock calls on jQuery elements
    // Usage:
    //    $('div').expects('addClass').with_args('newClass');
    jQuery: function(){
      jQuery.fn.expects = function(function_name){
          return Smok(jQuery.fn, "jQuery").expects(function_name).on(this).returns(this);
      }
    }

}

if(typeof jQuery != 'undefined'){
    Smok.addons.jQuery();
}
