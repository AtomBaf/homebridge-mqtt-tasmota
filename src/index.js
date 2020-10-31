var blinds = require('./blinds')
var switches = require('./switch')
var temperature = require('./temperature')
var humidity = require('./humidity')
var smoke = require('./smoke')


module.exports = (api) => {
    api.registerAccessory('mqtt-tasmota-blinds', blinds)
    api.registerAccessory('mqtt-tasmota-switch', switches)
    api.registerAccessory('mqtt-tasmota-temperature', temperature)
    api.registerAccessory('mqtt-tasmota-humidity', humidity)
    api.registerAccessory('mqtt-tasmota-smoke', smoke)
}
