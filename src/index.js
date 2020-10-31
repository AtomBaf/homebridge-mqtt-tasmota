var MqttTasmotaBlindsAccessory = require('./blinds')


module.exports = (api) => {
    api.registerAccessory('mqtt-tasmota-blinds', MqttTasmotaBlindsAccessory)
}
