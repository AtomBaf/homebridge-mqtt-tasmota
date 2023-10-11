var MqttTasmotaBaseAccessory = require('./accessory')


class MqttTasmotaSwitchAccessory extends MqttTasmotaBaseAccessory {

    constructor(log, config, api) {

        super(log, config, api)

        // TASMOTA vars
        this.mqttIndex = config['index'] || ''
        this.mqttResultTopic = config['resultTopic'] || this.buildTopic('stat', 'RESULT')
        this.mqttCommandTopic = config['commandTopic'] || this.buildTopic('cmnd', 'POWER' + this.mqttIndex)
        this.mqttCommandStateTopic = config['commandStateTopic'] || this.buildTopic('cmnd', 'STATE')
        this.mqttTeleTopic = config['teleTopic'] || this.buildTopic('tele', 'STATE')

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

        // send an state MQTT command to get the initial state
        this.mqttClient.publish(this.mqttCommandStateTopic, null, this.mqttOptions)
    }

    // MQTT handler
    onMqttMessage(topic, message) {

        if (super.onMqttMessage(topic, message)) {
             return true
        }

        // this callback can be called from both the STAT topic and the TELE topic
        // JSON format is nearly the same, eg:
        //  - TELE : {...,"POWER":"OFF",...}
        //  - STAT : {"POWER":"OFF"}
        // also, when using an mqttIndex > 1 the POWER property will be POWER2, POWER3, ...

        message = JSON.parse(message.toString('utf-8'))

        var isPower1 = message.hasOwnProperty('POWER') && this.mqttIndex == 1
        var isPowerN = message.hasOwnProperty('POWER' + this.mqttIndex)

        if (isPower1 || isPowerN) {
            // update CurrentState
            this.currentPower = isPower1 ? message['POWER'] : message['POWER' + this.mqttIndex]
            this.service
                .getCharacteristic(this.api.hap.Characteristic.On)
                .updateValue(this.currentPower === 'ON')
            this.log('Updated CurrentPower: %s', this.currentPower)
        }
    }

    // Homebridge handlers
    onGetOn(callback) {
        this.log('Requested CurrentPower: %s', this.currentPower)
        callback(this.currentStatusCode(), this.currentPower === 'ON')
    }

    onSetOn(power, callback) {
        this.log('Set Power: %s', power)
        this.currentPower = power ? 'ON' : 'OFF'
        this.mqttClient.publish(this.mqttCommandTopic, this.currentPower, this.mqttOptions)
        callback(this.currentStatusCode())
    }
}

module.exports = MqttTasmotaSwitchAccessory

