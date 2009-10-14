load('./spec/lib/jspec.js')

load('./spec/lib/env.rhino.js')
Envjs("/spec/spec.smok.html", { logLevel: 0 });

load('./spec/lib/jquery.js')
load('./spec/lib/jspec.jquery.js')
load('./spec/spec.helper.js')
load('lib/smok.js')

JSpec
.exec('spec/spec.smok.js')
.run({ formatter: JSpec.formatters.Terminal })
.report()
