var MqttTasmotaBase = require('./base')


class MqttTasmotaBaseAccessory extends MqttTasmotaBase {

    constructor(log, config, api) {

        super(log, config, api)

        // CONFIG vars
        this.name = config['name']
        this.manufacturer = config['manufacturer'] || ''
        this.model = config['model'] || ''
        this.serialNumberMAC = config['serialNumberMAC'] || ''
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
