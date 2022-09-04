var blinds = require('./blinds')
var switches = require('./switch')
var temperature = require('./temperature')
var humidity = require('./humidity')
var smoke = require('./smoke')
var doorbell = require('./doorbell')
var fan = require('./fan')
var lightbulb = require('./lightbulb')


handlers = {
    'mqtt-tasmota-blinds': blinds,
    'mqtt-tasmota-switch': switches,
    'mqtt-tasmota-temperature': temperature,
    'mqtt-tasmota-humidity': humidity,
    'mqtt-tasmota-smoke': smoke,
    'mqtt-tasmota-doorbell': doorbell,
    'mqtt-tasmota-fan': fan,
    'mqtt-tasmota-lightbulb': lightbulb
}

class MqttTasmotaAccessory {

    constructor(log, config, api) {
        log('New mqtt-tasmota accessory', config.accessory)
        if (config.accessory == 'mqtt-tasmota') {
            this.type = 'mqtt-tasmota-' + config['type']
        } else {
            // deprecated handler declaration
            this.type = config.accessory
            log('Warning: "mqtt-tasmota-[lightbulb|switch|blinds|...]" accessory is deprecated as of v0.4.0, use "mqtt-tasmota" with "type" config instead', config.accessory)
        }
        this.handler = new handlers[this.type](log, config, api)
    }

    // Homebridge callback to get service list
    getServices() {
        return this.handler.getServices()
    }
}

module.exports = (api) => {
    // normal handlers
    api.registerAccessory('mqtt-tasmota', MqttTasmotaAccessory)

    // deprecated handler declaration
    for (var name in handlers) {
        api.registerAccessory(name, MqttTasmotaAccessory)
    }
}
