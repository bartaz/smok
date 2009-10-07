describe 'Smok'

  before_each
    dummy = { name: 'Dummy', foo: function() { return 'bar' } }
  end

  describe 'Expectation'

    before_each
      expectation = new Smok.Expectation(dummy, dummy.name)
    end

    describe 'while creating new expectation'

      it 'should create new expectation for given object'
        expectation.object.should.eql dummy
      end

      it 'should create expectation with given name'
        expectation.name.should.eql dummy.name
      end

      it 'should create expectation with default name if not given'
        expectation = new Smok.Expectation(dummy)
        expectation.name.should.eql 'John Doe'
      end

      it 'should have call counter reset to 0'
        expectation.call_count.should.be 0
      end

      it 'should have expected counter set to 0'
        expectation.expected_count.should.be 0
      end

      it 'should have expected this set to given object'
        expectation.expected_this.should.eql dummy
      end

      it 'should not fail if calls are not expected'
        expectation.check().should.be true
      end

    end

    describe 'while expecting function calls'

      describe 'and setting mocked function'

        before_each
          dummy_foo = dummy.foo
          expectation.expects('foo')
        end

        it 'should return self expectation'
          expectation.expects('foo').should.eql expectation
        end

        it 'should store name of expected function'
          expectation.function_name.should.eql 'foo'
        });

        it 'should set expected call count to 1'
          expectation.expected_count.should.eql 1
        end

        it 'should replace expected function with mocked one'
          dummy.foo.should_not.eql dummy_foo
        end

        it 'should store reference to original function'
          expectation.original_function.should.eql dummy_foo
        end

        it 'should call mock callback with proper arguments when mocked function is called'
          original = Smok.Expectation.callback
          Smok.Expectation.should.receive('callback', 'once')
              .with_args(dummy, ['first argument', 'second argument'])
              .and_return(undefined)
          dummy.foo('first argument', 'second argument').should.be undefined
          Smok.Expectation.callback = original
        end
        
      end

      describe 'and setting expected multiplicity'

        it 'should return self expectation'
          expectation.expects('foo').exactly(2,'times').should.eql expectation
        end

        it 'should store expected count value'
          expectation.expects('foo').exactly(2,'times')
          expectation.expected_count.should.eql 2
        end

      end

      describe 'and setting expected this value'

        it 'should return self expectation'
          expectation.expects('foo').on('expected this').should.eql expectation
        end

        it 'should store expected this value'
          expectation.expects('foo').on('expected this')
          expectation.expected_this.should.eql 'expected this'
        end

      end

      describe "and setting expected arguments"

        it 'should return self expectation'
          expectation.expects('foo').with_args('first argument').should.eql expectation
        });

        it 'should store expected arguments'
          expectation.expects('foo').with_args('first argument', 'second argument')
          expectation.expected_args.should.eql ['first argument', 'second argument']
          expectation.expected_args.should.be_an_instance_of Array
        end

      end

      describe 'and setting expected return value'

        it 'should return self expectation'
          expectation.expects('foo').and_return('return value').should.eql expectation
        end

        it 'should store return value'
          expectation.expects('foo').and_return('return value')
          expectation.return_value.should.equal 'return value'
        end

      end

    end

    describe 'mock callback'

      it "should increment expectation's call counter"
        expectation.call_count.should.be 0
        Smok.Expectation.callback.call(expectation, dummy)
        expectation.call_count.should.be 1
        Smok.Expectation.callback.call(expectation, dummy)
        expectation.call_count.should.be 2
      end

      it "should return proper value if one is given"
        expectation.return_value = undefined
        Smok.Expectation.callback.call(expectation).should.be undefined
        expectation.return_value = 'return value'
        Smok.Expectation.callback.call(expectation).should.equal 'return value'
      end

      it "should only count calls on proper this if expected this is set"
        expectation.call_count.should.be 0
        expectation.expected_this = dummy
        Smok.Expectation.callback.call(expectation)
        expectation.call_count.should.be 0
        Smok.Expectation.callback.call(expectation, dummy)
        expectation.call_count.should.be 1
      end

      it "should only count calls with proper arguments if expected arguments are set"
        expectation.call_count.should.be 0
        expectation.expected_args = ['first argument', 'second argument']
        Smok.Expectation.callback.call(expectation, dummy)
        expectation.call_count.should.be 0
        Smok.Expectation.callback.call(expectation, dummy, ['first argument', 'second argument'])
        expectation.call_count.should.be 1
      end

    end

    describe 'while checking expectation'

      it 'should return true when expected calls count equals actual calls count'
        expectation.call_count = 1
        expectation.expected_count = 1
        expectation.check().should.be true
      end

      it "should return false when expected calls count doesn't equal actual calls count"
        expectation.call_count = 0
        expectation.expected_count = 1
        expectation.check().should.be false
      end

    end

    describe 'while reseting expectation'

      it "should revert original function"
        original_dummy_foo = dummy.foo
        expectation.expects('foo')
        expectation.reset();
        dummy.foo.should.be original_dummy_foo
      end

    end

  end

  it 'should have empty expectations list by default'
    Smok.expectations.should.be_empty
  end

  describe 'Mock'

    after_each
      Smok.expectations = []
    end

    it "should create and return expectation"
      Smok.should.receive('Expectation', 'once').with_args(dummy, dummy.name)
      Smok.Mock(dummy, dummy.name).should.be_an_instance_of Smok.Expectation
    end

    it "should add expectation to the expectations list"
      Smok.Mock()
      Smok.expectations.should.have_length 1
      Smok.expectations[0].should.be_an_instance_of Smok.Expectation
    end

  end

  describe "while checking expectations"

    before_each
      counter = 0
      var expectations = []
      for(var i = 0; i < 10; i++){
        expectations.push({ check: function(){ counter++; return true } });
      }
      Smok.expectations = expectations
    end

    after_each
      Smok.expectations = []
    end

    it "should return true if all expectations passed"
      Smok.check().should.be true
      counter.should.equal 10
    end

    it "should return false if any of expectations failed"
      Smok.expectations[5] = { check: function(){ counter++; return false } }
      Smok.check().should.be false
      counter.should.equal 6
    end

  end

  describe("while reseting expectations", function(){

    before_each
      counter = 0
      var expectations = []
      for(var i = 0; i < 10; i++){
        expectations.push({ reset: function(){ counter++; } })
      }
      Smok.expectations = expectations;
    end

    after_each
      Smok.expectations = []
    end

    it "should reset all expectations"
      Smok.reset()
      counter.should.equal 10
    end

    it "should clean expectations list"
      Smok.reset()
      Smok.expectations.should.be_empty
    end

  end

  describe 'while comparing two values'

    it "should return true if values are equal"
      Smok.compare('some string', 'some string').should.be true
      Smok.compare(dummy, dummy).should.be true
      Smok.compare(42, 40 + 2).should.be true
    end

    describe "while comparing arrays"

      it "should return false if arrays have different lengths"
        a = [1, 2, 3, 4], b = [1, 2, 3]
        Smok.compare(a, b).should.be false
      end

      it "should return false if any of elements are not equal"
        a = [1, 2, 3, 4], b = [1, 2, 2, 4]
        Smok.compare(a, b).should.be false
      end

      it "should return true if all of elements are equal"
        a = [1, 2, 3, 4], b = [1, 2, 3, 4]
        Smok.compare(a, b).should.be true
      end

    end

    describe "while comparing objects"

      it "should return false if expected value doesn't have all properties from actual value"
        expected = { a: 'A', b: 'B', c: 'C' },
        actual = { a: 'A', b: 'B', c: 'C', d: 'D' }
        Smok.compare(expected, actual).should.be false
      end

      it "should return false if actual value doesn't have all properties from expected value"
        expected = { a: 'A', b: 'B', c: 'C', d:'D' }
        actual = { a: 'A', b: 'B', c: 'C' }
        Smok.compare(expected, actual).should.be false
      end

      it "should return false if any of properties values are different"
        expected = { a: 'A', b: 'B', c: 'C' }
        actual = { a: 'A', b: 'b', c: 'C' }
        Smok.compare(expected, actual).should.be false
      end

      it "should return true if values of all properties are equal"
        expected = { a: 'A', b: 'B', c: 'C' }
        actual = { a: 'A', b: 'B', c: 'C' }
        Smok.compare(expected, actual).should.be true
      end

    end

  end

end

