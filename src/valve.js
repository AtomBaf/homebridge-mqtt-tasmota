var MqttTasmotaBaseAccessory = require('./accessory')


class MqttTasmotaValveAccessory extends MqttTasmotaBaseAccessory {

    constructor(log, config, api) {

        super(log, config, api)

        // device setup
        this.icon = config['icon'] || 'generic'

        // TASMOTA vars
        this.mqttIndex = config['index'] || ''
        this.mqttResultTopic = config['resultTopic'] || this.buildTopic('stat', 'RESULT')
        this.mqttCommandTopic = config['commandTopic'] || this.buildTopic('cmnd', 'POWER' + this.mqttIndex)
        this.mqttCommandStateTopic = config['commandStateTopic'] || this.buildTopic('cmnd', 'STATE')
        this.mqttTeleTopic = config['teleTopic'] || this.buildTopic('tele', 'STATE')

        // STATE vars
        this.currentActive = false; // last known state (default is not active)
        this.currentDuration = 3600; // 1 hour
        this.currentRemainingDuration = 3600; // 1 hour
        this.programMode = 3

        this.mqttClient.subscribe(this.mqttResultTopic)
        this.mqttClient.subscribe(this.mqttTeleTopic)

        // register the service and provide the callback functions
        this.service = new this.api.hap.Service.Valve(this.name)

        var valveType = "0"
        switch (this.icon) {
            case 'generic':
                valveType = "0"
                break;
            case 'irrigation':
                valveType = "1"
                break;
            case 'shower-head':
                valveType = "2"
                break;
            case 'faucet':
                valveType = "3"
                break;
            default:
                this.log('Unknown icon type "' + this.icon + '", defaulting to "generic"');
                valveType = "3"
                break;
        }
        this.service.setCharacteristic(this.api.hap.Characteristic.ValveType, valveType)

        this.service
            .getCharacteristic(this.api.hap.Characteristic.Active)
            .on('get', this.onGetActive.bind(this))
            .on('set', this.onSetActive.bind(this))

        this.service
            .getCharacteristic(this.api.hap.Characteristic.InUse)
            .on('get', this.onGetInUse.bind(this))

        this.service
            .getCharacteristic(this.api.hap.Characteristic.SetDuration)
            .on('get', this.onGetDuration.bind(this))

        this.service
            .getCharacteristic(this.api.hap.Characteristic.RemainingDuration)
            .on('get', this.onGetRemainingDuration.bind(this))

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
            this.currentActive = (isPower1 ? message['POWER'] : message['POWER' + this.mqttIndex]) === 'ON'

            this.service
                .getCharacteristic(this.api.hap.Characteristic.Active)
                .updateValue(this.currentActive)

            this.service
                .getCharacteristic(this.api.hap.Characteristic.InUse)
                .updateValue(this.currentActive)

            this.log('Updated Active: %s', this.currentActive)
        }

        // this message may also contain useful information about the remaining timers
        var isTimerN = message.hasOwnProperty('T' + this.mqttIndex)

        if (isTimerN) {
            // update RemainingDuration
            this.currentRemainingDuration = parseInt(message['T' + this.mqttIndex])

            const maxRemainingDuration = this.currentRemainingDuration > 3600 ? 3600 : this.currentRemainingDuration

            this.service
                .getCharacteristic(this.api.hap.Characteristic.RemainingDuration)
                .updateValue(maxRemainingDuration)

            this.log('Updated RemainingDuration: %s (from actually %s)', maxRemainingDuration, this.currentRemainingDuration)
        }

    }

    // Homebridge handlers
    onGetActive(callback) {
        this.log('Requested Active: %s', this.currentActive)
        callback(this.currentStatusCode(), this.currentActive)
    }

    onSetActive(active, callback) {
        this.log('Set Active: %s', active)
        this.currentActive = active
        this.mqttClient.publish(this.mqttCommandTopic, this.currentActive ? 'ON': 'OFF', this.mqttOptions)
        callback(this.currentStatusCode())
    }

    onGetInUse(callback) {
        this.log('Requested InUse: %s', this.currentActive)
        callback(this.currentStatusCode(), this.currentActive)
    }

    onGetRemainingDuration(callback) {
        this.log('Requested RemainingDuration: %s', this.currentRemainingDuration)
        const maxRemainingDuration = this.currentRemainingDuration > 3600 ? 3600 : this.currentRemainingDuration
        callback(this.currentStatusCode(), maxRemainingDuration)
    }

    onGetDuration(callback) {
        this.log('Requested Duration: %s', this.currentDuration)
        callback(this.currentStatusCode(), this.currentDuration)
    }
}

module.exports = MqttTasmotaValveAccessory

