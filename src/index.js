var blinds = require('./blinds')
var switches = require('./switch')
var temperature = require('./temperature')
var humidity = require('./humidity')
var smoke = require('./smoke')
var doorbell = require('./doorbell')
var fan = require('./fan')
var lightbulb = require('./lightbulb')


handlers = {
    'blinds': blinds,
    'switch': switches,
    'temperature': temperature,
    'humidity': humidity,
    'smoke': smoke,
    'doorbell': doorbell,
    'fan': fan,
    'lightbulb': lightbulb
}

class MqttTasmotaAccessory {

    constructor(log, config, api) {

        this.type = config['type']
        this.handler = new handlers[this.type](log, config, api)
    }

    // Homebridge callback to get service list
    getServices() {
        return this.handler.getServices()
    }
}

module.exports = (api) => {
    api.registerAccessory('mqtt-tasmota', MqttTasmotaAccessory)
}
