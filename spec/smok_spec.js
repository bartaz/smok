Screw.Unit(function(){ 

describe("Smok", function() {

  var dummy;

  before(function(){
    dummy = { name: 'Dummy', foo: function() { return 'bar' } };
  });

  describe("Expectation", function() {

    var expectation;

    before(function(){
      expectation = Smok.Expectation(dummy, dummy.name);
    });

    describe("while creating new expectation", function(){

      it("should create new expectation for given object", function(){
        var expectation = Smok.Expectation(dummy);
        expect(expectation).to_not(be_undefined);
        expect(expectation.object).to(equal, dummy);
      });

      it("should create expectation with given name", function(){
        var expectation = Smok.Expectation(dummy, dummy.name);
        expect(expectation.name).to(equal, dummy.name);
      });

      it("should create expectation with default name if not given", function(){
        var expectation = Smok.Expectation(dummy);
        expect(expectation.name).to(equal, 'John Doe');
      });

      it("should have call counter reset to 0", function(){
        var expectation = Smok.Expectation(dummy);
        expect(expectation.call_count).to(equal, 0);
      });

    });

    describe("while expecting function calls", function(){

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

      describe("setting mocked function", function(){

        var dummy_foo;

        before(function(){
          dummy_foo = dummy.foo;
        });

        after(function(){
          dummy.foo = dummy_foo;
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

      describe("while calling mocked function", function(){

        it("should increment expectation's call counter", function(){
          expectation.should_receive('foo');
          expect(expectation.call_count).to(equal, 0);
          dummy.foo();
          expect(expectation.call_count).to(equal, 1);
          dummy.foo();
          expect(expectation.call_count).to(equal, 2);
        });

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
        return mock.returned_expectation;
      };

      Smok.expectations = [];
    });

    after(function(){
      Smok.Expectation = mock.Smok_Expectation;
    });

    it("should create and return expectation", function(){
      var returned = Smok.Mock(dummy, dummy.name);
      expect(returned).to(equal, mock.returned_expectation);
      expect(mock.object_param).to(equal, dummy);
      expect(mock.name_param).to(equal, dummy.name);
    });

    it("should add expectation to the expectations list", function(){
      Smok.Mock();
      expect(Smok.expectations).to(have_length, 1);
      expect(Smok.expectations[0]).to(equal, mock.returned_expectation);
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

});

});
