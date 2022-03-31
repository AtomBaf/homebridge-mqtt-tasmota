var MqttTasmotaBaseAccessory = require('./accessory')


class MqttTasmotaLightBulbAccessory extends MqttTasmotaBaseAccessory {

    constructor(log, config, api) {

        super(log, config, api)

        // TASMOTA vars
        this.mqttTopic = config['topic']
        this.mqttIndex = config['index'] || ''
        this.mqttResultTopic = config['resultTopic'] || 'stat/' + this.mqttTopic + '/RESULT' 
        this.mqttCommandTopic = config['commandTopic'] || 'cmnd/' + this.mqttTopic + '/POWER' + this.mqttIndex
        this.mqttCommandStateTopic = config['commandStateTopic'] || 'cmnd/' + this.mqttTopic + '/STATE'
        this.mqttDimmerTopic = config['dimmerTopic'] || 'cmnd/' + this.mqttTopic + '/Dimmer' + this.mqttIndex
        this.mqttTeleTopic = config['teleTopic'] || 'tele/' + this.mqttTopic + '/STATE'

        // STATE vars
        this.currentPower = 'OFF'; // last known power (OFF)
        this.currentBrightness = 0; // last known brightness (0)

        this.mqttClient.subscribe(this.mqttResultTopic)
        this.mqttClient.subscribe(this.mqttTeleTopic)

        // register the service and provide the callback functions
        this.service = new this.api.hap.Service.Lightbulb(this.name)
        this.service
            .getCharacteristic(this.api.hap.Characteristic.On)
            .on('get', this.onGetOn.bind(this))
            .on('set', this.onSetOn.bind(this))

        this.service
            .getCharacteristic(this.api.hap.Characteristic.Brightness)
            .on('get', this.onGetBrightness.bind(this))
            .on('set', this.onSetBrightness.bind(this));

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

        var isDimmer1 = message.hasOwnProperty('Dimmer') && this.mqttIndex == 1
        var isDimmerN = message.hasOwnProperty('Dimmer' + this.mqttIndex)

        if (isDimmer1 || isDimmerN) {
            // update CurrentBrightness
            this.currentBrightness = isDimmer1 ? message['Dimmer'] : message['Dimmer' + this.mqttIndex]
            this.service
                .getCharacteristic(this.api.hap.Characteristic.Brightness)
                .updateValue(this.currentBrightness)
            this.log('Updated CurrentBrightness: %d', this.currentBrightness)
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

    onGetBrightness(callback) {
        this.log('Requested CurrentBrightness: %d', this.currentBrightness)
        callback(null, this.currentBrightness)
    }

    onSetBrightness(brightness, callback) {
        this.log('Set Brighness: %d', brightness)
        this.currentBrightness = brightness
        this.mqttClient.publish(this.mqttDimmerTopic, "" + this.currentBrightness, this.mqttOptions)
        callback(null)
    }
}

module.exports = MqttTasmotaLightBulbAccessory

