var MqttTasmotaBaseAccessory = require('./accessory')


class MqttTasmotaDoorbellAccessory extends MqttTasmotaBaseAccessory {

    constructor(log, config, api) {

        super(log, config, api)

        // TASMOTA vars
        this.mqttTeleTopic = config['teleTopic'] || this.buildTopic('tele', 'STATE')

        // STATE vars
        this.currentDoorbell = false; // last known state

        this.mqttClient.subscribe(this.mqttTeleTopic)

        // register the service and provide the callback functions
        this.service = new this.api.hap.Service.Doorbell(this.name)
        this.service
            .getCharacteristic(this.api.hap.Characteristic.ProgrammableSwitchEvent)
            .on('get', this.onGetOn.bind(this))
    }

    // MQTT handler
    onMqttMessage(topic, message) {

        super.onMqttMessage(topic, message)

        // message is raw string
        this.currentDoorbell = message.toString('utf-8').toLowerCase() === 'on'
        if (this.currentDoorbell) {
            this.service
                .getCharacteristic(this.api.hap.Characteristic.ProgrammableSwitchEvent)
                .updateValue(this.currentDoorbell)
            this.log('Updated CurrentDoorbell: %s', this.currentDoorbell)
        }
    }

    // Homebridge handlers
    onGetOn(callback) {
        this.log('Requested CurrentDoorbell: %s', this.currentDoorbell)
        callback(null, this.currentDoorbell)
    }
}

module.exports = MqttTasmotaDoorbellAccessory
