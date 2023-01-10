var MqttTasmotaBaseAccessory = require('./accessory')
var counter = 0

class MqttTasmotaBlindsAccessory extends MqttTasmotaBaseAccessory {

    constructor(log, config, api) {

        super(log, config, api)

        // MQTT vars
        this.mqttIndex = config['index'] || '1'
        this.mqttShutterName = config['shutterName']  || 'Shutter' + this.mqttIndex
        this.mqttResultTopic = config['resultTopic'] || this.buildTopic('stat', 'RESULT')
        this.mqttCommandTopic = config['commandTopic'] || this.buildTopic('cmnd', 'ShutterPosition' + this.mqttIndex)
        this.mqttTeleTopic = config['teleTopic'] || this.buildTopic('tele', 'SENSOR')

        // STATE vars
        this.lastPosition = 100; // last known position of the blinds (open)
        this.currentPositionState = 2; // stopped by default
        this.currentTargetPosition = this.lastPosition; // same as last known position

        this.mqttClient.subscribe(this.mqttResultTopic)
        this.mqttClient.subscribe(this.mqttTeleTopic)

        // register the service and provide the callback functions
        this.service = new this.api.hap.Service.WindowCovering(this.name)

        // the current position (0-100%)
        this.service
            .getCharacteristic(this.api.hap.Characteristic.CurrentPosition)
            .on('get', this.onGetCurrentPosition.bind(this))

        // the position state (0 = DECREASING, 1 = INCREASING, 2 = STOPPED)
        this.service
            .getCharacteristic(this.api.hap.Characteristic.PositionState)
            .on('get', this.onGetPositionState.bind(this))

        // the target position (0-100%)
        this.service
            .getCharacteristic(this.api.hap.Characteristic.TargetPosition)
            .on('get', this.onGetTargetPosition.bind(this))
            .on('set', this.onSetTargetPosition.bind(this))

        // send an empty MQTT command to get the initial state
        this.mqttClient.publish(this.mqttCommandTopic, null, this.mqttOptions)
    }

    // MQTT handler
    onMqttMessage(topic, message) {

        super.onMqttMessage(topic, message)

        // this callback can be called from both the STAT topic and the TELE topic
        // JSON format is nearly the same, eg:
        //  - TELE : {"Time":"2020-09-12T13:55:32","Shutter1":{"Position":0,"Direction":0,"Target":0},"Shutter2":{"Position":0,"Direction":0,"Target":0}}
        //  - STAT : {"Shutter2":{"Position":100,"Direction":0,"Target":100}}
        message = JSON.parse(message.toString('utf-8'))
        if (message.hasOwnProperty(this.mqttShutterName)) {

            if (message[this.mqttShutterName].hasOwnProperty('Position')) {
                // update CurrentPosition
                this.lastPosition = parseInt(message[this.mqttShutterName]['Position'])
                this.service
                    .getCharacteristic(this.api.hap.Characteristic.CurrentPosition)
                    .updateValue(this.lastPosition)
                this.log('Updated CurrentPosition: %s', this.lastPosition)
            }

            if (message[this.mqttShutterName].hasOwnProperty('Direction')) {
                // update PositionState (open = 0 = DECREASING, close = 1 = INCREASING, stop = 2 = STOPPED)
                switch(parseInt(message[this.mqttShutterName]['Direction'])) {
                    case -1:
                        this.currentPositionState = 0
                        this.service
                            .getCharacteristic(this.api.hap.Characteristic.PositionState)
                            .updateValue(this.currentPositionState)
                        this.log('Updated PositionState: %s', this.currentPositionState)
                        break
                    case 1:
                        this.currentPositionState = 1
                        this.service
                            .getCharacteristic(this.api.hap.Characteristic.PositionState)
                            .updateValue(this.currentPositionState)
                        this.log('Updated PositionState: %s', this.currentPositionState)
                        break
                    case 0:
                        this.currentPositionState = 2
                        this.service
                            .getCharacteristic(this.api.hap.Characteristic.PositionState)
                            .updateValue(this.currentPositionState)
                        this.log('Updated PositionState: %s', this.currentPositionState)
                        break
                    default:
                        this.log('Unknown direction: %s', direction)
                }
            }

            if (message[this.mqttShutterName].hasOwnProperty('Target')) {
                // update TargetPosition
                this.currentTargetPosition = parseInt(message[this.mqttShutterName]['Target'])
                this.service
                    .getCharacteristic(this.api.hap.Characteristic.TargetPosition)
                    .updateValue(this.currentTargetPosition)
                this.log('Updated TargetPosition: %s', this.currentTargetPosition)
            }
        }
    }

    // Homebridge handlers
    onGetCurrentPosition(callback) {
        this.log('Requested CurrentPosition: %s', this.lastPosition)
        callback(null, this.lastPosition)
    }

    onGetPositionState(callback) {
        this.log('Requested PositionState: %s', this.currentPositionState)
        callback(null, this.currentPositionState)
    }

    onGetTargetPosition(callback) {
        this.log('Requested TargetPosition: %s', this.currentTargetPosition)
        callback(null, this.currentTargetPosition)
    }

    onSetTargetPosition(pos, callback) {
        this.log('Set TargetPosition: %s', pos)           
        // multiple instances of this class might conflict with each other
        // especially if using RF remotes behind the scene
        // So create a 'counter' which will help on synchronization
        var delay = 1500 // ms

        setTimeout(() => {
            this.log('Set TargetPosition after delay: %d', counter * delay)
            this.mqttClient.publish(this.mqttCommandTopic, pos.toString(), this.mqttOptions)
            counter--
            if (counter < 0) {
                counter = 0
            }
            callback(null)
        }, counter * delay)
        counter++
    }
}

module.exports = MqttTasmotaBlindsAccessory

