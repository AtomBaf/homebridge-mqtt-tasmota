var MqttTasmotaBaseAccessory = require('./base')


class MqttTasmotaSwitchAccessory extends MqttTasmotaBaseAccessory {

    constructor(log, config, api) {

        super(log, config, api)

        // TASMOTA vars
        this.mqttTopic = config['mqttTopic']
        this.mqttResultTopic = config["mqttResultTopic"] || 'stat/' + this.mqttTopic + '/RESULT'
        this.mqttCommandTopic = config["mqttCommandTopic"] || 'cmnd/' + this.mqttTopic + '/POWER'
        this.mqttTeleTopic = config["mqttTeleTopic"] || 'tele/' + this.mqttTopic + '/STATE'

        // STATE vars
        this.currentPower = 'OFF'; // last known power (OFF)

        this.mqttClient.subscribe(this.mqttResultTopic)
        this.mqttClient.subscribe(this.mqttTeleTopic)

        // register the service and provide the callback functions
        this.service = new this.api.hap.Service.Switch(this.name)
        this.service
            .getCharacteristic(this.api.hap.Characteristic.On)
            .on('get', this.onGetOn.bind(this))
            .on('set', this.onSetOn.bind(this))

        // send an empty MQTT command to get the initial state
        this.mqttClient.publish(this.mqttCommandTopic, null, this.mqttOptions)
    }

    // MQTT handler
    onMqttMessage(topic, message) {

        super.onMqttMessage(topic, message)

        // this callback can be called from both the STAT topic and the TELE topic
        // JSON format is nearly the same, eg:
        //  - TELE : {...,"POWER":"OFF",...}
        //  - STAT : {"POWER":"OFF"}
        message = JSON.parse(message.toString('utf-8'))

        if (message.hasOwnProperty('POWER')) {
            // update CurrentState
            this.currentPower = message['POWER']
            this.service
                .getCharacteristic(this.api.hap.Characteristic.On)
                .updateValue(this.currentPower === 'ON')
            this.log('Updated CurrentPower: %s', this.currentPower)
        }
    }

    // Homebridge handlers
    onGetOn(callback) {
        this.log('Requested CurrentPower: %s', this.currentPower)
        callback(null, this.currentPower === 'ON')
    }

    onSetOn(power, callback) {
        this.log('Set Power: %s', power)
        this.currentPower = power ? 'ON' : 'OFF'
        this.mqttClient.publish(this.mqttCommandTopic, this.currentPower, this.mqttOptions)
        callback(null)
    }
}

module.exports = MqttTasmotaSwitchAccessory

