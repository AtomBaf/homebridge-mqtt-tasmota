var MqttTasmotaBaseAccessory = require('./accessory')


class MqttTasmotaLightBulbAccessory extends MqttTasmotaBaseAccessory {

    constructor(log, config, api) {

        super(log, config, api)

        // device setup
        this.icon = config['icon'] || 'lightbulb'

        // TASMOTA vars
        this.mqttIndex = config['index'] || ''
        this.mqttResultTopic = config['resultTopic'] || this.buildTopic('stat', 'RESULT' )
        this.mqttCommandTopic = config['commandTopic'] || this.buildTopic('cmnd', 'POWER' + this.mqttIndex)
        this.mqttCommandStateTopic = config['commandStateTopic'] || this.buildTopic('cmnd', 'STATE')
        this.mqttCommandHueTopic = config['commandHueTopic'] || this.buildTopic('cmnd', 'hsbcolor1' + this.mqttIndex)
        this.mqttCommandSaturationTopic = config['commandSaturationTopic'] || this.buildTopic('cmnd', 'hsbcolor2' + this.mqttIndex)
        this.mqttCommandBrightnessTopic = config['commandBrightnessTopic'] || config['commandDimmerTopic'] || this.buildTopic('cmnd', 'Dimmer' + this.mqttIndex)
        this.mqttTeleTopic = config['teleTopic'] || this.buildTopic('tele', 'STATE')

        // STATE vars
        this.currentPower = 'OFF'; // last known power (OFF)
        this.currentHue = 0; // last known hue (0)
        this.currentSaturation = 0; // last known saturation (0)
        this.currentBrightness = 100; // last known brightness (100)

        this.mqttClient.subscribe(this.mqttResultTopic)
        this.mqttClient.subscribe(this.mqttTeleTopic)

        switch (this.icon) {
            case 'switch':
                this.service = new this.api.hap.Service.Switch(this.name)
                break;
            case 'lightbulb':
                this.service = new this.api.hap.Service.Lightbulb(this.name)
                break;
            default:
                this.log('Unknown icon type "' + this.icon + '", defaulting to "lightbulb"');
                this.service = new this.api.hap.Service.Lightbulb(this.name)
        }

        this.service
            .getCharacteristic(this.api.hap.Characteristic.On)
            .on('get', this.onGetOn.bind(this))
            .on('set', this.onSetOn.bind(this))

        // send a state MQTT command to get the initial state
        this.mqttClient.publish(this.mqttCommandStateTopic, null, this.mqttOptions)
    }

    // MQTT handler
    onMqttMessage(topic, message) {

        super.onMqttMessage(topic, message)

        // this callback can be called from both the STAT topic and the TELE topic
        // JSON format is nearly the same, eg:
        //  - TELE : {...,"POWER":"OFF",...}
        //  - STAT : {"POWER":"OFF"}
        // Examples:
        //  - STAT for LightBulb w/ HSB:
        //    {..., "POWER":"OFF","Dimmer":0,"Color":"000000","HSBColor":"30,67,0","Channel":[0,0,0],"Scheme":0,"Fade":"OFF","Speed":1,"LedTable":"ON",...}
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

        var isHue1 = message.hasOwnProperty('HSBColor') && this.mqttIndex == 1
        var isHueN = message.hasOwnProperty('HSBColor' + this.mqttIndex)

        if (isHue1 || isHueN) {
            if (!this.service.testCharacteristic(this.api.hap.Characteristic.Hue)) {
                this.log('Adding Hue Characteristic')
                this.service
                    .getCharacteristic(this.api.hap.Characteristic.Hue)
                    .on('get', this.onGetHue.bind(this))
                    .on('set', this.onSetHue.bind(this));
            }
            // update CurrentHue
            this.currentHue = isHue1 ? message['HSBColor'] : message['HSBColor' + this.mqttIndex]
            this.currentHue = parseInt(this.currentHue.split(',')[0])
            this.service
                .getCharacteristic(this.api.hap.Characteristic.Hue)
                .updateValue(this.currentHue)
            this.log('Updated CurrentHue: %d', this.currentHue)
        }

        var isSaturation1 = message.hasOwnProperty('HSBColor') && this.mqttIndex == 1
        var isSaturationN = message.hasOwnProperty('HSBColor' + this.mqttIndex)

        if (isSaturation1 || isSaturationN) {
            if (!this.service.testCharacteristic(this.api.hap.Characteristic.Saturation)) {
                this.log('Adding Saturation Characteristic')
                this.service
                    .getCharacteristic(this.api.hap.Characteristic.Saturation)
                    .on('get', this.onGetSaturation.bind(this))
                    .on('set', this.onSetSaturation.bind(this));
            }
            // update CurrentSaturation
            this.currentSaturation = isSaturation1 ? message['HSBColor'] : message['HSBColor' + this.mqttIndex]
            this.currentSaturation = parseInt(this.currentSaturation.split(',')[1])
            this.service
                .getCharacteristic(this.api.hap.Characteristic.Saturation)
                .updateValue(this.currentSaturation)
            this.log('Updated CurrentSaturation: %d', this.currentSaturation)
        }

        var isDimmer1 = message.hasOwnProperty('Dimmer') && this.mqttIndex == 1
        var isDimmerN = message.hasOwnProperty('Dimmer' + this.mqttIndex)

        if (isDimmer1 || isDimmerN) {
            if (!this.service.testCharacteristic(this.api.hap.Characteristic.Brightness)) {
                this.log('Adding Brightness Characteristic')
                this.service
                    .getCharacteristic(this.api.hap.Characteristic.Brightness)
                    .on('get', this.onGetBrightness.bind(this))
                    .on('set', this.onSetBrightness.bind(this));
            }
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

    onGetHue(callback) {
        this.log('Requested CurrentHue: %d', this.currentHue)
        callback(null, this.currentHue)
    }

    onSetHue(hue, callback) {
        this.log('Set Hue: %d', hue)
        this.currentHue = hue
        this.mqttClient.publish(this.mqttCommandHueTopic, "" + this.currentHue, this.mqttOptions)
        callback(null)
    }

    onGetSaturation(callback) {
        this.log('Requested CurrentSaturation: %d', this.currentSaturation)
        callback(null, this.currentSaturation)
    }

    onSetSaturation(saturation, callback) {
        this.log('Set Saturation: %d', saturation)
        this.currentSaturation = saturation
        this.mqttClient.publish(this.mqttCommandSaturationTopic, "" + this.currentSaturation, this.mqttOptions)
        callback(null)
    }

    onGetBrightness(callback) {
        this.log('Requested CurrentBrightness: %d', this.currentBrightness)
        callback(null, this.currentBrightness)
    }

    onSetBrightness(brightness, callback) {
        this.log('Set Brightness: %d', brightness)
        this.currentBrightness = brightness
        this.mqttClient.publish(this.mqttCommandBrightnessTopic, "" + this.currentBrightness, this.mqttOptions)
        callback(null)
    }

}

module.exports = MqttTasmotaLightBulbAccessory

