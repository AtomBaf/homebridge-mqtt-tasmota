var MqttTasmotaBaseAccessory = require('./accessory')


class MqttTasmotaFanAccessory extends MqttTasmotaBaseAccessory {

    constructor(log, config, api) {

        super(log, config, api)

        // TASMOTA vars
        this.mqttTopic = config['topic']
        this.mqttResultTopic = config['resultTopic'] || this.buildTopic('stat', 'RESULT')
        this.mqttCommandTopic = config['commandTopic'] || this.buildTopic('cmnd', 'FANSPEED')
        this.mqttCommandStateTopic = config['commandStateTopic'] || this.buildTopic('cmnd', 'STATE')
        this.mqttTeleTopic = config['teleTopic'] || this.buildTopic('tele', 'STATE')

        // STATE vars
        this.currentSpeed = 0

        this.mqttClient.subscribe(this.mqttResultTopic)
        this.mqttClient.subscribe(this.mqttTeleTopic)

        // register the service and provide the callback functions
        this.service = new this.api.hap.Service.Fan(this.name)
        this.service
            .getCharacteristic(this.api.hap.Characteristic.On)
            .on('get', this.onGetOn.bind(this))
            .on('set', this.onSetOn.bind(this))

        this.service
            .getCharacteristic(this.api.hap.Characteristic.RotationSpeed)
            .setProps({ minValue: 0, maxValue: 3})
            .on('get', this.onGetSpeed.bind(this))
            .on('set', this.onSetSpeed.bind(this))

        // send a state MQTT command to get the initial state
        this.mqttClient.publish(this.mqttCommandStateTopic, null, this.mqttOptions)
    }

    // MQTT handler
    onMqttMessage(topic, message) {

        super.onMqttMessage(topic, message)

        message = JSON.parse(message.toString('utf-8'))

        if (message.hasOwnProperty('FanSpeed')) {
            // update current speed
            this.currentSpeed = message['FanSpeed']
            this.service
                .getCharacteristic(this.api.hap.Characteristic.RotationSpeed)
                .updateValue(this.currentSpeed)
            this.service
                .getCharacteristic(this.api.hap.Characteristic.On)
                .updateValue(this.currentSpeed > 0)

            this.log('Updated CurrentSpeed: %s', this.currentSpeed)
        }
    }

    // Homebridge handlers
    onGetOn(callback) {
        this.log('Requested CurrentPower: %s', this.currentSpeed > 0)
        callback(null, this.currentSpeed > 0)
    }

    onSetOn(power, callback) {
        this.log('Set Power: %s', power)
        this.currentSpeed = !power ? 0 : this.currentSpeed == 0 ? 3 : this.currentSpeed
        this.mqttClient.publish(this.mqttCommandTopic, "" + this.currentSpeed, this.mqttOptions)
        callback(null)
    }

    onGetSpeed(callback) {
        this.log('Requested CurrentSpeed: %s', this.currentPower)
        callback(null, this.currentSpeed)
    }

    onSetSpeed(speed, callback) {
        this.log('Set Speed: %s', speed)
        this.currentSpeed = speed
        this.mqttClient.publish(this.mqttCommandTopic, "" + this.currentSpeed, this.mqttOptions)
        callback(null)
    }
}

module.exports = MqttTasmotaFanAccessory

