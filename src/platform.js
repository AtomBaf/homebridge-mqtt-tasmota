var MqttTasmotaBase = require('./base')


const moduleIds = {
    // switch
    2: {
        accessories: ['mqtt-tasmota-switch']
    },
    // fan
    71: {
        accessories: ['mqtt-tasmota-fan']
        // accessories: ['mqtt-tasmota-fan', 'mqtt-tasmota-switch']
    }
}

class MqttTasmotaPlatform extends MqttTasmotaBase {
    constructor(log, config, api) {

        super(log, config, api)

        // MQTT vars
        this.mqttTopic = config['topic'] || 'tasmotas'
        this.mqttCommandTopic = config['commandTopic'] || 'cmnd/' + this.mqttTopic + '/State0'
        this.mqttStatusTopic = config['statusTopic'] || 'stat/+/STATUS'

        // STATE vars
        this.accessories = []

        this.api.on('didFinishLaunching', this.onDidFinishLaunching.bind(this))
    }

    configureAccessory(accessory) {
        this.accessories.push(accessory)
    }

    // MQTT handler
    onMqttMessage(topic, message) {

        super.onMqttMessage(topic, message)

        log.info('Receiving discovery topic %s', topic)
        // message looks like this
        // {"Status":{"Module":43,"DeviceName":"switch_garage_rig","FriendlyName":["switch_garage_rig"],"Topic":"switch_garage_rig","ButtonTopic":"0","Power":1,"PowerOnState":3,"LedState":1,"LedMask":"FFFF","SaveData":1,"SaveState":1,"SwitchTopic":"0","SwitchMode":[0,0,0,0,0,0,0,0],"ButtonRetain":0,"SwitchRetain":0,"SensorRetain":0,"PowerRetain":0}}
        message = JSON.parse(message.toString('utf-8'))

        if (message.hasOwnProperty('Module') && message.hasOwnProperty('DeviceName') && message.hasOwnProperty('Topic')) {
            const deviceModuleId = parseInt(message.hasOwnProperty('Module'))
            const deviceName = message.hasOwnProperty('DeviceName')
            const deviceTopic = message.hasOwnProperty('Topic')

            // check
            if (!moduleIds.hasOwnProperty(deviceModuleId)) {
                log.info('Unable to handle module id %d for %s', deviceModuleId, deviceName)
                return
            }

            for (var i = 0; i < moduleIds.deviceModuleId.accessories.length ; i++) {
                const accessoryPlugin = moduleIds.deviceModuleId.accessories[i]
                const uuidSeed = '' + deviceModuleId + '-' + accessoryPlugin + '-' + i
                const uuid = api.hap.uuid.generate(uuidSeed)

                // check the accessory was not restored from cache
                if (!this.accessories.find(accessory => accessory.UUID === uuid)) {

                    // create a new accessory
                    const accessory = new this.api.platformAccessory(deviceName, uuid)

                    // register the accessory
                    log.info('Registering discovered accessory type %s for %s with UUID %s', accessoryPlugin, deviceName, uuid)
                    this.api.registerPlatformAccessories(accessoryPlugin, 'mqtt-tasmota', [accessory])
                }
            }
        }
    }

    // Homebridge handlers
    onDidFinishLaunching() {
        this.log('Starting accessory discovery')
        this.mqttClient.subscribe(this.mqttStatusTopic)
        this.mqttClient.publish(this.mqttCommandTopic, null, this.mqttOptions)
    }
}

module.exports = MqttTasmotaPlatform
