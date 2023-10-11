var mqtt = require('mqtt')


class MqttTasmotaBase {

    constructor(log, config, api, autoConnect=true) {
        // GLOBAL vars
        this.debug = config['debug'] || false
        this.log = function(...args) { if (this.debug) {log(...args)}}
        this.config = config
        this.api = api

        // MQTT vars
        this.mqttDebug = config['debug'] || false
        this.mqttUrl = config['url']
        this.mqttUsername = config['username']
        this.mqttPassword = config['password']
        this.mqttClientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8)

        // MQTT topics, as seen in Tasmota screen
        this.mqttTopic = config['topic']
        this.mqttFullTopic = config['fullTopic'] || '%prefix%/%topic%/'

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

        if (autoConnect) {
            this.connectMqttClient()
        }
    }

    buildTopic(prefix, command) {
        let t = this.mqttFullTopic.replace('%prefix%', prefix)
        t = t.replace('%topic%', this.mqttTopic)
        t += command

        if (this.mqttDebug) {
            this.log('Built topic = "%s"', t)
        }

        return t
    }

    connectMqttClient() {
        this.log('Connecting to MQTT broker on %s', this.mqttUrl)
        this.mqttClient = mqtt.connect(this.mqttUrl, this.mqttOptions)
        this.mqttClient.on('error', this.onMqttError.bind(this))
        this.mqttClient.on('connect', this.onMqttConnect.bind(this))
        this.mqttClient.on('message', this.onMqttMessage.bind(this))        
    }

    onMqttError(e) {
        this.log('Error event on MQTT', e.message)
    }
 
    onMqttConnect() {
        this.log('MQTT client connected')
    }
 
    onMqttMessage(topic, message) {
        if (this.mqttDebug) {
            this.log('Message received %s, %s', topic, message.toString('utf-8'))
        }
        return false
    }
}

module.exports = MqttTasmotaBase
