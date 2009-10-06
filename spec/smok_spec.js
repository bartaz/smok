Screw.Unit(function(){ 

describe("Smok", function() {

  var dummy;

  before(function(){
    dummy = { name: 'Dummy', foo: function() { return 'bar' } };
  });

  describe("Expectation", function() {

    var expectation;

    before(function(){
      expectation = new Smok.Expectation(dummy, dummy.name);
    });

    describe("while creating new expectation", function(){

      it("should create new expectation for given object", function(){
        expect(expectation).to_not(be_undefined);
        expect(expectation.object).to(equal, dummy);
      });

      it("should create expectation with given name", function(){
        expect(expectation.name).to(equal, dummy.name);
      });

      it("should create expectation with default name if not given", function(){
        expectation = new Smok.Expectation(dummy);
        expect(expectation.name).to(equal, 'John Doe');
      });

      it("should have call counter reset to 0", function(){
        expect(expectation.call_count).to(equal, 0);
      });

      it("should have expected counter set to 0", function(){
        expect(expectation.expected_count).to(equal, 0);
      });

      it("should have expected this set to given object", function(){
        expect(expectation.expected_this).to(equal, dummy);
      });

      it("should not fail if calls are not expected", function(){
        expect(expectation.check()).to(be_true);
      });

    });

    describe("while expecting function calls", function(){

      describe("and setting mocked function", function(){

        var dummy_foo;

        before(function(){
          dummy_foo = dummy.foo;
        });

        after(function(){
          dummy.foo = dummy_foo;
        });

        it("should return self expectation", function(){
          var returned = expectation.should_receive('foo');
          expect(returned).to(equal, expectation);
        });

        it("should store name of expected function", function(){
          expectation.should_receive('foo');
          expect(expectation.function_name).to(equal, 'foo');
        });

        it("should set expected call count to 1", function(){
          expectation.should_receive('foo');
          expect(expectation.expected_count).to(equal, 1);
        });

        it("should replace expected function with mocked one", function(){
          expectation.should_receive('foo');
          expect(dummy.foo).to_not(equal, dummy_foo);
        });

        it("should store reference to original function", function(){
          expectation.should_receive('foo');
          expect(expectation.original_function).to(equal, dummy_foo);
        });

      });

      describe("and calling mocked function", function(){

        var mock;

        before(function(){
          mock = {
            callback: Smok.Expectation.callback,
            callback_return: 'callback return'
          }
          Smok.Expectation.callback = function(object, args){
            mock.callback_this = this;
            mock.object_arg = object;
            mock.args_arg = args;
            return mock.callback_return;
          }
        });

        after(function(){
          Smok.Expectation.callback = mock.callback;
        });

        it("should call mock callback with proper arguments", function(){
          expectation.should_receive('foo');
          expect(dummy.foo('first argument', 'second argument')).to(equal, mock.callback_return);
          expect(mock.callback_this).to(equal, expectation);
          expect(mock.object_arg).to(equal, dummy);
          expect(mock.args_arg).to(equal, ['first argument', 'second argument']);
          expect(mock.args_arg instanceof Array).to(be_true);
        });

      });

      describe("and setting expected multiplicity", function(){

        it("should return self expectation", function(){
          var returned = expectation.should_receive('foo').exactly(2,'times');
          expect(returned).to(equal, expectation);
        });

        it("should store return value", function(){
          expectation.should_receive('foo').exactly(2,'times');
          expect(expectation.expected_count).to(equal, 2);
        });

      });

      describe("and setting expected this value", function(){

        it("should return self expectation", function(){
          var returned = expectation.should_receive('foo').on('expected this');
          expect(returned).to(equal, expectation);
        });

        it("should store expected this value", function(){
          expectation.should_receive('foo').on('expected this');
          expect(expectation.expected_this).to(equal, 'expected this');
        });

      });

      describe("and setting expected arguments", function(){

        it("should return self expectation", function(){
          var returned = expectation.should_receive('foo').with_args('first argument');
          expect(returned).to(equal, expectation);
        });

        it("should store expected arguments", function(){
          expectation.should_receive('foo').with_args('first argument', 'second argument');
          expect(expectation.expected_args).to(equal, ['first argument', 'second argument']);
          expect(expectation.expected_args instanceof Array).to(be_true);
        });

      });

      describe("and setting expected return value", function(){

        it("should return self expectation", function(){
          var returned = expectation.should_receive('foo').and_return('return value');
          expect(returned).to(equal, expectation);
        });

        it("should store return value", function(){
          expectation.should_receive('foo').and_return('return value');
          expect(expectation.return_value).to(equal, 'return value');
        });

      });

    });

    describe("mock callback", function(){

      it("should increment expectation's call counter", function(){
        expect(expectation.call_count).to(equal, 0);
        Smok.Expectation.callback.call(expectation, dummy);
        expect(expectation.call_count).to(equal, 1);
        Smok.Expectation.callback.call(expectation, dummy);
        expect(expectation.call_count).to(equal, 2);
      });

      it("should return proper value if one is given", function(){
        expectation.return_value = undefined;
        expect(Smok.Expectation.callback.call(expectation)).to(be_undefined);
        expectation.return_value = 'return value';
        expect(Smok.Expectation.callback.call(expectation)).to(equal, 'return value');
      });

      it("should only count calls on proper this if expected this is set", function(){
        expect(expectation.call_count).to(equal, 0);
        expectation.expected_this = dummy;
        Smok.Expectation.callback.call(expectation);
        expect(expectation.call_count).to(equal, 0);
        Smok.Expectation.callback.call(expectation, dummy);
        expect(expectation.call_count).to(equal, 1);
      });

      it("should only count calls with proper arguments if expected arguments are set", function(){
        expect(expectation.call_count).to(equal, 0);
        expectation.expected_args = ['first argument', 'second argument'];
        Smok.Expectation.callback.call(expectation, dummy);
        expect(expectation.call_count).to(equal, 0);
        Smok.Expectation.callback.call(expectation, dummy, ['first argument', 'second argument']);
        expect(expectation.call_count).to(equal, 1);
      });

    });

    describe("while checking expectation", function(){

      it("should return true when expected calls count equals actual calls count", function(){
        expectation.call_count = 1;
        expectation.expected_count = 1;
        expect(expectation.check()).to(be_true);
      });

      it("should return false when expected calls count doesn't equal actual calls count", function(){
        expectation.call_count = 0;
        expectation.expected_count = 1;
        expect(expectation.check()).to(be_false);
      });

    });

    describe("while reseting expectation", function(){

      var dummy_foo;

      before(function(){
        dummy_foo = dummy.foo;
      });

      after(function(){
        dummy.foo = dummy_foo;
      });

      it("should revert original function", function(){
        expectation.should_receive('foo');
        expectation.reset();
        expect(dummy.foo).to(equal, dummy_foo);
      });

    });

  });

  it("should have empty expectations list by default", function(){
    expect(Smok.expectations).to(equal, []);
  });

  describe("Mock", function(){

    var mock;

    before(function(){
      mock = {
        Smok_Expectation: Smok.Expectation,
        returned_expectation: 'mocked returned value'
      }

      Smok.Expectation = function(object, name){
        mock.object_param = object;
        mock.name_param = name;
        this.mock = mock.returned_expectation;
      };

      Smok.expectations = [];
    });

    after(function(){
      Smok.Expectation = mock.Smok_Expectation;
    });

    it("should create and return expectation", function(){
      var returned = Smok.Mock(dummy, dummy.name);
      expect(returned.mock).to(equal, mock.returned_expectation);
      expect(mock.object_param).to(equal, dummy);
      expect(mock.name_param).to(equal, dummy.name);
    });

    it("should add expectation to the expectations list", function(){
      Smok.Mock();
      expect(Smok.expectations).to(have_length, 1);
      expect(Smok.expectations[0].mock).to(equal, mock.returned_expectation);
    });

  });

  describe("while checking expectations", function(){

    var counter;

    before(function(){
      counter = 0;
      var expectations = [];
      for(var i = 0; i < 10; i++){
        expectations.push({ check: function(){ counter++; return true } });
      }
      Smok.expectations = expectations;
    });

    it("should return true if all expectations passed", function(){
      expect(Smok.check()).to(be_true);
      expect(counter).to(equal, 10);
    });

    it("should return false if any of expectations failed", function(){
      Smok.expectations[5] = { check: function(){ counter++; return false } };
      expect(Smok.check()).to(be_false);
      expect(counter).to(equal, 6);
    });

  });

  describe("while reseting expectations", function(){

    var counter;

    before(function(){
      counter = 0;
      var expectations = [];
      for(var i = 0; i < 10; i++){
        expectations.push({ reset: function(){ counter++; } });
      }
      Smok.expectations = expectations;
    });

    it("should reset all expectations", function(){
      Smok.reset();
      expect(counter).to(equal, 10);
    });

    it("should clean expectations list", function(){
      Smok.reset();
      expect(Smok.expectations).to(have_length, 0);
    });

  });

  describe("while comparing two values", function(){

    it("should return true if values are equal", function(){
      expect(Smok.compare('some string', 'some string')).to(be_true);
      expect(Smok.compare(dummy, dummy)).to(be_true);
      expect(Smok.compare(42, 40 + 2)).to(be_true);
    });

    describe("while comparing arrays", function(){

      it("should return false if arrays have different lengths", function(){
        var a = [1, 2, 3, 4], b = [1, 2, 3];
        expect(Smok.compare(a, b)).to(be_false);
      });

      it("should return false if any of elements are not equal", function(){
        var a = [1, 2, 3, 4], b = [1, 2, 2, 4];
        expect(Smok.compare(a, b)).to(be_false);
      });

      it("should return true if all of elements are equal", function(){
        var a = [1, 2, 3, 4], b = [1, 2, 3, 4];
        expect(Smok.compare(a, b)).to(be_true);
      });

    });

    describe("while comparing objects", function(){

      it("should return false if expected value doesn't have all properties from actual value", function(){
        var expected = { a: 'A', b: 'B', c: 'C' },
            actual = { a: 'A', b: 'B', c: 'C', d: 'D' };
        expect(Smok.compare(expected, actual)).to(be_false);
      });

      it("should return false if actual value doesn't have all properties from expected value", function(){
        var expected = { a: 'A', b: 'B', c: 'C', d:'D' },
            actual = { a: 'A', b: 'B', c: 'C' };
        expect(Smok.compare(expected, actual)).to(be_false);
      });

      it("should return false if any of properties values are different", function(){
        var expected = { a: 'A', b: 'B', c: 'C' },
            actual = { a: 'A', b: 'b', c: 'C' };
        expect(Smok.compare(expected, actual)).to(be_false);
      });

      it("should return true if values of all properties are equal", function(){
        var expected = { a: 'A', b: 'B', c: 'C' },
            actual = { a: 'A', b: 'B', c: 'C' };
        expect(Smok.compare(expected, actual)).to(be_true);
      });

    });

  });

});

});
