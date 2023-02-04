var MqttTasmotaBase = require('./base')


class MqttTasmotaBaseAccessory extends MqttTasmotaBase {

    constructor(log, config, api) {

        super(log, config, api)

        // CONFIG vars
        this.name = config['name']
        this.manufacturer = config['manufacturer'] || ''
        this.model = config['model'] || ''
        this.serialNumberMAC = config['serialNumberMAC'] || ''

        // MQTT Last Will and Testament topic
        this.mqttLWTTopic = config['lwtTopic'] || this.buildTopic('tele', 'LWT')
        this.log('LWT Status subscribe %s', this.mqttLWTTopic)
        this.mqttClient.subscribe(this.mqttLWTTopic)
        this.lwtStatus = 'Offline'
    }

    // Homebridge callback to get service list
    getServices() {
        var services = []

        this.informationService = new this.api.hap.Service.AccessoryInformation()
        this.informationService
            .setCharacteristic(this.api.hap.Characteristic.Name, this.name)
            .setCharacteristic(this.api.hap.Characteristic.Manufacturer, this.manufacturer)
            .setCharacteristic(this.api.hap.Characteristic.Model, this.model)
            .setCharacteristic(this.api.hap.Characteristic.SerialNumber, this.serialNumberMAC)
        services.push(this.informationService)


        if (this.service !== null) {
            services.push(this.service)
        }

        return services
    }

    // MQTT handlers
    onMqttMessage(topic, message) {

        if (super.onMqttMessage(topic, message)) {
             return true
        }

        if (topic == this.mqttLWTTopic) {
            var state = message.toString('utf-8')
            this.log('LWT Status received %s, %s', topic, state)
            this.lwtStatus = state
            return true
        }

        return false
    }

    currentStatusCode() {
        return this.lwtStatus == 'Offline' ? -1 : null
    }
}

module.exports = MqttTasmotaBaseAccessory
