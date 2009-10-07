JSpec.include({

  formatters : {
    TerminalSpec : function(results, options) {
      JSpec.formatters.Terminal(results, options)
      color = JSpec.color
      print(color(" Passes: ", 'bold') + color(results.stats.passes, 'green') + 
          color(" Failures: ", 'bold') + color(results.stats.failures, 'red') + "\n")
    }
  }

})

