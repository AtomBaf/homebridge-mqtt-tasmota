var MqttTasmotaBlindsAccessory = require('./blinds')


module.exports = (api) => {
    //api.registerAccessory('homebridge-mqtt-tasmota-blinds', MqttTasmotaBlindsAccessory)
    api.registerAccessory('homebridge-mqtt-tasmota-blinds', MqttTasmotaBlindsAccessory)
}
