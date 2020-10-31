var mqtt = require('mqtt')


class MqttTasmotaBaseAccessory {

    constructor(log, config, api) {
        // GLOBAL vars
        this.log = log
        this.config = config
        this.api = api

        // CONFIG vars
        this.name = config['name']
        this.manufacturer = config['manufacturer'] || ''
        this.model = config['model'] || ''
        this.serialNumberMAC = config['serialNumberMAC'] || ''

        // MQTT vars
        this.mqttUrl = config['mqttBrokerUrl']
        this.mqttUsername = config['mqttUsername']
        this.mqttPassword = config['mqttPassword']
        this.mqttClientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8)

        // MQTT options
        this.mqttOptions = {
            keepalive: 10,
            clientId: this.mqttClientId,
            protocolId: 'MQTT',
            protocolVersion: 4,
            clean: true,
            reconnectPeriod: 1000,
            connectTimeout: 30 * 1000,
            username: this.mqttUsername,
            password: this.mqttPassword,
            rejectUnauthorized: false
        }

        this.log('Connecting to MQTT broker on %s', this.mqttUrl)
        this.mqttClient = mqtt.connect(this.mqttUrl, this.mqttOptions)
        this.mqttClient.on('error', this.onMqttError.bind(this))
        this.mqttClient.on('connect', this.onMqttConnect.bind(this))
        this.mqttClient.on('message', this.onMqttMessage.bind(this))
    }

    onMqttError() {
        this.log('Error event on MQTT')
    }
 
    onMqttConnect() {
        this.log('MQTT client connected')
    }
 
    onMqttMessage(topic, message) {
        // nothing to do here, should be subclassed
        this.log('Message received %s, %s', topic, message.toString('utf-8'))
    }
 
    // Homebridge callback to get service list
    getServices() {
        var services = []

        var informationService = new this.api.hap.Service.AccessoryInformation()
        informationService
            .setCharacteristic(this.api.hap.Characteristic.Name, this.name)
            .setCharacteristic(this.api.hap.Characteristic.Manufacturer, this.manufacturer)
            .setCharacteristic(this.api.hap.Characteristic.Model, this.model)
            .setCharacteristic(this.api.hap.Characteristic.SerialNumber, this.serialNumberMAC)
        services.push(informationService)

        if (this.service !== null) {
            services.push(this.service)
        }

        return services
    }
}

module.exports = MqttTasmotaBaseAccessory
