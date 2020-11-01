var mqtt = require('mqtt')


class MqttTasmotaBase {

    constructor(log, config, api) {
        // GLOBAL vars
        this.log = log
        this.config = config
        this.api = api

        // MQTT vars
        this.mqttUrl = config['url']
        this.mqttUsername = config['username']
        this.mqttPassword = config['password']
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
        // this.log('Message received %s, %s', topic, message.toString('utf-8'))
    }
}

module.exports = MqttTasmotaBase
