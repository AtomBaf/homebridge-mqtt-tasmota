var MqttTasmotaBase = require('./base')
var MqttTasmotaBlindsAccessory = require('./blinds')
var MqttTasmotaSwitchAccessory = require('./switch')
var MqttTasmotaFanAccessory = require('./fan')


const moduleIds = {
    // switch
    2: {
        accessories: [MqttTasmotaSwitchAccessory]
    },
    // fan
    71: {
        accessories: [MqttTasmotaFanAccessory]
        // accessories: ['mqtt-tasmota-fan', 'mqtt-tasmota-switch']
    }
}

class MqttTasmotaPlatform extends MqttTasmotaBase {
    constructor(log, config, api) {

        super(log, config, api, false)

        // MQTT vars
        this.mqttTopic = config['topic'] || 'tasmotas'
        this.mqttCommandTopic = config['commandTopic'] || 'cmnd/' + this.mqttTopic + '/Status0'
        this.mqttStatusTopic = config['statusTopic'] || 'stat/+/STATUS'

        // STATE vars
        this.accessories = []

        this.log('Now waiting for launch finish')
        this.api.on('didFinishLaunching', this.onDidFinishLaunching.bind(this))
    }

    onMqttConnect() {
        super.onMqttConnect()

        this.log('Starting accessory discovery')
        this.mqttClient.subscribe(this.mqttStatusTopic)
        this.mqttClient.publish(this.mqttCommandTopic, '', this.mqttOptions)
    }

    // MQTT handler
    onMqttMessage(topic, message) {

        super.onMqttMessage(topic, message)

        this.log.info('Receiving discovery topic %s', topic)
        // message looks like this
        // {"Status":{"Module":43,"DeviceName":"switch_garage_rig","FriendlyName":["switch_garage_rig"],"Topic":"switch_garage_rig","ButtonTopic":"0","Power":1,"PowerOnState":3,"LedState":1,"LedMask":"FFFF","SaveData":1,"SaveState":1,"SwitchTopic":"0","SwitchMode":[0,0,0,0,0,0,0,0],"ButtonRetain":0,"SwitchRetain":0,"SensorRetain":0,"PowerRetain":0}}
        message = JSON.parse(message.toString('utf-8'))

        if (!message.hasOwnProperty('Status')) {
            return
        }
        message = message['Status']
        this.log(message, message.hasOwnProperty('Module') && message.hasOwnProperty('DeviceName') && message.hasOwnProperty('Topic'))
        if (message.hasOwnProperty('Module') && message.hasOwnProperty('DeviceName') && message.hasOwnProperty('Topic')) {
            const deviceModuleId = parseInt(message['Module'])
            const deviceName = message['DeviceName']
            const deviceTopic = message['Topic']

            if(deviceTopic !== 'switch_kitchen') {
                //TESTING  
                return
            }

            // check
            if (!moduleIds.hasOwnProperty(deviceModuleId)) {
                this.log.info('Unable to handle module id %d for %s', deviceModuleId, deviceName)
                return
            }

            for (var i = 0; i < moduleIds[deviceModuleId].accessories.length ; i++) {
                const accessoryPlugin = moduleIds[deviceModuleId].accessories[i]
                const uuidSeed = '' + deviceModuleId + '-' + accessoryPlugin + '-' + i
                const uuid = this.api.hap.uuid.generate(uuidSeed)

                this.log.info('Checking discovered accessory type %s for %s with UUID seed %s, UUID %s', accessoryPlugin, deviceName, uuidSeed, uuid)

                // check the accessory was not restored from cache
                if (!this.accessories.find(accessory => accessory.UUID === uuid)) {

                    // create a new accessory
                    const accessory = new this.api.platformAccessory(deviceName, uuid)

                    // homebridge accessory API is just a wrapper around parameters
                    // add an actual instance of the accessory, just like if it was
                    // a simple accessory
                    accessory.pluginInstance = accessoryPlugin(this.log, this.config, this.api)

                    // register the accessory
                    this.log.info('Registering discovered accessory type %s for %s with UUID %s', accessoryPlugin, deviceName, uuid)
                    this.api.registerPlatformAccessories('homebridge-mqtt-tasmota', 'mqtt-tasmota', [accessory])
                }
            }
        }
    }

    // Homebridge handlers
    onDidFinishLaunching() {
        this.log('Launch finished, connecting MQTT client')
        super.connectMqttClient()
    }

    configureAccessory(accessory) {
        this.log.info('Configuring accessory %s', accessory)
        this.accessories.push(accessory)
    }
}

module.exports = MqttTasmotaPlatform
