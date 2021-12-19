var MqttTasmotaBaseAccessory = require('./accessory')


class MqttTasmotaSwitchAccessory extends MqttTasmotaBaseAccessory {

    constructor(log, config, api) {

        super(log, config, api)

        // TASMOTA vars
        this.mqttTopic = config['topic']
        this.index = config['index'] || ''
        this.mqttResultTopic = config['resultTopic'] || 'stat/' + this.mqttTopic + '/RESULT' 
        this.mqttCommandTopic = config['commandTopic'] || 'cmnd/' + this.mqttTopic + '/POWER' + this.index
        this.mqttCommandStateTopic = config['commandStateTopic'] || 'cmnd/' + this.mqttTopic + '/STATE'
        this.mqttTeleTopic = config['teleTopic'] || 'tele/' + this.mqttTopic + '/STATE'

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

        super.onMqttMessage(topic, message)

        // this callback can be called from both the STAT topic and the TELE topic
        // JSON format is nearly the same, eg:
        //  - TELE : {...,"POWER":"OFF",...}
        //  - STAT : {"POWER":"OFF"}
        message = JSON.parse(message.toString('utf-8'))

        if (message.hasOwnProperty('POWER' + this.index)) {
            // update CurrentState
            this.currentPower = message['POWER' + this.index]
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

