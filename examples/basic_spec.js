Screw.Unit(function(){

describe("Examples", function() {

  var dummy, mock;

  before(function(){
    // this is some dummy object we will mock in these examples
    dummy = { foo: function(){ return 'bar' } };
    // this is a mocked object we will use in tests
    mock = Smok.Mock(dummy);
  })

  after(function(){
    // after each test we should reset mocks
    Smok.reset();
  })

  it("shows how to create simple mock object", function(){
    // expect to recieve 'foo' exactly once
    mock.should_receive('foo');
    // mock expectations are not fulfilled yet
    expect(Smok.check()).to(be_false);
    // let's call mocked function
    dummy.foo();
    // mock expectations are now fulfilled
    expect(Smok.check()).to(be_true);
    // let's call it again
    dummy.foo();
    // mock expectations are not fulfilled as only one call was expected
    expect(Smok.check()).to(be_false);
  });

  it("shows how to give return value to mocked function call", function(){
    // expect 'foo' call and make it return 'hello!'
    mock.should_receive('foo').and_return('hello!');
    // calling dummy.foo() will return mocked value
    expect(dummy.foo()).to(equal, 'hello!');
    // after reset old function is back on place
    Smok.reset();
    expect(dummy.foo()).to(equal, 'bar');
  });

  it("shows how to expect multiple calls of mocked function", function(){
    // expect 'foo' to be called 3 times
    // 3 is parameter that matters, but 'times' makes it easy to read
    mock.should_receive('foo').exactly(3, 'times'); 
    // only after third call expectations will be fulfilled
    dummy.foo();
    expect(Smok.check()).to(be_false);
    dummy.foo();
    expect(Smok.check()).to(be_false);
    dummy.foo();
    expect(Smok.check()).to(be_true);
    dummy.foo();
    expect(Smok.check()).to(be_false);
  });

  it("shows how to expect arguments of mocked function", function(){
    // expect 'foo' to be called with some arguments
    mock.should_receive('foo').with_args(1, 'two', { three: /four/ });
    // calling 'foo' without arguments will not fulfill expectation
    dummy.foo();
    expect(Smok.check()).to(be_false);
    // so wont calling it with wrong arguments
    dummy.foo('wrong', 'arguments');
    expect(Smok.check()).to(be_false);
    // but calling it with right arguments will do
    dummy.foo(1, 'two', { three: /four/ });
    expect(Smok.check()).to(be_true);
  });

  describe("mocking jQuery", function(){

    var body, div;

    before(function(){
      body = $('body');
      div = body.find("#dummy");
    });

    it("shows how mock calls to jQuery with expectations of 'this'", function(){
      // jQuery elements functions are part of jQuery.fn prototype
      // thanks to on() expectation we can define what element we expect function to be called on

      // create a mock of jQuery and expect body to recieve add class with some args
      // and return same body element (to make jQuery chain work)
      Smok.Mock($.fn).on(body).should_receive('addClass').with_args("new").and_return(body);
      // we can than expect other calls on same or other elements
      Smok.Mock($.fn).on(body).should_receive('removeClass').with_args("old").and_return(body);
      Smok.Mock($.fn).on(div).should_receive('hide').and_return(div);

      // and this is the chain that fulfills the expectations
      $('body').addClass("new").removeClass("old").find("#dummy").hide();

      expect(Smok.check()).to(be_true);
    });

    it("shows how to simplify mocking jQuery with expectation plugin", function(){
      // let's create a plugin that will create a mock for given jQuery object
      // and simplify the code of jQuery expectations
      $.fn.should_receive = function(name){
        return Smok.Mock($.fn).should_receive(name).on(this).and_return(this);
      }
      // and rewrite previous example in a lot more readable way
      body.should_receive('addClass').with_args("new");
      body.should_receive('removeClass').with_args("old");
      div.should_receive('hide');

      $('body').addClass("new").removeClass("old").find("#dummy").hide();

      expect(Smok.check()).to(be_true);
    });

  });

});

});
