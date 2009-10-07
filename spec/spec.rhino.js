
load('./spec/lib/jspec.js')
load('./spec/spec.helper.js')
load('lib/smok.js')

JSpec
.exec('spec/spec.smok.js')
.run({ formatter: JSpec.formatters.TerminalSpec })
.report()
