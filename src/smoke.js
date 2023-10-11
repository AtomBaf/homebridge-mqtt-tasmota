var MqttTasmotaBaseAccessory = require('./accessory')


class MqttTasmotaSmokeAccessory extends MqttTasmotaBaseAccessory {

    constructor(log, config, api) {

        super(log, config, api)

        // TASMOTA vars
        this.mqttTeleTopic = config["teleTopic"] || this.buildTopic('tele', 'STATE')

        // STATE vars
        this.currentSmoke = false; // last known Smoke state

        this.mqttClient.subscribe(this.mqttTeleTopic)

        // register the service and provide the callback functions
        this.service = new this.api.hap.Service.SmokeSensor(this.name)
        this.service
            .getCharacteristic(this.api.hap.Characteristic.SmokeDetected)
            .on('get', this.onGetOn.bind(this))
    }

    currentStatusCode() {
        // sensor are always considered alive?
        return null
    }

    // MQTT handler
    onMqttMessage(topic, message) {

        if (super.onMqttMessage(topic, message)) {
             return true
        }

        // message is raw string
        this.currentSmoke = message.toString('utf-8').toLowerCase() === 'on'
        this.service
            .getCharacteristic(this.api.hap.Characteristic.SmokeDetected)
            .updateValue(this.currentSmoke)
        this.log('Updated CurrentSmoke: %s', this.currentSmoke)
    }

    // Homebridge handlers
    onGetOn(callback) {
        this.log('Requested CurrentSmoke: %s', this.currentSmoke)
        callback(this.currentStatusCode(), this.currentSmoke)
    }
}

module.exports = MqttTasmotaSmokeAccessory
