JSpec.include({

  formatters : {

    JSpecTerminal: JSpec.formatters.Terminal,

    Terminal : function(results, options) {
      JSpec.formatters.JSpecTerminal(results, options)
      color = JSpec.color
      print(color(" Passes: ", 'bold') + color(results.stats.passes, 'green') + 
          color(" Failures: ", 'bold') + color(results.stats.failures, 'red') + "\n")
    }

  }

})

