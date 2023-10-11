var blinds = require('./blinds')
var switches = require('./switch')
var smoke = require('./smoke')
var doorbell = require('./doorbell')
var fan = require('./fan')
var lightbulb = require('./lightbulb')
var sensor = require('./sensor')
var valve = require('./valve')


handlers = {
    'mqtt-tasmota-blinds': blinds,
    'mqtt-tasmota-switch': switches,
    'mqtt-tasmota-temperature': sensor,
    'mqtt-tasmota-humidity': sensor,
    'mqtt-tasmota-smoke': smoke,
    'mqtt-tasmota-doorbell': doorbell,
    'mqtt-tasmota-fan': fan,
    'mqtt-tasmota-lightbulb': lightbulb,
    'mqtt-tasmota-sensor': sensor,
    'mqtt-tasmota-valve': valve
}

class MqttTasmotaAccessory {

    constructor(log, config, api) {
        log('New mqtt-tasmota accessory', config.accessory)
        if (config.accessory == 'mqtt-tasmota') {
            this.type = 'mqtt-tasmota-' + config['type']
            // include type in the uuid_base of the config to prevent duplicate UUIDs
            // since homebridge will generate a unique id with only the name for a given accessory
            config.uuid_base = config.type + ':' + config.name 
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
