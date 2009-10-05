Screw.Unit(function(){ 

describe("Smok", function() {

  describe("Expectation", function() {

    var dummy, expectation;

    before(function(){
      dummy = { foo: function() { return 'bar' } };
      expectation = Smok.Expectation(dummy, 'Dummy');
    });

    describe("while creating new expectation", function(){

      it("should create new expectation for given object", function(){
        var expectation = Smok.Expectation(dummy);
        expect(expectation).to_not(be_undefined);
        expect(expectation.object).to(equal, dummy);
      });

      it("should create expectation with given name", function(){
        var expectation = Smok.Expectation(dummy, 'Dummy');
        expect(expectation.name).to(equal, 'Dummy');
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

      it("should replace expected function with mocked one", function(){
        expectation.should_receive('foo');
        expect(dummy.foo).to_not(equal, dummy_foo);
      });

      it("should store reference to original function", function(){
        expectation.should_receive('foo');
        expect(expectation.original_function).to(equal, dummy_foo);
      });

      it("should set expected call count to 1", function(){
        expectation.should_receive('foo');
        expect(expectation.expected_count).to(equal, 1);
      });

      describe("while calling mocked function", function(){

        it("should increment expectation's call counter", function(){
          expectation.should_receive('foo')
          expect(expectation.call_count).to(equal, 0);
          dummy.foo();
          expect(expectation.call_count).to(equal, 1);
          dummy.foo();
          expect(expectation.call_count).to(equal, 2);
        });

      });

    });

  });

});

});
